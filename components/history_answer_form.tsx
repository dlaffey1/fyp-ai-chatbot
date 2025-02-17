"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Question {
  question: string;
  answer: string; // Generated answer (reference, if needed)
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
      setQuestions(data.questions || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch questions once history is loaded.
  useEffect(() => {
    if (history) {
      fetchQuestions();
    }
  }, [history]);

  const onSubmit = (data: AnswersFormValues) => {
    console.log("User answers:", data);
    // Redirect to an answers result page with answers encoded in the URL.
    router.push(`/answers-result?answers=${encodeURIComponent(JSON.stringify(data))}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={fetchQuestions} type="button" className="bg-blue-500 hover:bg-blue-600">
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
            <Textarea placeholder="Type your answer here..." {...register(`q${index}`)} />
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
