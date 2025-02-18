// app/layout.tsx
import { Metadata } from "next"
import { Toaster } from "react-hot-toast"

import "@/app/globals.css"
import { fontMono, fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { Providers } from "@/components/providers"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header-server"
import { getAuthSession } from "@/auth.server"
import SignInClient from "./sign-in/sign-in-client" // We'll render this if not signed in

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
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await getAuthSession()

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn("font-sans antialiased", fontSans.variable, fontMono.variable)}>
        <Toaster />
        <Providers attribute="class" defaultTheme="system" enableSystem>
          {!session?.user ? (
            // If not authenticated, show the SignInClient component,
            // which contains the single <form>.
            <SignInClient />
          ) : (
            // Otherwise, show the main application layout
            <div className="flex min-h-screen">
              <Sidebar session={session} />
              <div className="flex flex-col flex-1">
                <Header />
                <main className="flex flex-1 flex-col bg-muted/50">
                  {children}
                </main>
              </div>
            </div>
          )}
          <TailwindIndicator />
        </Providers>
      </body>
    </html>
  )
}
