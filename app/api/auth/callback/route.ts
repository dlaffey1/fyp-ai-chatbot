// File: app/api/auth/callback/route.ts
"use server";
import "server-only";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { v5 as uuidv5 } from "uuid";

const NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // 1️⃣ Exchange the auth code for a session
    await supabase.auth.exchangeCodeForSession(code);

    // 2️⃣ Pull the newly‐issued user out of that session
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();

    if (!getUserError && user?.email) {
      // 3️⃣ Compute the same deterministic user_id
      const computedUserId = uuidv5(user.email, NAMESPACE);

      // 4️⃣ Insert a login event (timestamped by your default now())
      const { error: insertError } = await supabase
        .from("login_events")
        .insert({ user_id: computedUserId });

      if (insertError) {
        console.error("Failed to log login event:", insertError);
      }
    }
  }

  // 5️⃣ Redirect back to the app root
  return NextResponse.redirect(url.origin);
}
