"use client";

import { useState } from "react";
import { Message } from "ai";
import { toast } from "react-hot-toast";

import { cn } from "@/lib/utils";
import { ChatList } from "@/components/chat-list";
import { ChatPanel } from "@/components/chat-panel";
import { ChatScrollAnchor } from "@/components/chat-scroll-anchor";
import { EmptyScreen } from "@/components/empty-screen";

// These are the props that <Chat> will receive.
export interface ChatProps extends React.ComponentProps<"div"> {
  initialMessages?: Message[];
  history?: string | null; // The patient history passed from HistoryPage
  className?: string;
}

/**
 * The single chat UI that:
 *   - Maintains local messages
 *   - Takes user input
 *   - Calls /ask-question/ with { question, history }
 */
export function Chat_askquestion({
  initialMessages = [],
  history = null,
  className,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // The function ChatPanel calls when user presses "Send"
  async function handleSubmit(userInput: string) {
    if (!userInput.trim()) return;

    // 1) Add user message
    setMessages((prev) => [...prev, { role: "user", content: userInput }]);
    setInput("");
    setIsLoading(true);

    // 2) Build request
    const payload = {
      question: userInput,
      history: history ?? "", // pass the parent's history here
    };
    console.log("🚀 Sending request to /ask-question/ with:", payload);

    try {
      const response = await fetch("http://127.0.0.1:8000/ask-question/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`ask-question API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("📥 Received from /ask-question/:", data);

      // 3) Append AI answer
      if (data.answer) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "No response received." },
        ]);
      }
    } catch (error: any) {
      console.error("🚨 Error sending question:", error);
      toast.error(`Failed to get a response: ${error.message}`);
      setMessages((prev) => [
        ...prev,
        {
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

// Export under the name Chat so that in your HistoryPage, you can do `import { Chat }`
export { Chat_askquestion as Chat };
