// // File: app/api/auth/[...nextauth]/route.js

// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { createClient } from "@supabase/supabase-js";

// // Create a Supabase client instance.
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

// const handler = NextAuth({
//   secret: process.env.NEXTAUTH_SECRET,
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text", placeholder: "your-email@example.com" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         const { email, password } = credentials;
//         // Use Supabase to verify the user's credentials.
//         const { data, error } = await supabase.auth.signInWithPassword({ email, password });
//         if (error || !data.user) {
//           return null;
//         }
//         // Return the user object. This should include the email.
//         return data.user;
//       },
//     }),
//   ],
//   callbacks: {
//     // The jwt callback runs when a token is created or updated.
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.email = user.email; // Ensure the email is stored in the token.
//       }
//       return token;
//     },
//     // The session callback defines what the session object contains.
//     async session({ session, token }) {
//       session.user = { id: token.id, email: token.email };
//       return session;
//     },
//   },
// });

// export { handler as GET, handler as POST };
