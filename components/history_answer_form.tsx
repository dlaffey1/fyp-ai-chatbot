"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApiUrl } from "@/config/contexts/api_url_context";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react"; // Import Supabase auth hook
import { v5 as uuidv5 } from "uuid";

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
  sessionStart: number; // Timestamp when history was loaded
  category: string; // Top-level category selected by the user
  icdCode: string; // Specific condition (long title) selected by the user
  conversationLogs: string;
}

export function HistoryAnswerForm({
  history,
  sessionStart,
  category,
  icdCode,
  conversationLogs,
}: HistoryAnswerFormProps) {
  const router = useRouter();
  const { register, handleSubmit } = useForm<AnswersFormValues>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { apiUrl } = useApiUrl();

  // Get the current user and compute their deterministic user_id.
  const user = useUser();
  const user_email = user?.email || "";
  const NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
  const computedUserId = user_email ? uuidv5(user_email, NAMESPACE) : "";
  console.log("Computed user ID:", computedUserId);

  // Helper: convert score string like "100%" to number 100.
  const parseScore = (score: any): number => {
    if (typeof score === "string") {
      return parseFloat(score.replace("%", ""));
    }
    return score;
  };

  // Fetch questions using the provided history.
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/generate-questions/`, {
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

  // Save session data to Supabase.
  const saveSessionData = async (
    history: any,
    conversation: any,
    timeSpent: number,
    questions: any,
    answers: any,
    q1Result: number,
    q2Result: number,
    q3Result: number,
    q4Result: number,
    overallGrade: number,
    category: string,
    icdCode: string,
    user_id: string // New field for user id
  ) => {
    try {
      const { data, error } = await supabase.from("history_sessions").insert([
        {
          history: JSON.parse(history),
          conversation, // For now, this is an empty array
          time_spent: timeSpent,
          questions,
          answers,
          q1_result: q1Result,
          q2_result: q2Result,
          q3_result: q3Result,
          q4_result: q4Result,
          overall_grade: overallGrade,
          category,
          icd_code: icdCode,
          user_id, // Include the computed user_id
        },
      ]);
      if (error) {
        console.error("Error saving session data:", error);
      } else {
        console.log("Session data saved:", data);
      }
    } catch (error) {
      console.error("Unexpected error saving to Supabase:", error);
    }
  };

  useEffect(() => {
    if (history) {
      fetchQuestions();
    }
  }, [history, apiUrl]);

  const onSubmit = async (data: AnswersFormValues) => {
    console.log("User answers:", data);
    const timeSpent = Math.floor((Date.now() - sessionStart) / 1000);

    const comparePromises = questions.map((q, index) => {
      const user_answer = data[`q${index}`] || "";
      const payload = {
        question: q.question,
        expected_answer: q.answer,
        user_answer: user_answer,
      };
      console.log(`Comparing answer for question ${index + 1}:`, payload);
      return fetch(`${apiUrl}/api/compare-answer/`, {
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
            score: parseScore(result.score), // numeric score
            feedback: result.details, // renamed details to feedback
          };
        });
    });

    try {
      const comparisonResults = await Promise.all(comparePromises);
      console.log("All comparison results:", comparisonResults);

      const q1Result = comparisonResults[0]?.score || 0;
      const q2Result = comparisonResults[1]?.score || 0;
      const q3Result = comparisonResults[2]?.score || 0;
      const q4Result = comparisonResults[3]?.score || 0;
      const overallGrade = (q1Result + q2Result + q3Result + q4Result) / 4;

      const userAnswers = data;

      await saveSessionData(
        history,
        [],
        timeSpent,
        questions,
        userAnswers,
        q1Result,
        q2Result,
        q3Result,
        q4Result,
        overallGrade,
        category,
        icdCode,
        computedUserId // Pass the computed user ID
      );

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
            <p className="mb-2 font-semibold">
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
