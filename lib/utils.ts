// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Add a simple formatDate function:
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString(); // Customize as needed
}

// Dynamic import for nanoid-compatible usage
export async function getNanoid(): Promise<string> {
  const { nanoid } = await import("nanoid");
  return nanoid();
}
