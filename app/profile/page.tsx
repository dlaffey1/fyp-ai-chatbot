// app/profile/page.tsx
import ProfilePage from '@/components/profile-page';
import { getAuthSession } from '@/auth.server'; // Ensure this function exists and returns session data

export default async function ProfilePageWrapper() {
  // Fetch the session on the server side
  const session = await getAuthSession();

  // Render the client component with the session data
  return <ProfilePage session={session} />;
}
