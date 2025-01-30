"use client";

import { useEffect, useState } from "react";
import { useChat, type Message } from "ai/react";
import { Toaster } from "react-hot-toast";
import { Chat } from "@/components/chat";
import { Providers } from "@/components/providers";

export default function HistoryPage() {
  const [history, setHistory] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState<boolean>(false);
  const { messages, append, input, setInput } = useChat();
  const [chatUpdated, setChatUpdated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // ✅ Added loading state

  useEffect(() => {
    const fetchHistory = async () => {
      if (historyLoaded) return;

      console.log("Fetching patient history...");
      setLoading(true);

      try {
        const res = await fetch("http://127.0.0.1:8000/generate-history/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        console.log("History API Response:", res);

        if (!res.ok) {
          throw new Error(`API responded with status ${res.status}`);
        }

        const data = await res.json();
        console.log("Parsed History Data:", data);

        if (data.history) {
          console.log("Setting history state...");
          setHistory(data.history);
          setChatUpdated(prev => !prev);
        } else {
          console.warn("No history found in API response:", data);
          setHistory("No patient history found.");
        }

        setHistoryLoaded(true);
      } catch (error) {
        console.error("Error fetching history:", (error as Error).message);
        setHistory(`Failed to load history: ${(error as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [historyLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    console.log("User input detected:", input);
    append({ role: "user", content: input } as Message);
    setInput("");

    try {
      console.log("Sending request to Ask-Question API...");
      const res = await fetch("http://127.0.0.1:8000/ask-question/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ question: input, history }),
      });

      console.log("Ask-Question API Response:", res);

      if (!res.ok) {
        throw new Error(`Ask-Question API error: ${res.status}`);
      }

      const data = await res.json();
      console.log("Parsed Ask-Question Response:", data);

      if (data.answer) {
        console.log("Appending AI response...");
        append({ role: "assistant", content: data.answer } as Message);
      } else {
        console.warn("No answer received:", data);
        append({ role: "assistant", content: "No response received." } as Message);
      }
    } catch (error) {
      console.error("Error sending question:", (error as Error).message);
      append({ role: "assistant", content: `Failed to get a response: ${(error as Error).message}` } as Message);
    }
  };

  return (
    <Providers attribute="class" defaultTheme="system" enableSystem>
      <div className="flex flex-col min-h-screen">
        <Toaster />

        {/* ✅ Only the Patient History Box remains, removing duplicate welcome box */}
        {history && (
          <div className="mx-auto max-w-2xl px-4 mt-6">
            <div className="rounded-lg border bg-background p-8">
              <h2 className="mb-2 text-lg font-semibold">Patient History</h2>
              <p className="leading-normal text-muted-foreground">{history}</p>
            </div>
          </div>
        )}

        {/* ✅ Chat Box */}
        <Chat id="history" key={String(chatUpdated)} onSubmit={handleSubmit} />
      </div>
    </Providers>
  );
}
