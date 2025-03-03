// components/sign-up-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUpForm({ className }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const supabase = createClientComponentClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Sign-up form submitted:", { email, password });
    // Sign-up logic
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    console.log("Sign-up result:", { data, error });
    if (error) {
      console.error("Sign-up error:", error.message);
      // Optionally, display an error message to the user
    } else {
      await router.push("/");
      router.refresh();
    }
  }

  async function handleGoogle(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    console.log("Google sign up clicked");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) {
      console.error("Google sign up error:", error.message);
    } else {
      console.log("Google sign up result:", data);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl">Sign Up</CardTitle>
            <CardDescription>
              Enter your email below to create your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => {
                    console.log("Email changed:", e.target.value);
                    setEmail(e.target.value);
                  }}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => {
                    console.log("Password changed");
                    setPassword(e.target.value);
                  }}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogle}
              >
                Sign up with Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <a href="/sign-in" className="underline underline-offset-4">
                Login
              </a>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
