"use client";

import React, { useState, useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import VoiceActivityDialog from "@/components/voice_activity_dialog"; // adjust the import path as needed
import { useApiUrl } from "@/config/contexts/api_url_context"; // Global API URL context

interface HistoryData {
  PC: string;
  HPC: string;
  PMHx: string;
  DHx: string;
  FHx: string;
  SHx: string;
  SR: string;
}

export default function RealtimeChatPage() {
  const [messages, setMessages] = useState<
    { role: "system" | "user" | "assistant"; content: string }[]
  >([]);
  const [patientHistory, setPatientHistory] = useState<HistoryData | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { apiUrl } = useApiUrl();
  // On mount, fetch the structured patient history.
  useEffect(() => {
    async function fetchPatientHistory() {
      try {
        const res = await fetch(
          `${apiUrl}/generate-history/`,
          { method: "POST" }
        );
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        const history = data.history;
        setPatientHistory(history);
        // Build an initial system message from the history.
        const systemContent = `Patient History:
PC: ${history.PC}
HPC: ${history.HPC}
PMHx: ${history.PMHx}
DHx: ${history.DHx}
FHx: ${history.FHx}
SHx: ${history.SHx}
SR: ${history.SR}`;
        const systemMessage = { role: "system" as const, content: systemContent };
        const initialAssistant = {
          role: "assistant" as const,
          content: "Hi doctor, how can I help you today?",
        };
        setMessages([systemMessage, initialAssistant]);
      } catch (error) {
        console.error("Error fetching patient history:", error);
      }
    }
    fetchPatientHistory();
  }, []);

  // Setup MediaRecorder for recording audio.
  useEffect(() => {
    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          audioChunksRef.current = [];
          // Transcribe the audio via your backend Whisper endpoint.
          try {
            const formData = new FormData();
            formData.append("file", audioBlob, "recording.wav");
            const res = await fetch(`${apiUrl}/realtime-endpoints/transcribe/`, {
              method: "POST",
              body: formData,
            });
            if (!res.ok) throw new Error(`Transcription error: ${res.status}`);
            const data = await res.json();
            const transcript = data.text;
            setInputText(transcript);
            // Automatically send the transcribed text as a chat message.
            sendMessage(transcript);
          } catch (err) {
            console.error("Error transcribing audio:", err);
          }
        };
        mediaRecorderRef.current = recorder;
      } catch (error) {
        console.error("Error initializing media devices:", error);
      }
    }
    initMedia();
  }, []);

  // When the mic button is clicked, start recording and open the dialog.
  const handleStartRecording = () => {
    if (mediaRecorderRef.current) {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setDialogOpen(true);
    }
  };

  // When the dialog is closed (via the stop button or clicking outside), stop recording.
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setDialogOpen(false);
    }
  };

  // Function to send a text message to the realtime chat API.
  async function sendMessage(newMessage: string) {
    const updatedMessages = [...messages, { role: "user" as const, content: newMessage }];
    setMessages(updatedMessages);
    try {
      const res = await fetch(`${apiUrl}/realtime-endpoints/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, history: patientHistory }),
      });
      if (!res.ok) {
        throw new Error(`API responded with status ${res.status}`);
      }
      const data = await res.json();
      const aiResponse = data.response;
      setMessages([...updatedMessages, { role: "assistant" as const, content: aiResponse }]);
      speak(aiResponse);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  // Function to speak the AI response using the Web Speech API.
  function speak(text: string) {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Realtime Patient Conversation
        </h1>
        <ThemeToggle />
      </div>
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-md p-4">
        <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-md mb-4 h-96 overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 ${
                msg.role === "assistant"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-800 dark:text-gray-100"
              }`}
            >
              <strong>{msg.role === "assistant" ? "Patient" : "You"}:</strong>{" "}
              {msg.content}
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          {/* Mic button that starts recording and opens the voice activity dialog */}
          <button
            onClick={handleStartRecording}
            className="p-2 rounded-md bg-blue-500 dark:bg-blue-600"
          >
            <img src="/mic.png" alt="Record" className="h-6 w-6" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          />
          <button
            onClick={() => {
              sendMessage(inputText);
              setInputText("");
            }}
            className="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-md"
          >
            Send
          </button>
        </div>
      </div>
      {/* Render the VoiceActivityDialog */}
      <VoiceActivityDialog open={dialogOpen} onClose={handleStopRecording} />
    </div>
  );
}
