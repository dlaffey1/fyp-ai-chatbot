"use client";

import { useState } from "react";
import { Message } from "ai";
import { nanoid } from "nanoid"; // <--- import a random ID generator
import { toast } from "react-hot-toast";

import { cn } from "@/lib/utils";
import { ChatList } from "@/components/chat-list";
import { ChatPanel } from "@/components/chat-panel";
import { ChatScrollAnchor } from "@/components/chat-scroll-anchor";
import { EmptyScreen } from "@/components/empty-screen";

export interface ChatProps extends React.ComponentProps<"div"> {
  initialMessages?: Message[];
  history?: string | null; // The patient history passed from HistoryPage
  className?: string;
}

/**
 * A custom Chat that:
 *  - Maintains local messages
 *  - Takes user input
 *  - Calls /ask-question/ with { question, history }
 */
export function Chat_askquestion({
  initialMessages = [],
  history = null,
  className,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(userInput: string) {
    if (!userInput.trim()) return;

    // 1) Add user message with a random "id"
    setMessages((prev) => [
      ...prev,
      {
        id: nanoid(),            // <-- Provide an ID
        role: "user",
        content: userInput,
      },
    ]);

    setInput("");
    setIsLoading(true);

    const payload = {
      question: userInput,
      history: history ?? "",
    };
    console.log("Sending request to /ask-question/:", payload);

    try {
      const response = await fetch("https://final-year-project-osce-simulator-1.onrender.com/ask-question/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`ask-question API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received:", data);

      // 3) Append AI answer
      if (data.answer) {
        setMessages((prev) => [
          ...prev,
          {
            id: nanoid(),         // also give the AI message an ID
            role: "assistant",
            content: data.answer,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: nanoid(),
            role: "assistant",
            content: "No response received.",
          },
        ]);
      }
    } catch (error: any) {
      console.error("Error sending question:", error);
      toast.error(`Failed to get a response: ${error.message}`);
      setMessages((prev) => [
        ...prev,
        {
          id: nanoid(),
          role: "assistant",
          content: `Failed to get a response: ${error.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("pb-[200px] pt-4 md:pt-10", className)}>
      {messages.length > 0 ? (
        <>
          <ChatList messages={messages} />
          <ChatScrollAnchor trackVisibility={isLoading} />
        </>
      ) : (
        <EmptyScreen setInput={setInput} />
      )}

      <ChatPanel
        id="custom-chat"
        messages={messages}
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export { Chat_askquestion as Chat };
