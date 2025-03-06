"use client";

import React, { useState, useEffect } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabaseClient";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

// Define the shape of your history session row.
interface HistorySession {
  category: string;
  q1_result: number;
  q2_result: number;
  q3_result: number;
  q4_result: number;
}

// Define the shape for our chart data.
interface CategoryAverage {
  category: string;
  percentage: number;
}

export function OsceResultPerformanceChart() {
  const [data, setData] = useState<CategoryAverage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch history session data from Supabase and group by category.
  const fetchData = async () => {
    setLoading(true);
    try {
      // Query the history_sessions table with q1_result–q4_result scores and the category.
      const { data: results, error } = await supabase
        .from("history_sessions")
        .select("category, q1_result, q2_result, q3_result, q4_result");

      if (error) throw error;

      if (results) {
        // Group results by category and compute an average for each row (across q1_result–q4_result).
        const groups: { [key: string]: number[] } = {};
        results.forEach((result: HistorySession) => {
          // Make sure all scores exist.
          if (
            result.category &&
            result.q1_result !== null &&
            result.q2_result !== null &&
            result.q3_result !== null &&
            result.q4_result !== null
          ) {
            // Calculate the average score for the row.
            const rowAvg =
              (result.q1_result +
                result.q2_result +
                result.q3_result +
                result.q4_result) /
              4;
            if (!groups[result.category]) {
              groups[result.category] = [];
            }
            groups[result.category].push(rowAvg);
          }
        });

        // Compute the overall average for each category.
        const averages: CategoryAverage[] = Object.entries(groups).map(
          ([category, scores]) => {
            const sum = scores.reduce((acc, cur) => acc + cur, 0);
            const avg = sum / scores.length;
            return { category, percentage: avg };
          }
        );

        setData(averages);
      }
    } catch (error) {
      console.error("Error fetching history sessions data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>OSCE Result Performance Chart</CardTitle>
        <CardDescription>
          Average percentage score per category (based on Q1–Q4).
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        {loading ? (
          <p>Loading data...</p>
        ) : data.length === 0 ? (
          <p>No data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <Radar
                name="Average Percentage"
                dataKey="percentage"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <RechartsTooltip />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
      <CardFooter className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium">
          <TrendingUp className="h-4 w-4" />
          <span>OSCE Data</span>
        </div>
        <Button onClick={fetchData} variant="outline">
          Refresh Data
        </Button>
      </CardFooter>
    </Card>
  );
}
