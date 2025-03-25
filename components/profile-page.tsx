// components/profile-page.tsx
"use client";

import { useState } from "react";
import { getNanoid } from "@/lib/utils"; // Ensure nanoid is exported from your utils

interface ProfilePageProps {
  session: any;
}

export default function ProfilePage({ session }: ProfilePageProps) {
  const [profilePic, setProfilePic] = useState(
    session?.user?.avatar_url || "/default-avatar.jpg"
  );

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fileInput = event.currentTarget.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload-profile-picture", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data.avatar_url) {
      // Use getNanoid() for cache busting
      const newAvatarUrl = `${data.avatar_url}?v=${getNanoid()}`;
      setProfilePic(newAvatarUrl);

      // Notify other parts of the app (e.g., Navbar) about the update
      window.dispatchEvent(
        new CustomEvent("profile-updated", { detail: { avatarUrl: newAvatarUrl } })
      );
    } else {
      alert("Upload failed");
    }
  };

  return (
    <div className="container mx-auto mt-10 p-6 shadow-md rounded-md">
      <h1 className="text-2xl font-bold text-gray-900 text-center">Profile</h1>
      <p className="mt-4 text-gray-700 text-center">
        Welcome, {session?.user?.email}!
      </p>

      <div className="mt-6 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full border overflow-hidden bg-transparent">
          <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
        </div>

        <form className="mt-4" onSubmit={handleUpload}>
          <input
            type="file"
            name="file"
            accept="image/*"
            className="block text-sm text-gray-700"
          />
          <button
            type="submit"
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Upload Photo
          </button>
        </form>
      </div>
    </div>
  );
}
