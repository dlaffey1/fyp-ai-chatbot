"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { IconMoon, IconSun } from "@/components/ui/icons";

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const [_, startTransition] = React.useTransition();

  // Set mounted to true once the component is mounted on the client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // While not mounted, render null (or a fallback that matches the server)
  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        startTransition(() => {
          setTheme(theme === "light" ? "dark" : "light");
        });
      }}
    >
      {theme === "dark" ? (
        <IconMoon className="transition-all" />
      ) : (
        <IconSun className="transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
