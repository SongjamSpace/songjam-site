"use client";

import { cn } from "@/lib/utils";

interface ShimmeringTextProps {
  text: string;
  className?: string;
}

export function ShimmeringText({ text, className }: ShimmeringTextProps) {
  return (
    <span
      className={cn(
        "relative inline-block bg-clip-text text-transparent",
        "bg-gradient-to-r from-gray-400 via-white to-gray-400",
        "bg-[length:200%_100%]",
        className
      )}
      style={{
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        animation: "shimmer 2s linear infinite",
      }}
    >
      {text}
    </span>
  );
}

