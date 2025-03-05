"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of our context.
interface ApiUrlContextType {
  apiUrl: string;
  setApiUrl: (url: string) => void;
}

// Create the context.
const ApiUrlContext = createContext<ApiUrlContextType | undefined>(undefined);

// Provider component.
export const ApiUrlProvider = ({ children }: { children: ReactNode }) => {
  // Use the NEXT_PUBLIC_API_URL if defined; otherwise default to production.
  const [apiUrl, setApiUrl] = useState(
    process.env.NEXT_PUBLIC_API_URL ||
      "https://final-year-project-osce-simulator-1.onrender.com"
  );

  return (
    <ApiUrlContext.Provider value={{ apiUrl, setApiUrl }}>
      {children}
    </ApiUrlContext.Provider>
  );
};

// Hook to use the API URL context.
export const useApiUrl = () => {
  const context = useContext(ApiUrlContext);
  if (!context) {
    throw new Error("useApiUrl must be used within an ApiUrlProvider");
  }
  return context;
};
