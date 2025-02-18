"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const menuItems = [
  { name: "Chat", href: "/chat" },
  { name: "Patient History", href: "/history" },
  { name: "Sign In", href: "/sign-in" },
];

export default function SidebarList() {
  return (
    <ul className="space-y-2">
      {menuItems.map((item) => (
        <li key={item.name}>
          <Link
            href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "group w-full pl-8 pr-16 py-2 rounded hover:bg-accent transition-colors"
            )}
          >
            <div
              className="relative max-h-5 flex-1 select-none overflow-hidden text-ellipsis break-all"
              title={item.name}
            >
              <span className="whitespace-nowrap">{item.name}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
