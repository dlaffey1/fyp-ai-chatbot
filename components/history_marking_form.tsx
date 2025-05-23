"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApiUrl } from "@/config/contexts/api_url_context";
import { useUser } from "@supabase/auth-helpers-react"; // Using Supabase auth hook
import { v5 as uuidv5 } from "uuid";  // Import UUIDv5

// Import shadcn/ui components (adjust import paths as needed)
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const historySchema = z.object({
  PC: z.string().nonempty("Presenting Complaint is required"),
  HPC: z.string().optional(),
  PMHx: z.string().optional(),
  DHx: z.string().optional(),
  FHx: z.string().optional(),
  SHx: z.string().optional(),
  SR: z.string().optional(),
  guessedCondition: z.string().nonempty("Guessed Disease is required"),
});

type HistoryFormValues = z.infer<typeof historySchema>;

const fieldLabels: Record<keyof Omit<HistoryFormValues, "guessedCondition">, string> = {
  PC: "Presenting Complaint",
  HPC: "History of Presenting Complaint",
  PMHx: "Past Medical History",
  DHx: "Drug History",
  FHx: "Family History",
  SHx: "Social History",
  SR: "Systems Review",
};

export interface HistoryMarkingFormProps {
  expectedHistory: string;    // JSON string from page load.
  historyLoadedAt: number;    // Timestamp when history was loaded.
  questionsCount: number;     // Number of times ask-question endpoint was hit.
  correctCondition: string;   // The mimic condition number (ICD code) for the case.
  conversationLogs: string;   // The conversation logs.
  category: string;          // The category of the case.
}

function HistoryMarkingFormComponent({
  expectedHistory,
  historyLoadedAt,
  questionsCount,
  correctCondition,
  conversationLogs,
  category,
}: HistoryMarkingFormProps) {
  const router = useRouter();
  const { apiUrl } = useApiUrl();
  const user = useUser(); // Get the user object from Supabase

  const form = useForm<HistoryFormValues>({
    resolver: zodResolver(historySchema),
    defaultValues: {
      PC: "",
      HPC: "",
      PMHx: "",
      DHx: "",
      FHx: "",
      SHx: "",
      SR: "",
      guessedCondition: "",
    },
  });

  async function onSubmit(values: HistoryFormValues) {
    const timeTaken = (Date.now() - historyLoadedAt) / 1000;
    const user_response = [
      `Presenting Complaint: ${values.PC}`,
      `History of Presenting Complaint: ${values.HPC}`,
      `Past Medical History: ${values.PMHx}`,
      `Drug History: ${values.DHx}`,
      `Family History: ${values.FHx}`,
      `Social History: ${values.SHx}`,
      `Systems Review: ${values.SR}`,
    ].join("\n");

    // Extract the email using Supabase's useUser hook
    const user_email = user?.email || "";
    // Use a constant, valid namespace so that the same email always produces the same UUID.
    const NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    const user_id = user_email ? uuidv5(user_email, NAMESPACE) : "";

    const payload = {
      expected_history: expectedHistory,
      time_taken: timeTaken,
      questions_count: questionsCount,
      user_response,
      right_disease: correctCondition,
      conversation_logs: conversationLogs,
      guessed_condition: values.guessedCondition,
      user_id, // Computed as a UUID based on the user's email with a fixed namespace.
      category,
    };

    console.log("Sending evaluate_history payload:", payload);

    try {
      const response = await fetch(`${apiUrl}/api/evaluate-history/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      console.log("Marking result:", result);
      router.push(`/marking-result?result=${encodeURIComponent(JSON.stringify(result))}`);
    } catch (error) {
      console.error("Error submitting history for marking:", error);
    }
  }

  const guessedConditionValue = form.watch("guessedCondition");

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {(["PC", "HPC", "PMHx", "DHx", "FHx", "SHx", "SR"] as const).map((field) => (
            <FormField
              key={field}
              control={form.control}
              name={field}
              render={({ field: inputField, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>{fieldLabels[field]}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={`Enter ${fieldLabels[field]}`} {...inputField} />
                  </FormControl>
                  <FormMessage>{error?.message}</FormMessage>
                </FormItem>
              )}
            />
          ))}
          <FormField
            control={form.control}
            name="guessedCondition"
            render={({ field: inputField, fieldState: { error } }) => (
              <FormItem>
                <FormLabel>Guessed Disease</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your guessed disease" {...inputField} />
                </FormControl>
                <FormMessage>{error?.message}</FormMessage>
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!guessedConditionValue}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

// If your app is already wrapped with the Supabase provider (from "@supabase/auth-helpers-react"),
// you don't need to wrap the component here.
export default function HistoryMarkingFormWithSupabase(props: HistoryMarkingFormProps) {
  return (
    <HistoryMarkingFormComponent {...props} />
  );
}
