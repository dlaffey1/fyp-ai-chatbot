"use client";

import { useSearchParams } from "next/navigation";
import ReactFlow, { ReactFlowProvider, Node, Edge, Background } from "reactflow";
import 'reactflow/dist/style.css';

// Helper function to parse profile nodes and produce readable labels.
function parseProfileNode(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("D node:")) {
    // Extract the JSON part after "D node:"
    const jsonPart = trimmed.substring("D node:".length).trim();
    try {
      const obj = JSON.parse(jsonPart);
      let options = [];
      if (Array.isArray(obj.triples)) {
        // Use the third element from each triple (i.e. the treatment option)
        options = obj.triples.map((triple: any) => triple[2]);
      }
      return `Decision Node: Options - ${options.join(", ")} (Logical: ${obj.logical_rel})`;
    } catch (e) {
      // If parsing fails, return the original text.
      return trimmed;
    }
  }
  // For question nodes, remove any wrapping quotes.
  return trimmed.replace(/^"+|"+$/g, '');
}

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
      section_feedback: {},
      history_taking_feedback: "No history-taking feedback provided.",
      history_taking_score: "0",
      profile_questions: []
    };
  }

  // Prepare overall score for display.
  const overallScoreStr = String(result.overall_score).trim();
  const overallScoreDisplay = overallScoreStr.endsWith("%")
    ? overallScoreStr
    : `${overallScoreStr}%`;

  // Mapping of section keys to full names.
  const sectionNames: Record<string, string> = {
    PC: "Presenting Complaint",
    HPC: "History of Presenting Complaint",
    PMHx: "Past Medical History",
    DHx: "Drug History",
    FHx: "Family History",
    SHx: "Social History",
    SR: "Systems Review"
  };

  // Extract history-taking feedback and profile questions.
  const historyTakingText = result.history_taking_feedback || "No history-taking feedback provided.";
  const historyTakingScore = result.history_taking_score || "0";
  const profileQuestions: string[] = result.profile_questions || [];

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Overall Score Display */}
        <div className="flex flex-col items-center">
          <div className="rounded-full w-40 h-40 flex items-center justify-center text-5xl font-bold bg-primary dark:bg-primary-dark text-primary-foreground shadow-lg">
            {overallScoreDisplay}
          </div>
          <h1 className="mt-4 text-3xl font-bold text-foreground dark:text-foreground-dark">Overall Evaluation</h1>
        </div>

        {/* Overall Feedback */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-3 text-foreground dark:text-foreground-dark">Overall Feedback</h2>
          <p className="text-lg whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {result.overall_feedback}
          </p>
        </div>

        {/* Section Breakdown */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-foreground dark:text-foreground-dark">Section Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.section_scores &&
              Object.entries(result.section_scores).map(([section, score]) => {
                const sectionName = sectionNames[section] || section;
                const scoreStr = String(score).trim();
                const scoreDisplay = scoreStr.endsWith("%") ? scoreStr : `${scoreStr}%`;
                return (
                  <div key={section} className="border p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <h3 className="font-semibold text-xl text-foreground dark:text-foreground-dark">{sectionName}</h3>
                    <p className="text-lg text-blue-600 dark:text-blue-400">Score: {scoreDisplay}</p>
                    {result.section_feedback && result.section_feedback[section] && (
                      <p className="text-base whitespace-pre-wrap text-gray-600 dark:text-gray-300 mt-2">
                        Feedback: {result.section_feedback[section]}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* History-Taking Feedback */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-foreground dark:text-foreground-dark">History-Taking Feedback</h2>
          <p className="text-lg whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {historyTakingText}
          </p>
          <p className="mt-3 text-lg font-semibold text-blue-600 dark:text-blue-400">
            Score: {historyTakingScore.endsWith("%") ? historyTakingScore : `${historyTakingScore}%`}
          </p>
        </div>

        {/* Profile Questions (Text List) */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-foreground dark:text-foreground-dark">Profile Questions</h2>
          {profileQuestions.length > 0 ? (
            <ul className="space-y-3">
              {profileQuestions.map((question: string, index: number) => (
                <li key={index} className="border p-3 rounded-md text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700">
                  {parseProfileNode(question)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-lg text-gray-600 dark:text-gray-300">No profile questions generated.</p>
          )}
        </div>

        {/* Graphical Decision Making Tree */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-foreground dark:text-foreground-dark">Question Logic Tree Diagram</h2>
          <LogicTreeGraph profileQuestions={profileQuestions} />
        </div>
      </div>
    </div>
  );
}

// New component: LogicTreeGraph using React Flow
function LogicTreeGraph({ profileQuestions }: { profileQuestions: string[] }) {
  // Build nodes and edges from the profile questions.
  // We assume that a question (not starting with "D node:") is a parent,
  // and any following D node entries are children, until a new question is encountered.
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let currentParentId: string | null = null;
  let y = 0;
  let idCounter = 1;

  profileQuestions.forEach((item) => {
    const label = parseProfileNode(item);
    const id = `node_${idCounter++}`;
    const isDecision = item.trim().startsWith("D node:");
    if (!isDecision) {
      // It's a question node.
      currentParentId = id;
      nodes.push({
        id,
        data: { label: `Q: ${label}` },
        position: { x: 50, y },
      });
    } else {
      // It's a decision node.
      nodes.push({
        id,
        data: { label: `D: ${label}` },
        position: { x: 300, y },
      });
      if (currentParentId) {
        edges.push({
          id: `edge_${currentParentId}_${id}`,
          source: currentParentId,
          target: id,
          animated: true,
        });
      }
    }
    y += 100;
  });

  return (
    <ReactFlowProvider>
      <div style={{ height: Math.max(y, 300) }}>
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}
