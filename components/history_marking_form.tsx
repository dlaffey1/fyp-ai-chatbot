"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApiUrl } from "@/config/contexts/api_url_context";

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

interface HistoryMarkingFormProps {
  expectedHistory: string;    // JSON string from page load.
  historyLoadedAt: number;    // Timestamp when history was loaded.
  questionsCount: number;     // Number of times ask-question endpoint was hit.
  correctCondition: string;   // The mimic condition number (ICD code) for the case.
  conversationLogs: string;   // The conversation logs.
}

export function HistoryMarkingForm({
  expectedHistory,
  historyLoadedAt,
  questionsCount,
  correctCondition,
  conversationLogs,
}: HistoryMarkingFormProps) {
  const router = useRouter();
  const { apiUrl } = useApiUrl();

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

    // Retrieve the user UUID from localStorage (adjust the key as needed).
    const user_id = localStorage.getItem("user_uuid") || "";

    const payload = {
      expected_history: expectedHistory,
      time_taken: timeTaken,
      questions_count: questionsCount,
      user_response,
      right_disease: correctCondition,
      conversation_logs: conversationLogs,
      guessed_condition: values.guessedCondition,
      user_id, // new field for user identification
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
      // Always redirect to the marking page with the result as a query parameter.
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
