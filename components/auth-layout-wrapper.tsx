// File: app/components/AuthLayoutWrapper.tsx
"use client";

import { useUser } from "@supabase/auth-helpers-react";
import { usePathname } from "next/navigation";
import SignInClient from "@/app/sign-in/sign-in-client";
import React from "react";

interface AuthLayoutWrapperProps {
  children: React.ReactNode;
}

export default function AuthLayoutWrapper({
  children,
}: AuthLayoutWrapperProps) {
  const user = useUser();
  const pathname = usePathname() || "";

  // Allow unauthenticated users to access the /sign-up and /sign-in pages.
  if (!user && !pathname.startsWith("/sign-up") && !pathname.startsWith("/sign-in")) {
    return <SignInClient />;
  }

  return <>{children}</>;
}
