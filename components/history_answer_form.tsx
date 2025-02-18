"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Question {
  question: string;
  answer: string; // The perfect answer from generate_questions
}

interface GenerateQuestionsResponse {
  questions: Question[];
}

type AnswersFormValues = {
  [key: string]: string;
};

interface HistoryAnswerFormProps {
  history: string; // Patient history as a JSON string
}

export function HistoryAnswerForm({ history }: HistoryAnswerFormProps) {
  const router = useRouter();
  const { register, handleSubmit } = useForm<AnswersFormValues>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch questions using the provided history.
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/generate-questions/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history }),
      });
      if (!res.ok) throw new Error("Failed to fetch questions");
      const data: GenerateQuestionsResponse = await res.json();
      console.log("Fetched questions:", data.questions);
      setQuestions(data.questions || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch questions once history is available.
  useEffect(() => {
    if (history) {
      fetchQuestions();
    }
  }, [history]);

  // When the user submits the form:
  const onSubmit = async (data: AnswersFormValues) => {
    console.log("User answers:", data);
    // For each question, call the compare_answer endpoint.
    const comparePromises = questions.map((q, index) => {
      const user_answer = data[`q${index}`] || "";
      const payload = {
        question: q.question,
        expected_answer: q.answer,
        user_answer: user_answer,
      };
      console.log(`Comparing answer for question ${index + 1}:`, payload);
      return fetch("http://127.0.0.1:8000/api/compare-answer/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((result) => {
          console.log(`Result for question ${index + 1}:`, result);
          return {
            question: q.question,
            expected_answer: q.answer,
            user_answer,
            ...result,
          };
        });
    });

    try {
      const comparisonResults = await Promise.all(comparePromises);
      console.log("All comparison results:", comparisonResults);
      // Redirect to the answers result page with the aggregated comparison results.
      router.push(
        `/history_marking_result?comparisons=${encodeURIComponent(
          JSON.stringify(comparisonResults)
        )}`
      );
    } catch (error) {
      console.error("Error comparing answers:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={fetchQuestions}
          type="button"
          className="bg-blue-500 hover:bg-blue-600"
        >
          Reload Questions
        </Button>
      </div>
      {loading && <p>Loading questions...</p>}
      {!loading && questions.length === 0 && <p>No questions generated.</p>}
      {!loading &&
        questions.map((q, index) => (
          <div key={index} className="border p-4 rounded">
            <p className="font-semibold mb-2">
              Q{index + 1}: {q.question}
            </p>
            <p className="mb-2 text-sm text-gray-500">
              Perfect Answer: {q.answer}
            </p>
            <Textarea
              placeholder="Type your answer here..."
              {...register(`q${index}`)}
            />
          </div>
        ))}
      <div className="flex justify-end">
        <Button type="submit" className="bg-green-500 hover:bg-green-600">
          Submit Answers
        </Button>
      </div>
    </form>
  );
}
