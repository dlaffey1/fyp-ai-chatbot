"use client";

import { useSearchParams } from "next/navigation";

export default function AnswersResultPage() {
  const searchParams = useSearchParams();
  const answersString = searchParams.get("answers") || "{}";
  let answers;
  try {
    answers = JSON.parse(answersString);
  } catch (e) {
    answers = {};
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Your Answers</h1>
      <div className="w-full max-w-2xl space-y-4">
        {Object.entries(answers).map(([key, answer]) => (
          <div key={key} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">Question {key}:</h2>
            <p className="mt-2 whitespace-pre-wrap">{answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
