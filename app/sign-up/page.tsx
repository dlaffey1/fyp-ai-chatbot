"use server";

import { getAuthSession } from "@/auth.server";
import { redirect } from "next/navigation";
import SignUpClient from "./sign-up-client";

export default async function SignUpPage() {
  const session = await getAuthSession();

  // Redirect to home if already logged in
  if (session?.user) {
    redirect("/");
  }

  return <SignUpClient />;
}
