"use client";
import { notFound, redirect } from "next/navigation";

import { getAuthSession } from "@/auth"; // ✅ Correct auth import
import { getChat } from "@/app/actions";
import { Chat } from "@/components/chat";

export const runtime = "edge";
export const preferredRegion = "home";

export interface ChatPageProps {
  params: {
    id: string;
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  // ✅ Use getAuthSession() instead of auth()
  const session = await getAuthSession();

  if (!session?.user) {
    redirect(`/sign-in?next=/chat/${params.id}`);
  }

  const chat = await getChat(params.id);

  if (!chat) {
    notFound();
  }

  if (chat?.userId !== session?.user?.id) {
    notFound();
  }

  return <Chat id={chat.id} initialMessages={chat.messages} />;
}
