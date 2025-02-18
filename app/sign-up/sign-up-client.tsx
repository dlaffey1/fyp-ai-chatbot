// app/sign-up/sign-up-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { LoginForm } from "@/components/login-form";
import { Separator } from "@/components/ui/separator";
import { LoginButton } from "@/components/login-button";

export default function SignUpClient() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    console.log("Sign-up form submitted:", { email, password });

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      console.log("Sign-up result:", { data, error });
      if (error) {
        console.error("Sign-up error:", error.message);
      } else {
        router.push("/");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGitHubSignUp() {
    setIsLoading(true);
    try {
      console.log("GitHub sign-up clicked");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: `${location.origin}/auth/callback` },
      });
      if (error) {
        console.error("GitHub sign-up error:", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center py-10">
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          {/* Pass action="sign-up" so LoginForm displays the appropriate text */}
          <LoginForm action="sign-up" />
        </form>
        <Separator className="my-4" />
        <div className="flex justify-center space-x-4">
          <LoginButton
            text="Sign up with GitHub"
            onClick={handleGitHubSignUp}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
