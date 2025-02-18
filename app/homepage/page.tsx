// app/page.tsx
import { getAuthSession } from "@/auth.server";

export default async function HomePage() {
  const session = await getAuthSession();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
        Welcome to the Homepage!
      </h1>
      {session?.user ? (
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          You are logged in as <strong>{session.user.email}</strong>.
        </p>
      ) : (
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Please log in to enjoy all features.
        </p>
      )}
    </main>
  );
}
