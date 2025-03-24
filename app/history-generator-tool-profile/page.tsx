"use client";

import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/providers";
import { Chat } from "@/components/chat_askquestion";
import { HistoryAnswerForm } from "@/components/history_answer_form";
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

const SECTION_NAMES: { [key: string]: string } = {
  PC: "Presenting Complaint (PC)",
  HPC: "History of Presenting Complaint (HPC)",
  PMHx: "Past Medical History (PMHx)",
  DHx: "Drug History (DHx)",
  FHx: "Family History (FHx)",
  SHx: "Social History (SHx)",
  SR: "Systems Review (SR)",
};

const MEDICAL_CATEGORIES = [
  "cardiovascular",
  "respiratory",
  "gastroenterology",
  "musculoskeletal",
  "neurological",
  "endocrine",
  "obs and gyne",
  "paediatrics",
  "ENT",
  "ophthalmology",
  "dermatology",
  "other",
];

export default function HistoryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [conditions, setConditions] = useState<string[]>([]);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const { apiUrl } = useApiUrl();

  /** Fetch conditions when category is selected */
  useEffect(() => {
    if (!selectedCategory) return;

    const fetchConditions = async () => {
      try {
        console.log(`Fetching conditions for category: ${selectedCategory}`);
        const res = await fetch(
          `${apiUrl}/get_conditions_by_category_profile/?category=${selectedCategory}`
        );

        if (!res.ok) throw new Error(`API responded with status ${res.status}`);

        const data = await res.json();
        const cleanedConditions: string[] = (data.conditions || [])
          .filter((condition: unknown): condition is string => typeof condition === "string" && condition.trim() !== "")
          .map((condition: string) => condition.replace(/[\u4e00-\u9fa5]/g, "").trim());

        setConditions([...new Set(cleanedConditions)]); // Ensure unique values
      } catch (error) {
        console.error("Error fetching conditions:", error);
      }
    };

    fetchConditions();
  }, [selectedCategory, apiUrl]);

  /** Handle condition selection and generate patient history */
  const handleConditionSelect = async (condition: string) => {
    setSelectedCondition(condition);
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/generate-history/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ condition }),
      });
      if (!res.ok) throw new Error("Failed to fetch history");

      const data = await res.json();
      setHistory(data.history);
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

        {/* Category & Condition Selection */}
        <div className="mb-6 mx-auto max-w-2xl px-4">
          <label className="block text-sm font-medium text-gray-700">
            Select Category:
          </label>
          <select
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            value={selectedCategory || ""}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedCondition(null);
              setHistory(null);
            }}
          >
            <option value="">-- Select a category --</option>
            {MEDICAL_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          <label className="block text-sm font-medium text-gray-700 mt-4">
            Select Condition:
          </label>
          <select
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            value={selectedCondition || ""}
            onChange={(e) => handleConditionSelect(e.target.value)}
            disabled={!conditions.length}
          >
            <option value="">-- Select a condition --</option>
            {conditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
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
              />
            </div>
          )}
      </div>
    </Providers>
  );
}
