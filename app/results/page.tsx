import { OsceResultPerformanceChart } from "@/components/osce-result-performance-charts";
import { MarkingPerformanceCharts } from "@/components/marking_performance_charts";

export default function ResultsPage() {
  return (
    <>
      <div className="container mx-auto p-4">
        <OsceResultPerformanceChart />
      </div>
      <div className="container mx-auto p-4">
        <MarkingPerformanceCharts />
      </div>
    </>
  );
}
