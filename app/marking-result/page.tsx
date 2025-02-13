"use client";

import { useSearchParams } from "next/navigation";

export default function MarkingResultPage() {
  const searchParams = useSearchParams();
  const resultString = searchParams.get("result") || "{}";
  let result;
  try {
    result = JSON.parse(resultString);
  } catch (e) {
    result = {
      overall_score: "0",
      overall_feedback: "No feedback provided.",
      section_scores: {},
      section_feedback: {}
    };
  }

  // Prepare overall score for display.
  const overallScoreStr = result.overall_score.toString().trim();
  const overallScoreDisplay = overallScoreStr.endsWith("%") ? overallScoreStr : `${overallScoreStr}%`;

  // Mapping of section keys to full names.
  const sectionNames: Record<string, string> = {
    "PC": "Presenting Complaint",
    "HPC": "History of Presenting Complaint",
    "PMHx": "Past Medical History",
    "DHx": "Drug History",
    "FHx": "Family History",
    "SHx": "Social History",
    "SR": "Systems Review"
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Big graphic showing the overall percentage */}
      <div className="bg-blue-500 text-white rounded-full w-48 h-48 flex items-center justify-center text-5xl font-bold">
        {overallScoreDisplay}
      </div>
      {/* Overall Feedback */}
      <div className="mt-8 max-w-2xl text-center">
        <h2 className="text-2xl font-semibold mb-4">Overall Feedback</h2>
        <p className="text-lg whitespace-pre-wrap">{result.overall_feedback}</p>
      </div>
      {/* Section Breakdown */}
      <div className="mt-8 max-w-2xl text-center">
        <h2 className="text-2xl font-semibold mb-4">Section Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.section_scores &&
            Object.entries(result.section_scores).map(([section, score]) => {
              const sectionName = sectionNames[section] || section;
              const scoreStr = score.toString().trim();
              const scoreDisplay = scoreStr.endsWith("%") ? scoreStr : `${scoreStr}%`;
              return (
                <div key={section} className="border p-4 rounded">
                  <h3 className="font-semibold">{sectionName}</h3>
                  <p className="text-lg mb-2">Score: {scoreDisplay}</p>
                  {result.section_feedback && result.section_feedback[section] && (
                    <p className="text-base whitespace-pre-wrap">
                      Feedback: {result.section_feedback[section]}
                    </p>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
