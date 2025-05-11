// File: app/page.tsx
import { getAuthSession } from "@/auth.server";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Client-only components
const LoginCalendar = dynamic(
  () => import("@/components/calendar-login"),
  { ssr: false }
);
const ActivityIcon = dynamic(
  () => import("lucide-react").then((mod) => mod.Activity),
  { ssr: false }
);

export default async function HomePage() {
  const session = await getAuthSession();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <ActivityIcon className="mx-auto h-12 w-12 text-primary" />
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
              <Separator />
              <div className="w-full">
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
