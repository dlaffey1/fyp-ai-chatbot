'use client';

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useApiUrl } from "@/config/contexts/api_url_context"; // Import the hook

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

// Define schema.
const historySchema = z.object({
  PC: z.string().nonempty("Presenting Complaint is required"),
  HPC: z.string().optional(),
  PMHx: z.string().optional(),
  DHx: z.string().optional(),
  FHx: z.string().optional(),
  SHx: z.string().optional(),
  SR: z.string().optional(),
});

type HistoryFormValues = z.infer<typeof historySchema>;

// Mapping keys to full labels.
const fieldLabels: Record<keyof HistoryFormValues, string> = {
  PC: "Presenting Complaint",
  HPC: "History of Presenting Complaint",
  PMHx: "Past Medical History",
  DHx: "Drug History",
  FHx: "Family History",
  SHx: "Social History",
  SR: "Systems Review",
};

interface HistoryMarkingFormProps {
  expectedHistory: string;  // JSON string from page load.
  historyLoadedAt: number;  // Timestamp when history was loaded.
  questionsCount: number;   // Number of times ask-question endpoint was hit.
}

export function HistoryMarkingForm({
  expectedHistory,
  historyLoadedAt,
  questionsCount,
}: HistoryMarkingFormProps) {
  const router = useRouter();
  // Call the hook inside the component function
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

    const payload = {
      expected_history: expectedHistory,
      time_taken: timeTaken,
      questions_count: questionsCount,
      user_response,
    };

    try {
      const response = await fetch(`${apiUrl}/api/evaluate-history/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      console.log("Marking result:", result);
      // Redirect with the entire result as a query parameter.
      router.push(`/marking-result?result=${encodeURIComponent(JSON.stringify(result))}`);
    } catch (error) {
      console.error("Error submitting history for marking:", error);
    }
  }

  return (
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
        <div className="flex justify-end">
          <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
