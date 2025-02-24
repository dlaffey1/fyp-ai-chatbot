// app/layout.tsx
export const dynamic = 'force-dynamic';
import { Metadata } from "next";
import React from "react";
import { Toaster } from "react-hot-toast";
import "@/app/globals.css";
import { fontMono, fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header-server";
import { getAuthSession } from '@/auth.server';
import SignInClient from "./sign-in/sign-in-client";
import { AppSidebar } from "@/components/app-sidebar"; // Composed sidebar
import { ThemeToggle } from "@/components/theme-toggle"; // Dark mode toggle component

export const metadata: Metadata = {
  title: {
    default: "Patient History Assistant",
    template: "%s - Patient History Assistant",
  },
  description:
    "View patient history and ask specific questions for insights. The system generates history automatically and provides intelligent responses to your queries.",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await getAuthSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn("font-sans antialiased", fontSans.variable, fontMono.variable)}>
        <Toaster />
        <Providers attribute="class" defaultTheme="system" enableSystem>
          {!session?.user ? (
            <SignInClient />
          ) : (
            <div className="flex min-h-screen w-full">
              <AppSidebar session={session} />
              <div className="flex flex-col flex-1">
                <Header />
                <main className="flex flex-1 flex-col bg-muted/50">
                  {children}
                </main>
              </div>
            </div>
          )}
          <TailwindIndicator />
          {/* Dark mode toggle fixed at bottom right */}
          <div className="fixed bottom-4 right-4 z-50">
            <ThemeToggle />
          </div>
        </Providers>
      </body>
    </html>
  );
}
