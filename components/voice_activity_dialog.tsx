"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceActivityDialogProps {
  open: boolean;
  onClose: () => void;
}

const VoiceActivityDialog: React.FC<VoiceActivityDialogProps> = ({ open, onClose }) => {
  const [volume, setVolume] = useState(0);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    async function setupAudio() {
      try {
        // Get a new audio stream for analysis.
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;

        const animate = () => {
          if (analyserRef.current && dataArrayRef.current) {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);
            // Calculate average volume.
            let sum = 0;
            for (let i = 0; i < dataArrayRef.current.length; i++) {
              sum += dataArrayRef.current[i];
            }
            const avg = sum / dataArrayRef.current.length;
            setVolume(avg);
          }
          animationRef.current = requestAnimationFrame(animate);
        };
        animate();
      } catch (err) {
        console.error("Error setting up audio analysis:", err);
      }
    }

    if (open) {
      setupAudio();
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [open]);

  // Here we render a circle with 10 columns along its circumference.
  const columnCount = 10;
  const columns = Array.from({ length: columnCount }).map((_, i) => {
    const angle = (i / columnCount) * 2 * Math.PI;
    const x1 = 50 + 40 * Math.cos(angle);
    const y1 = 50 + 40 * Math.sin(angle);
    // The line length is modulated by volume: base length 5 + up to 10 extra pixels.
    const lineLength = 5 + Math.min(volume / 10, 10);
    const x2 = 50 + (40 + lineLength) * Math.cos(angle);
    const y2 = 50 + (40 + lineLength) * Math.sin(angle);
    return (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    );
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="p-4">
        <DialogHeader>
          <DialogTitle>Voice Activity</DialogTitle>
          <DialogDescription>
            Your voice is being analyzed in real time.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center items-center my-4">
          <svg className="w-24 h-24" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="4" fill="none" />
            <g>{columns}</g>
          </svg>
        </div>
        <div className="mt-4 text-right">
          <DialogClose
            onClick={onClose}
            className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-md"
          >
            Stop Listening
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceActivityDialog;
