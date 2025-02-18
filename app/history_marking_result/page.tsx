"use client";

import { useSearchParams } from "next/navigation";

export default function AnswersResultPage() {
  const searchParams = useSearchParams();
  const comparisonsString = searchParams.get("comparisons") || "[]";
  let comparisons;
  try {
    comparisons = JSON.parse(comparisonsString);
  } catch (e) {
    comparisons = [];
    console.error("Failed to parse comparisons:", e);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Your Answer Comparisons</h1>
      {comparisons.length === 0 ? (
        <p className="text-lg">No comparisons to display.</p>
      ) : (
        <div className="w-full max-w-2xl space-y-6">
          {comparisons.map((comp: any, index: number) => (
            <div key={index} className="border p-6 rounded shadow">
              <h2 className="text-2xl font-semibold mb-2">
                Question {index + 1}
              </h2>
              <p className="mb-1">
                <strong>Question:</strong> {comp.question}
              </p>
              <p className="mb-1">
                <strong>Perfect Answer:</strong> {comp.expected_answer}
              </p>
              <p className="mb-1">
                <strong>Your Answer:</strong> {comp.user_answer}
              </p>
              <p className="mb-1">
                <strong>Score:</strong> {comp.score}
              </p>
              <p className="whitespace-pre-wrap">
                <strong>Feedback:</strong> {comp.feedback}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
