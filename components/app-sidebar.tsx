"use client";

import * as React from "react";
import Link from "next/link";
// Removed static icon import; we load them dynamically below.
import { Switch } from "@/components/ui/switch"; 
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useApiUrl } from "@/config/contexts/api_url_context"; // Adjust the path if needed

export function AppSidebar({ session }: { session?: any }) {
  // Profile picture state – default to a fallback image.
  const [profilePic, setProfilePic] = React.useState("/default-avatar.jpg");
  const [profileVersion, setProfileVersion] = React.useState(0);

  const { apiUrl, setApiUrl } = useApiUrl();

  // Dynamic import state for lucide-react icons.
  const [icons, setIcons] = React.useState<{
    Home: React.FC<{ className?: string }>;
    Calendar: React.FC<{ className?: string }>;
    User: React.FC<{ className?: string }>;
    DollarSign: React.FC<{ className?: string }>;
    BarChart2: React.FC<{ className?: string }>;
    MessageSquare: React.FC<{ className?: string }>;
  } | null>(null);

  React.useEffect(() => {
    import("lucide-react").then((module) => {
      setIcons({
        Home: module.Home,
        Calendar: module.Calendar,
        User: module.User,
        DollarSign: module.DollarSign,
        BarChart2: module.BarChart2,
        MessageSquare: module.MessageSquare,
      });
    });
  }, []);

  // Debug: Log current API URL on render.
  React.useEffect(() => {
    console.debug("Current API URL:", apiUrl);
  }, [apiUrl]);

  // Function to fetch profile picture.
  const fetchProfilePicture = async () => {
    if (session?.user) {
      try {
        const res = await fetch(`/api/get-profile-picture?id=${session.user.id}`);
        if (!res.ok) throw new Error("Failed to fetch profile picture");
        const data = await res.json();
        // Use cache busting with the profileVersion.
        setProfilePic(
          data.avatar_url ? `${data.avatar_url}?v=${profileVersion}` : "/default-avatar.jpg"
        );
      } catch (err) {
        console.error("Error fetching profile picture:", err);
        setProfilePic("/default-avatar.jpg");
      }
    }
  };

  // Fetch the profile picture on mount and when session changes.
  React.useEffect(() => {
    fetchProfilePicture();
  }, [session, profileVersion]);

  // Toggle API URL between production and local.
  const toggleApiUrl = () => {
    if (apiUrl.includes("onrender.com")) {
      console.debug("Switching API URL to local");
      setApiUrl("http://localhost:8000");
    } else {
      console.debug("Switching API URL to production");
      setApiUrl("https://final-year-project-osce-simulator-1.onrender.com");
    }
  };

  return (
    <SidebarProvider>
      {icons ? (
        <Sidebar>
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold text-sidebar-foreground">My App</h2>
          </div>

          {/* Sidebar Content with Navigation Links */}
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/differential-diagnosis-study-tool"
                        className={cn(
                          "flex items-center text-sm text-sidebar-foreground hover:underline"
                        )}
                      >
                        <icons.Home className="mr-2" />
                        <span>Differential Diagnosis Tool</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/history-generator-tool"
                        className={cn(
                          "flex items-center text-sm text-sidebar-foreground hover:underline"
                        )}
                      >
                        <icons.Calendar className="mr-2" />
                        <span>History Generator Tool</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/realtime-differential-diagnosis"
                        className={cn(
                          "flex items-center text-sm text-sidebar-foreground hover:underline"
                        )}
                      >
                        <icons.DollarSign className="mr-2" />
                        <span>Realtime Differential Diagnosis</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/results"
                        className={cn(
                          "flex items-center text-sm text-sidebar-foreground hover:underline"
                        )}
                      >
                        <icons.BarChart2 className="mr-2" />
                        <span>Results</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/pricing"
                        className={cn(
                          "flex items-center text-sm text-sidebar-foreground hover:underline"
                        )}
                      >
                        <icons.DollarSign className="mr-2" />
                        <span>Pricing</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/sign-in"
                        className={cn(
                          "flex items-center text-sm text-sidebar-foreground hover:underline"
                        )}
                      >
                        <icons.User className="mr-2" />
                        <span>Sign In</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/feedback"
                        className={cn(
                          "flex items-center text-sm text-sidebar-foreground hover:underline"
                        )}
                      >
                        <icons.MessageSquare className="mr-2" />
                        <span>Feedback</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/differential-diagnosis-study-tool-feedback"
                        className={cn(
                          "flex items-center text-sm text-sidebar-foreground hover:underline"
                        )}
                      >
                        <icons.MessageSquare className="mr-2" />
                        <span>Differential Diagnosis Study Tool Feedback</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/history-generator-tool-profile"
                        className={cn(
                          "flex items-center text-sm text-sidebar-foreground hover:underline"
                        )}
                      >
                        <icons.MessageSquare className="mr-2" />
                        <span>DDx Study Tool Feedback</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/test"
                        className={cn(
                          "flex items-center text-sm text-sidebar-foreground hover:underline"
                        )}
                      >
                        <icons.MessageSquare className="mr-2" />
                        <span>Test page</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* Sidebar Footer with Profile Icon, Sign Out, and API URL Toggle */}
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center gap-2 mb-4">
              <Switch
                checked={apiUrl.includes("localhost")}
                onCheckedChange={toggleApiUrl}
              />
              <span className="text-sm text-sidebar-foreground">
                {apiUrl.includes("localhost") ? "Local" : "Production"}
              </span>
            </div>
            {session?.user ? (
              <div className="flex items-center justify-between">
                <Link href="/profile">
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </Link>
                <button
                  className="text-sm text-sidebar-foreground hover:underline"
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/auth/sign-out", {
                        method: "POST",
                      });
                      if (!response.ok) throw new Error("Failed to sign out");
                      window.location.href = "/sign-in";
                    } catch (error) {
                      console.error("Sign-out error:", error);
                    }
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/sign-in"
                className={cn("text-sm text-sidebar-foreground hover:underline")}
              >
                Sign In
              </Link>
            )}
          </SidebarFooter>
        </Sidebar>
      ) : (
        // Fallback if icons haven't loaded yet
        <p>Loading sidebar icons...</p>
      )}
      <SidebarTrigger />
    </SidebarProvider>
  );
}
