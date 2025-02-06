import { NextResponse } from "next/server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST() {
  const supabase = createServerActionClient({ cookies });
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
