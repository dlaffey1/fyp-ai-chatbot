"use client";

import * as React from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

// Hardcoded benchmark data for OSCE categories.
const osceBenchmarkData = [
  { category: "Cardiovascular", score: 80 },
  { category: "Respiratory", score: 70 },
  { category: "Neurology", score: 90 },
  { category: "Gastrointestinal", score: 65 },
  { category: "Musculoskeletal", score: 75 },
];

// Simulated dynamic user assessment data.
const osceUserData = [
  { category: "Cardiovascular", score: 78 },
  { category: "Respiratory", score: 72 },
  { category: "Neurology", score: 85 },
  { category: "Gastrointestinal", score: 68 },
  { category: "Musculoskeletal", score: 80 },
];

export function OscePerformanceCharts() {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Hardcoded Benchmark Chart */}
      <Card className="flex-1">
        <CardHeader className="items-center pb-4">
          <CardTitle>OSCE Performance (Benchmark)</CardTitle>
          <CardDescription>
            Hardcoded benchmark scores for OSCE categories.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={osceBenchmarkData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <Radar
                name="Benchmark"
                dataKey="score"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
        <CardFooter className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <TrendingUp className="h-4 w-4" />
            <span>Benchmark Data</span>
          </div>
        </CardFooter>
      </Card>

      {/* Dynamic User Data Chart */}
      <Card className="flex-1">
        <CardHeader className="items-center pb-4">
          <CardTitle>OSCE Performance (User Results)</CardTitle>
          <CardDescription>
            Your performance scores based on recent assessments.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={osceUserData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <Radar
                name="User Score"
                dataKey="score"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
        <CardFooter className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <TrendingUp className="h-4 w-4" />
            <span>User Assessment Data</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
