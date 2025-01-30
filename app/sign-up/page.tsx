"use server";

import { getAuthSession } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SignUpClient from "./sign-up-client"; // Import Client Component

export default async function SignUpPage() {
  const session = await getAuthSession();

  // Redirect to home if user is already logged in
  if (session?.user) {
    redirect("/");
  }

  return <SignUpClient />; // Render Client Component
}
