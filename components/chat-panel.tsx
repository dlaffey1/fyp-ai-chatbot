"use client";

import { Message } from "ai";
import { PromptForm } from "@/components/prompt-form";
import { ButtonScrollToBottom } from "@/components/button-scroll-to-bottom";
import { FooterText } from "@/components/footer";

export interface ChatPanelProps {
  id?: string;
  isLoading: boolean;
  messages: Message[];
  input: string;
  setInput: (val: string) => void;
  onSubmit: (value: string) => Promise<void> | void;
}

export function ChatPanel({
  id,
  isLoading,
  messages,
  input,
  setInput,
  onSubmit,
}: ChatPanelProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 bg-gradient-to-b from-muted/10 from-10% to-muted/30 to-50%">
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        {/* 
          If you want "Stop generating" or "Regenerate response" buttons, you can add them here
        */}
        <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          <PromptForm
            onSubmit={onSubmit}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
          />
          <FooterText className="hidden sm:block" />
        </div>
      </div>
    </div>
  );
}
