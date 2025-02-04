// lib/fonts.ts
import { Inter, JetBrains_Mono } from "next/font/google";

// Keep Inter if you want it
export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  preload: false,
  fallback: ["sans-serif"],
});

// Re-add JetBrains Mono
export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  preload: false,
  fallback: ["monospace"],
});
