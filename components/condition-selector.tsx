"use client";

import React, { useEffect, useState } from "react";
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
import { cn } from "@/lib/utils";
import { useApiUrl } from "@/config/contexts/api_url_context";

// Removed static import of icons:
// import { Check, ChevronsUpDown } from "lucide-react";

interface ConditionSelectorProps {
  onConditionSelect: (selection: { category: string; condition: string }) => void;
}

export default function ConditionSelector({ onConditionSelect }: ConditionSelectorProps) {
  const [generalCategories, setGeneralCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [conditions, setConditions] = useState<string[]>([]);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { apiUrl } = useApiUrl();

  // Dynamically import lucide-react icons.
  const [icons, setIcons] = useState<{
    Check: React.FC<{ className?: string }>;
    ChevronsUpDown: React.FC<{ className?: string }>;
  } | null>(null);

  useEffect(() => {
    import("lucide-react").then((module) => {
      setIcons({
        Check: module.Check,
        ChevronsUpDown: module.ChevronsUpDown,
      });
    });
  }, []);

  // Always call hooks before rendering.
  // Instead of returning early, include a fallback in the JSX.
  
  // Fetch general categories from your backend endpoint.
  useEffect(() => {
    const fetchCategories = async () => {
      console.log("Fetching general categories from:", `${apiUrl}/get_general_condition_categories/`);
      try {
        const res = await fetch(`${apiUrl}/get_general_condition_categories/`);
        if (!res.ok) throw new Error("Failed to fetch general categories");
        const data = await res.json();
        console.log("General categories fetched:", data.categories);
        setGeneralCategories(data.categories || []);
      } catch (err) {
        console.error("Error fetching general categories:", err);
      }
    };
    fetchCategories();
  }, [apiUrl]);

  // When a general category is selected, fetch specific conditions.
  const handleSelectGeneralCategory = async (category: string) => {
    console.log("General category selected:", category);
    setSelectedCategory(category);
    setSelectedCondition(null);
    try {
      const url = `${apiUrl}/get_conditions_by_category/?category=${encodeURIComponent(category)}`;
      console.log("Fetching conditions for category from:", url);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch conditions for category");
      const data = await res.json();
      console.log("Conditions fetched for category:", data.conditions);
      setConditions(data.conditions || []);
    } catch (err) {
      console.error("Error fetching conditions for category:", err);
      setConditions([]);
    }
  };

  // When a specific condition is selected, notify the parent.
  const handleSelectCondition = (condition: string) => {
    console.log("Specific condition selected:", condition);
    setSelectedCondition(condition);
    setOpen(false);
    if (selectedCategory) {
      onConditionSelect({ category: selectedCategory, condition });
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* If icons haven't loaded, show fallback within the component */}
      {icons ? null : <p>Loading icons...</p>}
      <Popover
        open={open}
        onOpenChange={(value) => {
          console.log("Popover open state changed:", value);
          setOpen(value);
        }}
      >
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[250px] justify-between">
            {selectedCondition
              ? selectedCondition
              : selectedCategory
              ? `Category: ${selectedCategory}`
              : "Select a Condition..."}
            {icons && <icons.ChevronsUpDown className="opacity-50" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <Command>
            <CommandInput placeholder="Search..." className="h-9" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {!selectedCategory && (
                <CommandGroup heading="General Categories">
                  {generalCategories.map((category) => (
                    <CommandItem key={category} onSelect={() => handleSelectGeneralCategory(category)}>
                      {category}
                      {icons && (
                        <icons.Check
                          className={
                            selectedCategory === category
                              ? "opacity-100 ml-auto"
                              : "opacity-0 ml-auto"
                          }
                        />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {selectedCategory && (
                <CommandGroup heading={`Conditions in ${selectedCategory}`}>
                  {conditions.map((condition) => (
                    <CommandItem key={condition} onSelect={() => handleSelectCondition(condition)}>
                      {condition}
                      {icons && (
                        <icons.Check
                          className={
                            selectedCondition === condition
                              ? "opacity-100 ml-auto"
                              : "opacity-0 ml-auto"
                          }
                        />
                      )}
                    </CommandItem>
                  ))}
                  <CommandItem onSelect={() => {
                    console.log("Going back to general categories");
                    setSelectedCategory(null);
                    setConditions([]);
                  }}>
                    ← Back to Categories
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
