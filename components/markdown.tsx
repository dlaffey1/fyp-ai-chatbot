"use client";

import React, { FC, memo } from "react";
import dynamic from "next/dynamic";

// Cast the import as a Promise whose default export is a React component.
const DynamicReactMarkdown = dynamic(
  () => import("react-markdown") as Promise<{ default: React.ComponentType<any> }>,
  { ssr: false }
);

export const MemoizedReactMarkdown: FC<any> = memo(
  DynamicReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
);
