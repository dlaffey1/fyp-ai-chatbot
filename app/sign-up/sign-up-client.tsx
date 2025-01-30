"use client";

import { LoginButton } from "@/components/login-button";
import { LoginForm } from "@/components/login-form";
import { Separator } from "@/components/ui/separator";

export default function SignUpClient() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-full max-w-sm">
        <LoginForm action="sign-up" />
        <Separator className="my-4" />
        <LoginButton />
      </div>
    </div>
  );
}
