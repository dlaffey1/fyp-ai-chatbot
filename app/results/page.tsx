// app/results/page.tsx
"use client";

import React from "react";
import { OscePerformanceCharts } from "@/components/osce-result-performance-charts";

export default function ResultsPage() {
  return (
    <div className="container mx-auto p-4">
      <OscePerformanceCharts />
    </div>
  );
}
