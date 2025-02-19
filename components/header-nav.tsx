"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function HeaderNav({ session }: { session: any }) {
  const [userSession, setUserSession] = useState(session);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [profileVersion, setProfileVersion] = useState(0); // ✅ Track updates

  // ✅ Fetch profile picture and refresh when session updates
  const fetchProfilePicture = async () => {
    if (userSession?.user) {
      try {
        const res = await fetch(`/api/get-profile-picture?id=${userSession.user.id}`);
        if (!res.ok) throw new Error("Failed to fetch profile picture");

        const data = await res.json();
        setProfilePic(data.avatar_url ? `${data.avatar_url}?v=${profileVersion}` : "/default-avatar.jpg"); // ✅ Cache-busting
      } catch (err) {
        console.error("Error fetching profile picture:", err);
        setProfilePic("/default-avatar.jpg");
      }
    }
  };

  // 🔄 Fetch profile picture on mount & when session changes
  useEffect(() => {
    fetchProfilePicture();

    // ✅ Listen for profile updates
    const updateProfileListener = () => {
      console.log("Profile updated event received - Fetching new profile picture.");
      setProfileVersion((prev) => prev + 1); // ✅ Force re-render by incrementing state
      fetchProfilePicture();
    };
    
    window.addEventListener("profile-updated", updateProfileListener);

    return () => {
      window.removeEventListener("profile-updated", updateProfileListener);
    };
  }, [userSession, profileVersion]); // ✅ Include profileVersion in dependencies

  // ✅ Handle Sign Out
  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/sign-out", { method: "POST" });

      if (!response.ok) throw new Error("Failed to sign out");

      console.log("Signed out successfully");
      setUserSession(null);
      setProfilePic("/default-avatar.jpg"); // ✅ Reset profile pic on sign-out
      window.location.href = "/sign-in"; // Redirect after logout
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  return (
    <nav className="bg-gray-800 text-white p-2 flex justify-between items-center">
      <div className="flex space-x-4">
        <Link href="/differential-diagnosis-study-tool" className="hover:underline">
          Differential-Diagnosis-Tool
        </Link>
        <Link href="/history-generator-tool" className="hover:underline">
          History-Generator-Tool
        </Link>
      </div>

      {/* Profile Icon in Top Right */}
      {userSession?.user && (
        <div className="ml-auto flex items-center space-x-4">
          <button onClick={handleSignOut} className="hover:underline">
            Sign Out
          </button>
          <Link href="/profile">
            <img
              src={profilePic || "/default-avatar.jpg"}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border cursor-pointer hover:opacity-80 transition-opacity"
            />
          </Link>
        </div>
      )}
    </nav>
  );
}
