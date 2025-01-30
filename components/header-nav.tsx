import Link from "next/link";

export function HeaderNav() {
  return (
    <nav className="bg-gray-800 text-white p-2">
        <ul className="flex space-x-4">
          <li><Link href="/chat">Chat</Link></li>
          <li><Link href="/history">History</Link></li>
          <li><Link href="/sign-in">Sign In</Link></li>
        </ul>
      </nav>
  );
};
