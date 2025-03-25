"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { ChatList } from "@/components/chat-list";
import { ChatPanel } from "@/components/chat-panel";
import { ChatScrollAnchor } from "@/components/chat-scroll-anchor";
import { EmptyScreen } from "@/components/empty-screen";
import { useApiUrl } from "@/config/contexts/api_url_context";

// Define your own Message type
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

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
  setConversationLogs,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { apiUrl } = useApiUrl(); // Get API base URL from context

  // Dynamically import nanoid to avoid static import issues.
  const [nanoidFunc, setNanoidFunc] = useState<(() => string) | null>(null);


  useEffect(() => {
    import("nanoid").then((mod) => {
      setNanoidFunc(() => mod.nanoid);
    });
  }, []);

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
    if (!nanoidFunc) {
      console.error("nanoid not loaded yet");
      return;
    }

    // Add user message with a random "id"
    setMessages((prev) => [
      ...prev,
      {
        id: nanoidFunc(),
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
          id: nanoidFunc(),
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
          id: nanoidFunc(),
          role: "assistant",
          content: `Failed to get a response: ${error.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  // Render fallback until nanoid is loaded.
  if (!nanoidFunc) {
    return <p>Loading...</p>;
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
