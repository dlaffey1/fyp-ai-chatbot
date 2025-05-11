"use client";

import { useEffect, useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabaseClient";
import { v5 as uuidv5 } from "uuid";
import { Calendar } from "@/components/ui/calendar";   // ← pull in your wrapper

const NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

export default function LoginCalendar() {
  const user = useUser();
  const [loginDates, setLoginDates] = useState<Date[]>([]);
  const computedUserId = user?.email
    ? uuidv5(user.email, NAMESPACE)
    : null;

  useEffect(() => {
    if (!computedUserId) return;
    (async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from("login_events")
        .select("logged_in_at")
        .eq("user_id", computedUserId)
        .gte("logged_in_at", startOfMonth.toISOString())
        .lte("logged_in_at", endOfMonth.toISOString());

      if (error) {
        console.error("Error fetching login events:", error);
        return;
      }

      const dates = Array.from(
        new Set(
          (data || []).map((r) =>
            new Date(r.logged_in_at).toDateString()
          )
        )
      ).map((d) => new Date(d));

      setLoginDates(dates);
    })();
  }, [computedUserId]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-medium mb-2">Your Logins This Month</h2>
      <Calendar
        showOutsideDays
        selected={loginDates}
        modifiersClassNames={{
          selected: "bg-primary text-primary-foreground",
          today:    "bg-accent text-accent-foreground",
        }}
      />
    </div>
  );
}
