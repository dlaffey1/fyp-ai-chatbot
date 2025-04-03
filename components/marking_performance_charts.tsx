"use client";

import { useEffect, useState } from "react";
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
import { useApiUrl } from "@/config/contexts/api_url_context";
import { useUser } from "@supabase/auth-helpers-react";
import { v5 as uuidv5 } from "uuid";

// Dynamically import the TrendingUp icon.
const TrendingUp = dynamic(
  () => import("lucide-react").then((mod) => mod.TrendingUp),
  { ssr: false }
);

// Define the shape of a marking result row from our profile database.
interface MarkingResult {
  right_disease: string;
  overall_score: string;       // e.g. "75%"
  history_taking_score: string;  // e.g. "80%"
}

// Define the shape for our chart data.
interface CategoryAverage {
  category: string;
  average: number;
}

// Define the expected response from get_category_by_condition_profile.
interface CategoryResponse {
  category: string;
}

export function MarkingPerformanceCharts() {
  const [overallData, setOverallData] = useState<CategoryAverage[]>([]);
  const [historyTakingData, setHistoryTakingData] = useState<CategoryAverage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  // We'll build the ICD mapping from our endpoint for each unique condition.
  const [icdMapping, setIcdMapping] = useState<Record<string, string>>({});
  const { apiUrl } = useApiUrl();

  // Get the current user and compute their deterministic user_id.
  const user = useUser();
  const user_email = user?.email || "";
  const NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
  const computedUserId = user_email ? uuidv5(user_email, NAMESPACE) : "";

  // Log the generated UUID whenever it changes.
  useEffect(() => {
    console.log("Generated user ID (uuid):", computedUserId);
  }, [computedUserId]);

  // Function to fetch category for a single condition using your endpoint.
  const fetchCategoryForCondition = async (condition: string): Promise<string> => {
    try {
      const res = await fetch(
        `${apiUrl}/get_category_by_condition_profile/?condition=${encodeURIComponent(condition)}`
      );
      if (res.ok) {
        const data: CategoryResponse = await res.json();
        console.log(`Fetched category for ${condition}:`, data.category);
        return data.category.toLowerCase();
      } else {
        console.error(`Error fetching category for ${condition}:`, res.status);
        return "other";
      }
    } catch (e) {
      console.error(`Exception fetching category for ${condition}:`, e);
      return "other";
    }
  };

  // Fetch marking results and build ICD mapping by calling the endpoint for each unique condition.
  const fetchMarkingResults = async () => {
    setLoading(true);
    try {
      // Query marking results only for the current user.
      const { data: results, error } = await supabase
        .from("history_entries_with_profiles")
        .select("right_disease, overall_score, history_taking_score")
        .eq("user_id", computedUserId);

      if (error) throw error;
      if (!results) {
        console.log("No results returned from query.");
        return;
      }
      console.log("Results from Supabase:", results);

      // Build a unique list of conditions.
      const uniqueConditions = Array.from(
        new Set(results.map((r) => r.right_disease))
      );
      console.log("Unique conditions:", uniqueConditions);

      // For each unique condition, fetch its category.
      const mappingEntries = await Promise.all(
        uniqueConditions.map(async (cond) => {
          const cat = await fetchCategoryForCondition(cond);
          return [cond, cat] as [string, string];
        })
      );
      const mapping: Record<string, string> = Object.fromEntries(mappingEntries);
      console.log("Built ICD mapping:", mapping);
      setIcdMapping(mapping);

      // Now group results by category using the built mapping.
      const overallGroups: { [key: string]: number[] } = {};
      const htGroups: { [key: string]: number[] } = {};

      results.forEach((result) => {
        const category = mapping[result.right_disease] || "other";
        // Parse overall_score.
        if (result.overall_score) {
          const overall = parseFloat(result.overall_score.replace("%", ""));
          if (!isNaN(overall)) {
            if (!overallGroups[category]) overallGroups[category] = [];
            overallGroups[category].push(overall);
          }
        }
        // Parse history-taking score.
        const htScore = parseFloat(result.history_taking_score.replace("%", ""));
        if (!isNaN(htScore)) {
          if (!htGroups[category]) htGroups[category] = [];
          htGroups[category].push(htScore);
        }
      });
      console.log("Overall groups:", overallGroups);
      console.log("History-taking groups:", htGroups);

      // Compute averages per category.
      const computeAverages = (groups: { [key: string]: number[] }): CategoryAverage[] =>
        Object.entries(groups).map(([category, scores]) => {
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          return { category, average: avg };
        });

      const overallAverages = computeAverages(overallGroups);
      const htAverages = computeAverages(htGroups);

      console.log("Overall averages:", overallAverages);
      console.log("History-taking averages:", htAverages);

      setOverallData(overallAverages);
      setHistoryTakingData(htAverages);
    } catch (error) {
      console.error("Error fetching marking results:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch marking results on mount.
  useEffect(() => {
    if (computedUserId) {
      fetchMarkingResults();
    }
  }, [apiUrl, computedUserId]);

  return (
    <div className="space-y-12 p-4">
      <Card>
        <CardHeader className="items-center pb-4">
          <CardTitle>Overall History Performance</CardTitle>
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
