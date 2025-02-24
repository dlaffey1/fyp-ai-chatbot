// components/ui/section.tsx
import React from "react";
import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section className={cn("my-8", className)} {...props}>
      {children}
    </section>
  );
}
