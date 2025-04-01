"use client";

import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/providers";
import { Chat } from "@/components/chat_askquestion";
import { HistoryAnswerForm } from "@/components/history_answer_form";
import { useApiUrl } from "@/config/contexts/api_url_context";
import ConditionSelector from "@/components/condition-selector";

interface HistoryData {
  PC: string;
  HPC: string;
  PMHx: string;
  DHx: string;
  FHx: string;
  SHx: string;
  SR: string;
}

const SECTION_NAMES: { [key: string]: string } = {
  PC: "Presenting Complaint (PC)",
  HPC: "History of Presenting Complaint (HPC)",
  PMHx: "Past Medical History (PMHx)",
  DHx: "Drug History (DHx)",
  FHx: "Family History (FHx)",
  SHx: "Social History (SHx)",
  SR: "Systems Review (SR)",
};

export default function HistoryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryData | any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const { apiUrl } = useApiUrl();

  // Expecting an object { category, condition } from ConditionSelector.
  const handleConditionSelect = async ({
    category,
    condition,
  }: {
    category: string;
    condition: string;
  }) => {
    // Trim the condition before sending to the API.
    const trimmedCondition = condition.trim();
    console.log("Condition selected:", { category, condition: trimmedCondition });
    setSelectedCategory(category);
    setSelectedCondition(trimmedCondition);
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/generate-history/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ condition: trimmedCondition }),
      });
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setHistory(data.history);
      // Record session start time once history is loaded.
      setSessionStart(Date.now());
    } catch (err) {
      console.error("Error fetching history:", err);
      setHistory(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Providers attribute="class" defaultTheme="system" enableSystem>
      <div className="flex flex-col min-h-screen">
        <Toaster />

        {/* Condition Selector */}
        <div className="mb-6 flex flex-col items-center">
          <ConditionSelector onConditionSelect={handleConditionSelect} />
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center items-center min-h-screen">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Display Structured History */}
        {!loading && history && (
          <div className="mx-auto max-w-2xl px-4 mt-6 space-y-6">
            <h2 className="text-lg font-semibold text-center">Patient History</h2>
            {Object.entries(history).map(([key, value]) => (
              <div key={key} className="rounded-lg border p-8">
                <h2 className="mb-2 text-lg font-semibold">
                  {SECTION_NAMES[key] || key}
                </h2>
                <p className="leading-normal text-muted-foreground">
                  {typeof value === "object" && value !== null
                    ? JSON.stringify(value, null, 2)
                    : value !== undefined
                    ? String(value)
                    : ""}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Chat Section */}
        {!loading && history && (
          <Chat
            className="mx-auto max-w-2xl px-4 mt-4"
            history={JSON.stringify(history)}
          />
        )}

        {/* History Answer Form */}
        {!loading &&
          history &&
          sessionStart &&
          selectedCategory &&
          selectedCondition && (
            <div className="mx-auto max-w-2xl px-4 mt-8 mb-32">
              <h2 className="text-xl font-semibold text-center mb-4">
                Answer the Questions
              </h2>
              <HistoryAnswerForm
                history={JSON.stringify(history)}
                sessionStart={sessionStart}
                category={selectedCategory}
                icdCode={selectedCondition}
                conversationLogs=""
              />
            </div>
          )}
      </div>
    </Providers>
  );
}
