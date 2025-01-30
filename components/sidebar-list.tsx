import Link from "next/link";

const menuItems = [
  { name: "Chat", href: "/chat" },
  { name: "Patient History", href: "/history" }, // ✅ Add history link
  { name: "Sign In", href: "/sign-in" },
];

export default function SidebarList() {
  return (
    <ul>
      {menuItems.map((item) => (
        <li key={item.name} className="mb-2">
          <Link href={item.href} className="block p-2 rounded hover:bg-gray-700">
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
