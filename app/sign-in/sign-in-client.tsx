// app/sign-in/sign-in-client.tsx (Client Component)
"use client"; // ✅ Must be a Client Component

import { LoginButton } from '@/components/login-button';
import { LoginForm } from '@/components/login-form';
import { Separator } from '@/components/ui/separator';

export default function SignInClient() {
  return (
    <div className="flex h-screen flex-col items-center justify-center py-10">
      <div className="w-full max-w-sm">
        <LoginForm action="sign-in" />
        <Separator className="my-4" />
        <div className="flex justify-center">
          <LoginButton />
        </div>
      </div>
    </div>
  );
}
