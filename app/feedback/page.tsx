"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
// Make sure to configure/use your Supabase client correctly.
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client (replace with your actual URL and anon key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!feedback.trim()) return;
    setLoading(true);
    // Insert feedback into Supabase (assuming you have a "feedback" table with a column "feedback_message")
    const { error } = await supabase
      .from("feedback")
      .insert([{ feedback_message: feedback }]);

    if (error) {
      console.error("Error submitting feedback:", error);
      setMessage("Error submitting feedback. Please try again later.");
    } else {
      setMessage("Thank you for your feedback!");
      setFeedback("");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Feedback</h1>
      <p className="mb-4">
        We appreciate your feedback. Please let us know how we can improve our
        application.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Enter your feedback here..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full"
          rows={5}
        />
        <Button type="submit" disabled={loading || !feedback.trim()}>
          {loading ? "Submitting..." : "Submit Feedback"}
        </Button>
      </form>
      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
    </div>
  );
}
