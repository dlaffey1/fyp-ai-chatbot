// Rename this file to "auth.server.ts" so Next.js clearly treats it as a server module
// and do NOT import it from files that have "use client"

import "server-only";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getAuthSession() {
  try {
    // Access the cookie store (only valid in server code)
    const cookieStore = cookies();

    // Create a server Supabase client
    const supabase = createServerComponentClient({
      cookies: () => cookieStore,
    });

    // Attempt to get the current auth session
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Supabase Auth Error:", error.message);
      return null;
    }

    // Return the session if it exists, or null otherwise
    return data?.session ?? null;
  } catch (err) {
    console.error("Unexpected error in getAuthSession:", err);
    return null;
  }
}
