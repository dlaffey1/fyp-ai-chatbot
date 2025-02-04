"use client";

import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { Chat } from "@/components/chat_askquestion";
import { Providers } from "@/components/providers";

/**
 * This page:
 *   1) Fetches the patient history from /generate-history/ once.
 *   2) Displays the fetched history for the user to see.
 *   3) Renders a <Chat> that references that same history when calling /ask-question/.
 */
export default function HistoryPage() {
  const [history, setHistory] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

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

  return (
    <Providers attribute="class" defaultTheme="system" enableSystem>
      <div className="flex flex-col min-h-screen">
        <Toaster />

        {/* Display the Patient History (once loaded) */}
        {history && (
          <div className="mx-auto max-w-2xl px-4 mt-6">
            <div className="rounded-lg border bg-background p-8">
              <h2 className="mb-2 text-lg font-semibold">Patient History</h2>
              <p className="leading-normal text-muted-foreground">{history}</p>
            </div>
          </div>
        )}

        {/* 
          Single Chat component 
          - uses your custom logic 
          - sends { question, history } to /ask-question
        */}
        <Chat
          className="mx-auto max-w-2xl px-4 mt-4"
          history={history}
        />
      </div>
    </Providers>
  );
}
