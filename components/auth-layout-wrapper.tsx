// app/components/AuthLayoutWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import SignInClient from "@/app/sign-in/sign-in-client";
import React from "react";

interface AuthLayoutWrapperProps {
  session: any;
  children: React.ReactNode;
}

export default function AuthLayoutWrapper({
  session,
  children,
}: AuthLayoutWrapperProps) {
  const pathname = usePathname();

  // Allow unauthenticated users to access the /sign-up (or /sign-in) pages.
  if (!session?.user && !pathname.startsWith("/sign-up") && !pathname.startsWith("/sign-in")) {
    return <SignInClient />;
  }

  return <>{children}</>;
}
