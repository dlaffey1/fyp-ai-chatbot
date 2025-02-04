"use client";

import { FormEvent } from "react";
import { Button } from "@/components/ui/button";

interface PromptFormProps {
  onSubmit: (value: string) => Promise<void> | void;
  input: string;
  setInput: (val: string) => void;
  isLoading: boolean;
}

export function PromptForm({
  onSubmit,
  input,
  setInput,
  isLoading,
}: PromptFormProps) {
  async function handleSubmitForm(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    await onSubmit(input);
  }

  return (
    <form onSubmit={handleSubmitForm} className="flex items-center gap-2">
      <input
        type="text"
        className="flex-1 rounded border px-3 py-2"
        placeholder="Ask a question..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading}>
        Send
      </Button>
    </form>
  );
}
