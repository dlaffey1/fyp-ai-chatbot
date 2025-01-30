"use client"; // ✅ Ensure this is a Client Component

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuthSession } from "@/auth";

export default function HeaderNav() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true); // ✅ Track loading state

  useEffect(() => {
    async function fetchSession() {
      console.log("Fetching session...");
      try {
        const userSession = await getAuthSession();
        console.log("Fetched session:", userSession);
        setSession(userSession);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, []);

  return (
    <nav className="bg-gray-800 text-white p-2">
      <ul className="flex space-x-4">
        <li><Link href="/chat" className="hover:underline">Chat</Link></li>
        <li><Link href="/history" className="hover:underline">History</Link></li>

        {/* ✅ Debugging: Show loading state */}
        {loading && <li>Loading...</li>}

        {/* ✅ Show "Profile" & "Sign Out" when logged in */}
        {!loading && session?.user ? (
          <>
            <li><Link href="/profile" className="hover:underline">Profile</Link></li>
            <li>
              <button
                onClick={async () => {
                  console.log("Signing out...");
                  await fetch("/api/auth/sign-out", { method: "POST" });
                  console.log("Signed out.");
                  setSession(null);
                  window.location.reload();
                }}
                className="hover:underline"
              >
                Sign Out
              </button>
            </li>
          </>
        ) : (
          !loading && <li><Link href="/sign-in" className="hover:underline">Sign In</Link></li>
        )}
      </ul>
    </nav>
  );
}
