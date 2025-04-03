export const dynamic = "force-dynamic";

import { Metadata } from "next";
import React from "react";
import { Toaster } from "react-hot-toast";
import "@/app/globals.css";
import { fontMono, fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header-server";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { ApiUrlProvider } from "@/config/contexts/api_url_context";
import AuthLayoutWrapper from "@/components/auth-layout-wrapper";
import SupabaseProviderWrapper from "@/components/supabase-provider-wrapper";

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

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn("font-sans antialiased", fontSans.variable, fontMono.variable)}>
        <Toaster />
        <ApiUrlProvider>
          <Providers attribute="class" defaultTheme="system" enableSystem>
            <SupabaseProviderWrapper>
              <AuthLayoutWrapper>
                <div className="flex min-h-screen w-full">
                  <AppSidebar />
                  <div className="flex flex-col flex-1">
                    <Header />
                    <main className="flex flex-1 flex-col bg-muted/50">
                      {children}
                    </main>
                  </div>
                </div>
              </AuthLayoutWrapper>
            </SupabaseProviderWrapper>
            <TailwindIndicator />
            {/* Dark mode toggle fixed at bottom right */}
            <div className="fixed bottom-4 right-4 z-50">
              <ThemeToggle />
            </div>
          </Providers>
        </ApiUrlProvider>
      </body>
    </html>
  );
}
