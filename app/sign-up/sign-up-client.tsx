// app/sign-up/sign-up-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Separator } from "@/components/ui/separator";
import { LoginButton } from "@/components/login-button";
import { SignUpForm } from "@/components/sign-up-form";

export default function SignUpClient() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // The form submission is now handled inside SignUpForm.
  // If additional logic is needed at this level, you can add it here.

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
        {/* Use the dedicated SignUpForm component */}
        <SignUpForm />
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
