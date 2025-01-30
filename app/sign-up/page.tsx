import { auth } from '@/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import SignUpClient from '../sign-up/sign-up-client' // Import Client Component

export default async function SignUpPage() {
  const cookieStore = cookies()
  const session = await auth({ cookieStore })

  // Redirect to home if user is already logged in
  if (session?.user) {
    redirect('/')
  }

  return <SignUpClient /> // Render Client Component
}
