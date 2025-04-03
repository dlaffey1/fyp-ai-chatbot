// File: app/page.jsx

"use client";

import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect } from "react";

function InnerTestSessionPage() {
  const user = useUser();
  const supabase = useSupabaseClient();

  useEffect(() => {
    console.log("Supabase User:", user);
  }, [user]);

  // While the user state is undefined, show a loading message.
  if (user === undefined) {
    return <div>Loading session data...</div>;
  }

  return user ? (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <p>
        <strong>User Email:</strong> {user.email || "No email provided"}
      </p>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
    </div>
  ) : (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <button onClick={() => window.location.assign("/sign-in")}>
        Sign In
      </button>
    </div>
  );
}

export default function TestSessionPage() {
  return <InnerTestSessionPage />;
}
