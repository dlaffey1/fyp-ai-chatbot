"use server";

import { getAuthSession } from "@/auth.server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SignInClient from "./sign-in-client"; // Import Client Component

export default async function SignInPage() {
  const session = await getAuthSession();

  // Redirect to home if user is already logged in
  if (session?.user) {
    redirect("/");
  }

  return <SignInClient />; // Render Client Component
}
