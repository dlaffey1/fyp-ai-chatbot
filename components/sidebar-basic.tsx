// "use client";

// import * as React from "react";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import { IconSidebar } from "@/components/ui/icons";

// // If you have profile data coming in as a prop, you can type it accordingly.
// export interface SidebarProps {
//   session?: any;
// }

// export function Sidebar({ session }: SidebarProps) {
//   // Profile picture state (simulate fetching or use session info)
//   const [profilePic, setProfilePic] = React.useState<string>("/default-avatar.jpg");
//   const [profileVersion, setProfileVersion] = React.useState(0);

//   // Example: fetch profile picture on mount or when session changes.
//   React.useEffect(() => {
//     if (session?.user) {
//       // Replace this with your actual fetch logic:
//       // For example, call `/api/get-profile-picture?id=${session.user.id}`
//       setProfilePic("/default-avatar.jpg"); // Simulated value
//       setProfileVersion((prev) => prev + 1);
//     }
//   }, [session]);

//   // Sign-out handler (you may replace this with your actual sign-out logic)
//   const handleSignOut = async () => {
//     try {
//       const response = await fetch("/api/auth/sign-out", { method: "POST" });
//       if (!response.ok) throw new Error("Failed to sign out");
//       window.location.href = "/sign-in"; // Redirect after logout
//     } catch (error) {
//       console.error("Sign-out error:", error);
//     }
//   };

//   return (
//     <Sheet>
//       <SheetTrigger asChild>
//         <Button variant="ghost" className="-ml-2 h-9 w-9 p-0">
//           <IconSidebar className="h-6 w-6" />
//           <span className="sr-only">Toggle Sidebar</span>
//         </Button>
//       </SheetTrigger>
//       <SheetContent className="inset-y-0 flex h-auto w-[300px] flex-col p-0">
//         <SheetHeader className="p-4">
//           <SheetTitle className="text-sm">Navigation</SheetTitle>
//         </SheetHeader>

//         {/* Top Navigation Links */}
//         <div className="px-4 space-y-2">
//           <Link
//             href="/differential-diagnosis-study-tool"
//             className="block text-sm text-blue-500 hover:underline"
//           >
//             Differential-Diagnosis-Tool
//           </Link>
//           <Link
//             href="/history-generator-tool"
//             className="block text-sm text-blue-500 hover:underline"
//           >
//             History-Generator-Tool
//           </Link>
//         </div>

//         {/* Additional content (if any) can go here */}

//         {/* Bottom Profile Section */}
//         <div className="mt-auto flex items-center justify-between p-4 border-t">
//           <Link href="/profile">
//             <img
//               src={`${profilePic}?v=${profileVersion}`}
//               alt="Profile"
//               className="w-10 h-10 rounded-full object-cover border cursor-pointer hover:opacity-80 transition-opacity"
//             />
//           </Link>
//           <Button onClick={handleSignOut} variant="ghost" className="text-sm text-blue-500 hover:underline">
//             Sign Out
//           </Button>
//         </div>

//         {/* Optional: New Patient History Link */}
//         <div className="p-4 border-t">
//         </div>
//       </SheetContent>
//     </Sheet>
//   );
// }
