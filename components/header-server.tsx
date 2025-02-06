import { HeaderClient } from "@/components/header-client";
import { getAuthSession } from "@/auth.server"; 

export async function Header() {
  const session = await getAuthSession(); // ✅ Fetch session on the server
  return <HeaderClient session={session} />;
}
