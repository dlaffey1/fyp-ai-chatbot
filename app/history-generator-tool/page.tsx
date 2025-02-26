"use client";

import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Toaster } from "react-hot-toast";
import { Chat } from "@/components/chat_askquestion";
import { Providers } from "@/components/providers";
import { HistoryAnswerForm } from "@/components/history_answer_form";

interface HistoryData {
  PC: string;
  HPC: string;
  PMHx: string;
  DHx: string;
  FHx: string;
  SHx: string;
  SR: string;
}

const SECTION_NAMES: { [key: string]: string } = {
  PC: "Presenting Complaint (PC)",
  HPC: "History of Presenting Complaint (HPC)",
  PMHx: "Past Medical History (PMHx)",
  DHx: "Drug History (DHx)",
  FHx: "Family History (FHx)",
  SHx: "Social History (SHx)",
  SR: "Systems Review (SR)",
};

export default function HistoryPage() {
  const [conditions, setConditions] = useState<string[]>([]);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const hasFetchedRef = useRef(false);

  // Fetch condition types from the backend.
  useEffect(() => {
    const fetchConditions = async () => {
      try {
        const res = await fetch("https://final-year-project-osce-simulator-1.onrender.com/get-conditions/");
        if (!res.ok) throw new Error("Failed to fetch conditions");
        const data = await res.json();
        setConditions(data.conditions || []);
      } catch (err) {
        console.error("Error fetching conditions:", err);
      }
    };

    fetchConditions();
  }, []);

  // Fetch history when a condition is selected.
  const handleSelectCondition = async (condition: string) => {
    setSelectedCondition(condition);
    setLoading(true);
    setOpen(false);

    try {
      const res = await fetch("https://final-year-project-osce-simulator-1.onrender.com/generate-history/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ condition }),
      });
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setHistory(data.history);
    } catch (err) {
      console.error("Error fetching history:", err);
      setHistory(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Providers attribute="class" defaultTheme="system" enableSystem>
      <div className="flex flex-col min-h-screen">
        <Toaster />

        {/* Condition Selector */}
        <div className="mb-6 flex flex-col items-center">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={open} className="w-[250px] justify-between">
                {selectedCondition ? conditions.find((c) => c === selectedCondition) : "Select a Condition..."}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
              <Command>
                <CommandInput placeholder="Search conditions..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No condition found.</CommandEmpty>
                  <CommandGroup>
                    {conditions.map((condition) => (
                      <CommandItem key={condition} value={condition} onSelect={() => handleSelectCondition(condition)}>
                        {condition}
                        <Check className={selectedCondition === condition ? "opacity-100 ml-auto" : "opacity-0"} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center items-center min-h-screen">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Display Structured History */}
        {!loading && history && (
          <div className="mx-auto max-w-2xl px-4 mt-6 space-y-6">
            <h2 className="text-lg font-semibold text-center">Patient History</h2>
            {Object.entries(history).map(([key, value]) => (
              <div key={key} className="rounded-lg border p-8">
                <h2 className="mb-2 text-lg font-semibold">{SECTION_NAMES[key] || key}</h2>
                <p className="leading-normal text-muted-foreground">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Chat Section */}
        {!loading && history && (
          <Chat className="mx-auto max-w-2xl px-4 mt-4" history={JSON.stringify(history)} />
        )}

        {/* History Answer Form – Only fetch questions once history is loaded */}
        {!loading && history && (
          <div className="mx-auto max-w-2xl px-4 mt-8 mb-32">
            <h2 className="text-xl font-semibold text-center mb-4">Answer the Questions</h2>
            <HistoryAnswerForm history={JSON.stringify(history)} />
          </div>
        )}
      </div>
    </Providers>
  );
}
