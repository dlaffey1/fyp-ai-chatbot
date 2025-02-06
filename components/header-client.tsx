"use client";

import HeaderNav from "@/components/header-nav";

export function HeaderClient({ session }: { session: any }) {
  return <HeaderNav session={session} />;
}
