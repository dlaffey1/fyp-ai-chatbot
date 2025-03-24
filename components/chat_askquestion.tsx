"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { nanoid } from "nanoid";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { ChatList } from "@/components/chat-list";
import { ChatPanel } from "@/components/chat-panel";
import { ChatScrollAnchor } from "@/components/chat-scroll-anchor";
import { EmptyScreen } from "@/components/empty-screen";
import { useApiUrl } from "@/config/contexts/api_url_context"; // Use API URL from context

export interface ChatProps extends React.ComponentProps<"div"> {
  initialMessages?: Message[];
  history?: string | null; // The patient history passed from HistoryPage
  className?: string;
  setConversationLogs?: Dispatch<SetStateAction<string>>;
}

export function Chat_askquestion({
  initialMessages = [],
  history = null,
  className,
  setConversationLogs, // optional callback to update conversation logs in parent
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { apiUrl } = useApiUrl(); // Get API base URL from context

  // Update conversation logs every time messages change.
  useEffect(() => {
    if (setConversationLogs) {
      const logs = messages
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");
      setConversationLogs(logs);
    }
  }, [messages, setConversationLogs]);

  async function handleSubmit(userInput: string) {
    if (!userInput.trim()) return;

    // Add user message with a random "id"
    setMessages((prev) => [
      ...prev,
      {
        id: nanoid(),
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
    console.log("Sending request to /ask-question/ with payload:", payload);

    try {
      const response = await fetch(`${apiUrl}/ask-question/`, {
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

      // Append the AI answer
      setMessages((prev) => [
        ...prev,
        {
          id: nanoid(),
          role: "assistant",
          content: data.answer || "No response received.",
        },
      ]);
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
