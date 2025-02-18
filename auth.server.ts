// auth.server.ts
"use server";
import "server-only";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getAuthSession() {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Supabase Auth Error:", error.message);
      return null;
    }
    return data?.session ?? null;
  } catch (err) {
    console.error("Unexpected error in getAuthSession:", err);
    return null;
  }
}
