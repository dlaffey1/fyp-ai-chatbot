"use client";

import { useEffect, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";
import { Chat } from "@/components/chat_askquestion";
import { Providers } from "@/components/providers";
import { HistoryMarkingForm } from "@/components/history_marking_form";
import { useApiUrl } from "@/config/contexts/api_url_context";

interface HistoryData {
  PC: string;
  HPC: string;
  PMHx: string;
  DHx: string;
  FHx: string;
  SHx: string;
  SR: string;
}

export default function ChatPage() {
  const [history, setHistory] = useState<HistoryData | null>(null);
  // Store the mimic condition number (ICD code) returned by the API.
  const [rightCondition, setRightCondition] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [historyLoadedAt, setHistoryLoadedAt] = useState<number | null>(null);
  const [questionsCount, setQuestionsCount] = useState<number>(0);
  const [conversationLogs, setConversationLogs] = useState<string>("");
  const hasFetchedRef = useRef(false);
  const { apiUrl } = useApiUrl();

  useEffect(() => {
    console.log("Conversation logs updated:", conversationLogs);
  }, [conversationLogs]);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        // Call the endpoint with the random flag to force random selection.
        const res = await fetch(`${apiUrl}/generate-history/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ random: true }), // random flag added here
        });

        if (!res.ok) {
          throw new Error(`API responded with status ${res.status}`);
        }

        const data = await res.json();
        setHistory(data.history);
        setRightCondition(data.right_condition); // Extract and set the correct condition.
        // Record the time when the history is successfully loaded.
        setHistoryLoadedAt(Date.now());
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [apiUrl]);

  return (
    <Providers attribute="class" defaultTheme="system" enableSystem>
      <div className="flex flex-col min-h-screen">
        <Toaster />

        {/* Show Loading Spinner */}
        {loading && (
          <div className="flex justify-center items-center min-h-screen">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Chat section (only visible when history is loaded) */}
        {!loading && (
          <>
            <Chat
              className="mx-auto max-w-2xl px-4 mt-4"
              history={history ? JSON.stringify(history) : ""}
              // Pass the callback so that the Chat component updates conversation logs.
              setConversationLogs={setConversationLogs}
            />
            {/* Add the History Marking Form below the Chat section with increased bottom margin */}
            <div className="mx-auto max-w-2xl px-4 mt-8 mb-32">
              {history && historyLoadedAt && (
                <HistoryMarkingForm
                  expectedHistory={JSON.stringify(history)}
                  historyLoadedAt={historyLoadedAt}
                  questionsCount={questionsCount}
                  correctCondition={rightCondition} // Pass the extracted correct condition.
                  conversationLogs={conversationLogs}
                />
              )}
            </div>
          </>
        )}
      </div>
    </Providers>
  );
}
