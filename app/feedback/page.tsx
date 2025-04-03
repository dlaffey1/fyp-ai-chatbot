"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@supabase/supabase-js";
import { useUser } from "@supabase/auth-helpers-react"; // Import Supabase auth hook
import { v5 as uuidv5 } from "uuid";  // Import UUIDv5
import { useToast } from "@/hooks/use-toast"; // Import the toast hook
import { Toaster } from "@/components/ui/toaster"; // Import the toast UI component

// Initialize Supabase client (replace with your actual URL and anon key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function FeedbackPage() {
  const user = useUser(); // Get the current authenticated user
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast(); // Destructure the toast function

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!feedback.trim()) return;
    setLoading(true);

    // Compute the user_id from the user's email using a fixed namespace.
    // This ensures that the same email always produces the same UUID.
    const user_email = user?.email || "";
    console.log("User email found:", user_email);
    const NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"; // Valid, fixed namespace UUID.
    const user_id = user_email ? uuidv5(user_email, NAMESPACE) : null;
    console.log("Computed user_id:", user_id);

    // Insert feedback into Supabase with the computed user_id.
    const { error } = await supabase
      .from("feedback")
      .insert([{ feedback_message: feedback, user_id }]);

    if (error) {
      console.error("Error submitting feedback:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error submitting feedback. Please try again later.",
      });
    } else {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });
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
      {/* The Toaster component renders toast notifications at the bottom right */}
      <Toaster />
    </div>
  );
}
