"use client";

import React, { useState, useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";
import { ThemeToggle } from "@/components/theme-toggle";

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
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // On mount, fetch the structured patient history from the history generation endpoint.
  useEffect(() => {
    async function fetchPatientHistory() {
      try {
        const res = await fetch(
          "https://final-year-project-osce-simulator-1.onrender.com/generate-history/",
          { method: "POST" }
        );
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        const history = data.history;
        setPatientHistory(history);
        // Build an initial system message with the detailed patient history.
        const systemContent = `Patient History:
PC: ${history.PC}
HPC: ${history.HPC}
PMHx: ${history.PMHx}
DHx: ${history.DHx}
FHx: ${history.FHx}
SHx: ${history.SHx}
SR: ${history.SR}`;
        const systemMessage = { role: "system", content: systemContent };
        const initialAssistant = {
          role: "assistant",
          content: "Hello, I'm John. How are you feeling today?",
        };
        setMessages([systemMessage, initialAssistant]);
      } catch (error) {
        console.error("Error fetching patient history:", error);
      }
    }
    fetchPatientHistory();
  }, []);

  // Setup Speech Recognition using the Web Speech API.
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        sendMessage(transcript);
      };
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognitionRef.current = recognition;
    }
  }, []);

  // Function to start listening to the microphone.
  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Function to send a message to the realtime chat API.
  async function sendMessage(newMessage: string) {
    // Append user message.
    const updatedMessages = [...messages, { role: "user", content: newMessage }];
    setMessages(updatedMessages);
    try {
      // Pass both conversation messages and the patient history in the payload.
      const res = await fetch("http://localhost:8000/realtime/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, history: patientHistory }),
      });
      if (!res.ok) {
        throw new Error(`API responded with status ${res.status}`);
      }
      const data = await res.json();
      const aiResponse = data.response;
      setMessages([...updatedMessages, { role: "assistant", content: aiResponse }]);
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
          <button
            onClick={startListening}
            className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-md"
            disabled={isListening}
          >
            {isListening ? "Listening..." : "Speak"}
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
    </div>
  );
}
