// File: app/page.tsx
import { getAuthSession } from "@/auth.server";
import dynamic from "next/dynamic";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button"; // Still needed for the button style/structure if LoginCalendar uses it internally
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Corrected import path assuming the component is in the root components directory
// The LoginCalendar component itself must be a Client Component ("use client;")
const LoginCalendar = dynamic(
  () => import("@/components/calendar-login"),
  { ssr: false }
);

export default async function HomePage() {
  const session = await getAuthSession();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <Activity className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-4 text-3xl">Patient History Assistant</CardTitle>
          <CardDescription>
            Generate and review patient histories with intelligent insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {session?.user ? (
            <div className="flex flex-col items-center space-y-4">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                You are logged in as <strong>{session.user.email}</strong>.
              </p>
              {/* REMOVED the Button with the onClick handler */}
              {/* This button and its logic must be moved into a Client Component,
                  likely within or alongside the LoginCalendar component. */}
              <Separator />
              <div className="w-full">
                 {/* LoginCalendar is a Client Component and should handle its own interactivity */}
                <LoginCalendar />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Please log in to enjoy all features.
              </p>
              <Button asChild>
                <a href="/sign-in">Sign In</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <footer className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} Patient History Assistant. All rights reserved.
      </footer>
    </main>
  );
}