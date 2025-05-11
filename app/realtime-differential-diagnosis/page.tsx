"use client";

import React, { useState, useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import VoiceActivityDialog from "@/components/voice_activity_dialog";
import { useApiUrl } from "@/config/contexts/api_url_context";
import HistoryMarkingForm from "@/components/history_marking_form";
import { Providers } from "@/components/providers";
import { Switch } from "@/components/ui/switch"; // 1. Import Switch component

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
  const [patientHistory, setPatientHistory] = useState<HistoryData | null>(
    null
  );
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { apiUrl } = useApiUrl();
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const hasFetchedHistoryRef = useRef(false);

  const [historyLoadedAt, setHistoryLoadedAt] = useState<number | null>(null);
  const [correctCondition, setCorrectCondition] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [questionsCount, setQuestionsCount] = useState<number>(0);

  // 2. Add state for TTS toggle (default to true/on)
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (hasFetchedHistoryRef.current) return;
    hasFetchedHistoryRef.current = true;

    async function fetchPatientHistory() {
      setIsLoadingHistory(true);
      try {
        const res = await fetch(`${apiUrl}/generate-history/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ random: true }),
        });
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();

        setPatientHistory(data.history);
        setCorrectCondition(data.right_condition || "Unknown");
        setCategory(data.category || "General");
        setHistoryLoadedAt(Date.now());

        const systemContent = `Patient History:
PC: ${data.history.PC}
HPC: ${data.history.HPC}
PMHx: ${data.history.PMHx}
DHx: ${data.history.DHx}
FHx: ${data.history.FHx}
SHx: ${data.history.SHx}
SR: ${data.history.SR}`;
        const systemMessage = { role: "system" as const, content: systemContent };
        const initialAssistant = {
          role: "assistant" as const,
          content: "Hi doctor, how can I help you today?",
        };
        setMessages([systemMessage, initialAssistant]);
      } catch (error) {
        console.error("Error fetching patient history:", error);
        setMessages([{ role: "system", content: "Error loading patient history. Please try refreshing." }]);
        setCorrectCondition("Unknown");
        setCategory("General");
      } finally {
        setIsLoadingHistory(false);
      }
    }
    fetchPatientHistory();
  }, [apiUrl]);

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
            if (transcript.trim()) {
              sendMessage(transcript);
            }
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
  }, [apiUrl]);

  const handleStartRecording = () => {
    if (mediaRecorderRef.current) {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setDialogOpen(true);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setDialogOpen(false);
    }
  };

  // 3. Modify speak function to check isTtsEnabled
  function speak(text: string) {
    if (!isTtsEnabled) { // Check if TTS is enabled
      return;
    }
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech before starting new one
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      // Speech rate is now default, not controlled by a slider
      window.speechSynthesis.speak(utterance);
    }
  }

  async function sendMessage(newMessage: string) {
    if (!newMessage.trim() || !patientHistory) return;

    const updatedMessages = [
      ...messages,
      { role: "user" as const, content: newMessage },
    ];
    setMessages(updatedMessages);
    setQuestionsCount(prevCount => prevCount + 1);
    setInputText("");

    try {
      const res = await fetch(`${apiUrl}/realtime-endpoints/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, history: patientHistory }),
      });
      if (!res.ok) throw new Error(`API responded with status ${res.status}`);
      const data = await res.json();
      const aiResponse = data.response;
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant" as const, content: aiResponse },
      ]);
      speak(aiResponse); // speak function will respect the isTtsEnabled state
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant" as const, content: "Sorry, I encountered an error. Please try again." },
      ]);
    }
  }

  const derivedConversationLogs = messages
    .map(msg => `${msg.role}: ${msg.content}`)
    .join("\n");

  return (
    <Providers attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen p-4 bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Toaster />
        {/* 4. Add Switch to the UI, remove Slider */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Realtime Patient Conversation
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label
                htmlFor="ttsToggle"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
              >
                Speak Responses:
              </label>
              <Switch
                id="ttsToggle"
                checked={isTtsEnabled}
                onCheckedChange={setIsTtsEnabled}
              />
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-grow max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-md p-4 flex flex-col w-full">
          {isLoadingHistory ? (
            <div className="flex justify-center items-center flex-grow">
              <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-md mb-4 h-96 overflow-y-auto flex-grow">
                {messages.map((msg, index) => (
                  (msg.role !== "system" || !msg.content.startsWith("Patient History:")) && (
                    <div
                      key={index}
                      className={`mb-2 ${
                        msg.role === "assistant"
                          ? "text-blue-600 dark:text-blue-400 text-left"
                          : msg.role === "user"
                          ? "text-gray-800 dark:text-gray-100 text-right"
                          : "text-gray-500 dark:text-gray-400 text-xs italic"
                      }`}
                    >
                      <div
                        className={`inline-block p-2 rounded-md ${
                          msg.role === "assistant"
                            ? "bg-blue-100 dark:bg-blue-700"
                            : msg.role === "user"
                            ? "bg-green-100 dark:bg-green-700"
                            : ""
                        }`}
                      >
                        <strong>
                          {msg.role === "assistant"
                            ? "Patient"
                            : msg.role === "user"
                            ? "You"
                            : "System"}
                          :
                        </strong>{" "}
                        {msg.content}
                      </div>
                    </div>
                  )
                ))}
              </div>
              <div className="flex items-center space-x-2 mt-auto">
                <button
                  onClick={handleStartRecording}
                  disabled={isLoadingHistory || isRecording}
                  className="p-2 rounded-md bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50"
                >
                  <img src="/mic.png" alt="Record" className="h-6 w-6" />
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && inputText.trim()) {
                      sendMessage(inputText);
                    }
                  }}
                  placeholder="Type your message or use the mic..."
                  disabled={isLoadingHistory}
                  className="flex-1 border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                />
                <button
                  onClick={() => {
                    if (inputText.trim()) {
                      sendMessage(inputText);
                    }
                  }}
                  disabled={isLoadingHistory || !inputText.trim()}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-md disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>

        {!isLoadingHistory && patientHistory && historyLoadedAt && typeof category === 'string' && correctCondition && (
          <div className="mx-auto max-w-3xl w-full px-4 mt-8 mb-32">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Submit Your Assessment</h2>
            <HistoryMarkingForm
              expectedHistory={JSON.stringify(patientHistory)}
              historyLoadedAt={historyLoadedAt}
              questionsCount={questionsCount}
              correctCondition={correctCondition}
              conversationLogs={derivedConversationLogs}
              category={category}
            />
          </div>
        )}

        <VoiceActivityDialog open={dialogOpen} onClose={handleStopRecording} />
      </div>
    </Providers>
  );
}