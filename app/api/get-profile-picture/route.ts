import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const supabase = createServerActionClient({ cookies });
    const url = new URL(req.url);
    const userId = url.searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ avatar_url: data?.avatar_url || "/default-avatar.jpg" });
  } catch (err) {
    console.error("Unexpected error in get-profile-picture:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
