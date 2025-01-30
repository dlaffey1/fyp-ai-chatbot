import { cookies } from "next/headers";
import { HeaderClient } from "@/components/header-client"; // ✅ Corrected import

export function Header() {
    return (
      <>
        <HeaderClient /> {/* ✅ Use the client component inside the server component */}
        <nav className="bg-gray-800 text-white p-2">
          <ul className="flex space-x-4">
            <li><a href="/chat">Chat</a></li>
            <li><a href="/history">History</a></li>
            <li><a href="/sign-in">Sign In</a></li>
          </ul>
        </nav>
      </>
    );
}
