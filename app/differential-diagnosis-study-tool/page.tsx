"use client";

import { useEffect, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";
import { Chat } from "@/components/chat_askquestion";
import { Providers } from "@/components/providers";
import HistoryMarkingForm from "@/components/history_marking_form"; // Corrected import name casing if necessary
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
  const [rightCondition, setRightCondition] = useState<string>("");
  const [category, setCategory] = useState<string>(""); // 1. Add state for category
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
        const res = await fetch(`${apiUrl}/generate-history/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ random: true }),
        });

        if (!res.ok) {
          throw new Error(`API responded with status ${res.status}`);
        }

        const data = await res.json();
        setHistory(data.history);
        setRightCondition(data.right_condition);
        // 2. Set category from API response. Provide a fallback if it might be missing.
        setCategory(data.category || "General"); // Assuming API returns 'data.category'
        setHistoryLoadedAt(Date.now());
      } catch (error) {
        console.error("Error fetching history:", error);
        setCategory("General"); // Fallback category in case of error
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

        {loading && (
          <div className="flex justify-center items-center min-h-screen">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && (
          <>
            <Chat
              className="mx-auto max-w-2xl px-4 mt-4"
              history={history ? JSON.stringify(history) : ""}
              setConversationLogs={setConversationLogs}
            />
            <div className="mx-auto max-w-2xl px-4 mt-8 mb-32">
              {/* 4. Ensure category is loaded before rendering HistoryMarkingForm */}
              {history && historyLoadedAt && typeof category === 'string' && (
                <HistoryMarkingForm
                  expectedHistory={JSON.stringify(history)}
                  historyLoadedAt={historyLoadedAt}
                  questionsCount={questionsCount}
                  correctCondition={rightCondition}
                  conversationLogs={conversationLogs}
                  category={category} // 3. Pass category prop
                />
              )}
            </div>
          </>
        )}
      </div>
    </Providers>
  );
}