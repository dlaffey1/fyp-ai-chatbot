// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Check, ChevronsUpDown } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Toaster } from "react-hot-toast";
// import { Chat } from "@/components/chat_askquestion";
// import { Providers } from "@/components/providers";

// interface HistoryData {
//   PC: string;
//   HPC: string;
//   PMHx: string;
//   DHx: string;
//   FHx: string;
//   SHx: string;
//   SR: string;
// }

// // ✅ Mapping object for full section names
// const SECTION_NAMES: { [key: string]: string } = {
//   PC: "Presenting Complaint (PC)",
//   HPC: "History of Presenting Complaint (HPC)",
//   PMHx: "Past Medical History (PMHx)",
//   DHx: "Drug History (DHx)",
//   FHx: "Family History (FHx)",
//   SHx: "Social History (SHx)",
//   SR: "Systems Review (SR)",
// };

// export default function HistoryPage() {
//   const [categories, setCategories] = useState<string[]>([]);
//   const [conditions, setConditions] = useState<string[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
//   const [history, setHistory] = useState<HistoryData | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [categoryOpen, setCategoryOpen] = useState(false);
//   const [conditionOpen, setConditionOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState<string>("");

//   // ✅ Fetch categories (e.g., Cardiovascular, Neurological)
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await fetch("http://127.0.0.1:8000/get-history-categories/");
//         if (!res.ok) throw new Error("Failed to fetch categories");
//         const data = await res.json();
//         setCategories(data.categories || []);
//       } catch (err) {
//         console.error("Error fetching categories:", err);
//       }
//     };

//     fetchCategories();
//   }, []);

//   // ✅ Fetch conditions dynamically when a category is selected
//   useEffect(() => {
//     if (!selectedCategory) return;

//     const fetchConditions = async () => {
//       try {
//         const res = await fetch(
//           `http://127.0.0.1:8000/get-conditions/?search=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(selectedCategory)}`
//         );
//         if (!res.ok) throw new Error("Failed to fetch conditions");

//         const data = await res.json();
//         setConditions(data.conditions || []);
//       } catch (err) {
//         console.error("Error fetching conditions:", err);
//       }
//     };

//     const timeout = setTimeout(fetchConditions, 300); // Debounce API calls
//     return () => clearTimeout(timeout);
//   }, [searchTerm, selectedCategory]);

//   // ✅ Fetch history when an ICD condition is selected
//   const handleSelectCondition = async (condition: string) => {
//     setSelectedCondition(condition);
//     setLoading(true);
//     setConditionOpen(false);

//     try {
//       const res = await fetch("http://127.0.0.1:8000/generate-history/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ condition }),
//       });
//       if (!res.ok) throw new Error("Failed to fetch history");

//       const data = await res.json();
//       setHistory(data.history);
//     } catch (err) {
//       console.error("Error fetching history:", err);
//       setHistory(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Providers attribute="class" defaultTheme="system" enableSystem>
//       <div className="flex flex-col min-h-screen">
//         <Toaster />

//         {/* ✅ Category Selector */}
//         <div className="mb-4 flex flex-col items-center">
//           <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
//             <PopoverTrigger asChild>
//               <Button variant="outline" role="combobox" aria-expanded={categoryOpen} className="w-[250px] justify-between">
//                 {selectedCategory || "Select a Category..."}
//                 <ChevronsUpDown className="opacity-50" />
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-[250px] p-0">
//               <Command>
//                 <CommandList>
//                   <CommandEmpty>No category found.</CommandEmpty>
//                   <CommandGroup>
//                     {categories.map((category) => (
//                       <CommandItem
//                         key={category}
//                         value={category}
//                         onSelect={() => {
//                           setSelectedCategory(category);
//                           setSelectedCondition(null);
//                           setCategoryOpen(false);
//                         }}
//                       >
//                         {category}
//                         <Check className={selectedCategory === category ? "opacity-100 ml-auto" : "opacity-0"} />
//                       </CommandItem>
//                     ))}
//                   </CommandGroup>
//                 </CommandList>
//               </Command>
//             </PopoverContent>
//           </Popover>
//         </div>

//         {/* ✅ Condition Selector (ICD Codes under selected category) */}
//         {selectedCategory && (
//           <div className="mb-6 flex flex-col items-center">
//             <Popover open={conditionOpen} onOpenChange={setConditionOpen}>
//               <PopoverTrigger asChild>
//                 <Button variant="outline" role="combobox" aria-expanded={conditionOpen} className="w-[250px] justify-between">
//                   {selectedCondition ? selectedCondition : "Select a Condition..."}
//                   <ChevronsUpDown className="opacity-50" />
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-[250px] p-0">
//                 <Command>
//                   <CommandInput
//                     placeholder="Search conditions..."
//                     className="h-9"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                   />
//                   <CommandList>
//                     <CommandEmpty>No condition found.</CommandEmpty>
//                     <CommandGroup>
//                       {conditions.map((condition) => (
//                         <CommandItem
//                           key={condition}
//                           value={condition}
//                           onSelect={() => handleSelectCondition(condition)}
//                         >
//                           {condition}
//                           <Check className={selectedCondition === condition ? "opacity-100 ml-auto" : "opacity-0"} />
//                         </CommandItem>
//                       ))}
//                     </CommandGroup>
//                   </CommandList>
//                 </Command>
//               </PopoverContent>
//             </Popover>
//           </div>
//         )}

//         {/* ✅ Show Loading Spinner */}
//         {loading && (
//           <div className="flex justify-center items-center min-h-screen">
//             <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
//           </div>
//         )}

//         {/* ✅ Show the structured History (Only when loaded) */}
//         {!loading && history && (
//           <div className="mx-auto max-w-2xl px-4 mt-6 space-y-6">
//             <h2 className="text-lg font-semibold text-center">Patient History</h2>

//             {Object.entries(history).map(([key, value]) => (
//               <div key={key} className="rounded-lg border p-8">
//                 <h2 className="mb-2 text-lg font-semibold">{SECTION_NAMES[key] || key}</h2>
//                 <p className="leading-normal text-muted-foreground">{value}</p>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* ✅ Chat section that references history */}
//         {!loading && history && (
//           <Chat className="mx-auto max-w-2xl px-4 mt-4" history={JSON.stringify(history)} />
//         )}
//       </div>
//     </Providers>
//   );
// }


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

interface HistoryData {
  PC: string;
  HPC: string;
  PMHx: string;
  DHx: string;
  FHx: string;
  SHx: string;
  SR: string;
}

// ✅ Mapping object for full section names
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

  // ✅ Fetch condition types from the backend
  useEffect(() => {
    const fetchConditions = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/get-conditions/");
        if (!res.ok) throw new Error("Failed to fetch conditions");

        const data = await res.json();
        setConditions(data.conditions || []);
      } catch (err) {
        console.error("Error fetching conditions:", err);
      }
    };

    fetchConditions();
  }, []);

  // ✅ Fetch history when condition is selected
  const handleSelectCondition = async (condition: string) => {
    setSelectedCondition(condition);
    setLoading(true);
    setOpen(false);

    try {
      const res = await fetch("http://127.0.0.1:8000/generate-history/", {
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

        {/* ✅ Condition Selector (Combobox) */}
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
                      <CommandItem
                        key={condition}
                        value={condition}
                        onSelect={() => handleSelectCondition(condition)}
                      >
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

        {/* ✅ Show Loading Spinner */}
        {loading && (
          <div className="flex justify-center items-center min-h-screen">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* ✅ Show the structured History (Only when loaded) */}
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

        {/* ✅ Chat section that references history */}
        {!loading && history && (
          <Chat className="mx-auto max-w-2xl px-4 mt-4" history={JSON.stringify(history)} />
        )}
      </div>
    </Providers>
  );
}
