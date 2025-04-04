"use client";

import { useChat, type Message } from "ai/react";
import { cn } from "@/lib/utils";
import { ChatList } from "@/components/chat-list";
import { ChatPanel } from "@/components/chat-panel";
import { EmptyScreen } from "@/components/empty-screen";
import { ChatScrollAnchor } from "@/components/chat-scroll-anchor";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

const IS_PREVIEW = process.env.VERCEL_ENV === "preview";

export interface ChatProps extends React.ComponentProps<"div"> {
  initialMessages?: Message[];
  id?: string;
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  // Local storage for an OpenAI API key in preview mode
  const [previewToken, setPreviewToken] = useLocalStorage<string | null>(
    "ai-token",
    null
  );
  const [previewTokenDialog, setPreviewTokenDialog] = useState(IS_PREVIEW);
  const [previewTokenInput, setPreviewTokenInput] = useState(previewToken ?? "");

  // UseChat hook for managing chat state
  const { messages, append, isLoading, input, setInput } = useChat({
    initialMessages,
    id,
    body: {
      id,
      previewToken,
    },
    onResponse(response) {
      if (response.status === 401) {
        toast.error(response.statusText);
      }
    },
  });

  // 1) We'll handle user input submission by calling 'append' ourselves:
  async function handleSend(userInput: string) {
    if (!userInput.trim()) return;
    await append({ role: "user", content: userInput });
  }

  return (
    <>
      <div className={cn("pb-[200px] pt-4 md:pt-10", className)}>
        {/* Render chat messages or empty screen */}
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen setInput={setInput} />
        )}
      </div>

      {/* 
        2) Pass 'handleSend' as 'onSubmit' to ChatPanel.
           We do NOT pass stop, append, reload, etc. 
      */}
      <ChatPanel
        id={id}
        isLoading={isLoading}
        messages={messages}
        input={input}
        setInput={setInput}
        onSubmit={handleSend}
      />

      {/* Dialog for entering OpenAI API key in preview environments */}
      <Dialog open={previewTokenDialog} onOpenChange={setPreviewTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your OpenAI Key</DialogTitle>
            <DialogDescription>
              If you have not obtained your OpenAI API key, you can do so by{" "}
              <a
                href="https://platform.openai.com/signup/"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                signing up
              </a>{" "}
              on the OpenAI website.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={previewTokenInput}
            placeholder="OpenAI API key"
            onChange={(e) => setPreviewTokenInput(e.target.value)}
          />
          <DialogFooter className="items-center">
            <Button
              onClick={() => {
                setPreviewToken(previewTokenInput);
                setPreviewTokenDialog(false);
              }}
            >
              Save Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
