"use client";

import { OsceResultPerformanceChart } from "@/components/osce-result-performance-charts";
import { MarkingPerformanceCharts } from "@/components/marking_performance_charts";

export default function ResultsPage() {
  return (
    <div className="container mx-auto space-y-12 p-4">
      <div>
        <OsceResultPerformanceChart />
      </div>
      <div>
        <MarkingPerformanceCharts />
      </div>
    </div>
  );
}
