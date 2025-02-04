import { JetBrains_Mono as FontMono, Inter as FontSans } from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  /** 
   * Disables build-time fetching of the font,
   * so you won't get ETIMEDOUT on Vercel builds.
   */
  preload: false,
  fallback: ["sans-serif"],
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
  preload: false,           // Prevent build-time fetch
  fallback: ["monospace"],  // Fallback if this font fails to load
});
