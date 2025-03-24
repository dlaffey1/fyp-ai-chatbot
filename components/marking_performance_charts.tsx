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

// Define the shape of a marking result row we fetch from Supabase.
interface MarkingResult {
  right_disease: string;
  overall_score: string;       // e.g. "50%"
  history_taking_score: string;  // e.g. "75%"
}

// Define the shape for our chart data.
interface CategoryAverage {
  category: string;
  average: number;
}

const icdToCategory: { [key: string]: string } = {
  "410.9": "Cardiovascular",
  "592.1": "Urology",
  // Add more mappings here as needed.
};

export function MarkingPerformanceCharts() {
  const [overallData, setOverallData] = useState<CategoryAverage[]>([]);
  const [historyTakingData, setHistoryTakingData] = useState<CategoryAverage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchMarkingResults = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("user_uuid") || "";
      const { data: results, error } = await supabase
        .from<MarkingResult>("history_marking_results")
        .select("right_disease, overall_score, history_taking_score")
        .eq("user_id", userId);

      if (error) throw error;
      if (!results) return;

      // Group by category using our mapping. We'll assume each marking result has an ICD code in right_disease.
      const overallGroups: { [key: string]: number[] } = {};
      const htGroups: { [key: string]: number[] } = {};

      results.forEach((result) => {
        const category = icdToCategory[result.right_disease] || "Other";
        // Parse overall_score (strip "%" if exists).
        const overall = parseFloat(result.overall_score.replace("%", ""));
        // Parse history_taking_score.
        const htScore = parseFloat(result.history_taking_score.replace("%", ""));

        if (!isNaN(overall)) {
          if (!overallGroups[category]) overallGroups[category] = [];
          overallGroups[category].push(overall);
        }

        if (!isNaN(htScore)) {
          if (!htGroups[category]) htGroups[category] = [];
          htGroups[category].push(htScore);
        }
      });

      // Compute averages per category.
      const computeAverages = (groups: { [key: string]: number[] }): CategoryAverage[] =>
        Object.entries(groups).map(([category, scores]) => {
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          return { category, average: avg };
        });

      setOverallData(computeAverages(overallGroups));
      setHistoryTakingData(computeAverages(htGroups));
    } catch (error) {
      console.error("Error fetching marking results:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkingResults();
  }, []);

  return (
    <div className="space-y-12 p-4">
      <Card>
        <CardHeader className="items-center pb-4">
          <CardTitle>Overall History Section Performance</CardTitle>
          <CardDescription>
            Average overall evaluation score by category.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          {loading ? (
            <p>Loading data...</p>
          ) : overallData.length === 0 ? (
            <p>No data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={overallData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <Radar
                  name="Overall Score"
                  dataKey="average"
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
            <span>Overall History Performance</span>
          </div>
          <Button onClick={fetchMarkingResults} variant="outline">
            Refresh Data
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="items-center pb-4">
          <CardTitle>History-Taking Performance</CardTitle>
          <CardDescription>
            Average history-taking ability score by category.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          {loading ? (
            <p>Loading data...</p>
          ) : historyTakingData.length === 0 ? (
            <p>No data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={historyTakingData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <Radar
                  name="History-Taking Score"
                  dataKey="average"
                  stroke="#82ca9d"
                  fill="#82ca9d"
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
            <span>History-Taking Performance</span>
          </div>
          <Button onClick={fetchMarkingResults} variant="outline">
            Refresh Data
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
