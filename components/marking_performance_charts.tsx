"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
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

// Dynamically import the TrendingUp icon
const TrendingUp = dynamic(
  () => import("lucide-react").then((mod) => mod.TrendingUp),
  { ssr: false }
);

// Define the shape of a marking result row from Supabase.
interface MarkingResult {
  right_disease: string;
  overall_score: string;       // e.g. "50%"
  history_taking_score: string; // e.g. "75%"
}

// Define the shape for our chart data.
interface CategoryAverage {
  category: string;
  average: number;
}

// Define the expected shape of each ICD mapping record.
interface IcdMapping {
  icd: string;
  category: string;
}

export function MarkingPerformanceCharts() {
  const [overallData, setOverallData] = useState<CategoryAverage[]>([]);
  const [historyTakingData, setHistoryTakingData] = useState<CategoryAverage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [icdMapping, setIcdMapping] = useState<Record<string, string>>({});

  // Fetch ICD-to-category mapping from the endpoint.
  const fetchIcdMapping = async () => {
    try {
      const { data, error } = await supabase
        .from("icd_to_category")
        .select("icd, category") as { data: IcdMapping[] | null; error: any };
      if (error) throw error;
      if (!data) return;
      // Transform the array into a lookup object.
      const mapping: Record<string, string> = {};
      data.forEach((row) => {
        mapping[row.icd] = row.category;
      });
      setIcdMapping(mapping);
    } catch (error) {
      console.error("Error fetching ICD mapping:", error);
    }
  };

  const fetchMarkingResults = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("user_uuid") || "";
      // Cast the response to bypass the deep type instantiation issue.
      const { data: results, error } = await supabase
        .from("history_marking_results")
        .select("right_disease, overall_score, history_taking_score")
        .eq("user_id", userId) as { data: MarkingResult[] | null; error: any };

      if (error) throw error;
      if (!results) return;

      // Group results by category using the fetched ICD mapping.
      const overallGroups: { [key: string]: number[] } = {};
      const htGroups: { [key: string]: number[] } = {};

      results.forEach((result) => {
        const category = icdMapping[result.right_disease] || "Other";
        // Parse scores (remove "%" if it exists).
        const overall = parseFloat(result.overall_score.replace("%", ""));
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

  // Fetch the ICD mapping when the component mounts.
  useEffect(() => {
    fetchIcdMapping();
  }, []);

  // Once the ICD mapping is available, fetch the marking results.
  useEffect(() => {
    if (Object.keys(icdMapping).length > 0) {
      fetchMarkingResults();
    }
  }, [icdMapping]);

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
