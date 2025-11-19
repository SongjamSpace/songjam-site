"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface OrbProps {
  className?: string;
  volumeMode?: "manual" | "auto";
  getInputVolume?: () => number;
  getOutputVolume?: () => number;
  imageSrc?: string;
}

export function Orb({
  className,
  volumeMode = "auto",
  getInputVolume,
  getOutputVolume,
  imageSrc,
}: OrbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(null);
  const [currentState, setCurrentState] = useState<
    "idle" | "listening" | "speaking"
  >("idle");

  useEffect(() => {
    if (volumeMode !== "manual" || !getInputVolume || !getOutputVolume) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const updateOrb = () => {
      const inputVolume = getInputVolume();
      const outputVolume = getOutputVolume();
      const activeVolume = Math.max(inputVolume, outputVolume);
      const isListening = inputVolume > outputVolume && inputVolume > 0.05;
      const isSpeaking = outputVolume > inputVolume && outputVolume > 0.05;

      // Update CSS custom properties for animation
      container.style.setProperty("--volume", activeVolume.toString());
      container.style.setProperty(
        "--pulse-scale",
        (1 + activeVolume * 0.5).toString()
      );
      container.style.setProperty(
        "--glow-opacity",
        (0.3 + activeVolume * 0.7).toString()
      );

      if (isListening) {
        container.setAttribute("data-state", "listening");
        setCurrentState("listening");
      } else if (isSpeaking) {
        container.setAttribute("data-state", "speaking");
        setCurrentState("speaking");
      } else {
        container.setAttribute("data-state", "idle");
        setCurrentState("idle");
      }

      animationFrameRef.current = requestAnimationFrame(updateOrb);
    };

    updateOrb();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [volumeMode, getInputVolume, getOutputVolume]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full rounded-full cursor-pointer transition-all duration-500",
        // Base gradient - idle state (default)
        "bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-cyan-500/30",
        // Outer glow layer - more prominent and pulsing
        "before:absolute before:inset-[-25%] before:rounded-full",
        "before:bg-gradient-to-br before:from-blue-400/60 before:via-purple-400/60 before:to-cyan-400/60",
        "before:opacity-[var(--glow-opacity,0.7)] before:blur-3xl",
        "before:scale-[var(--pulse-scale,1.15)] before:transition-all before:duration-1000",
        "before:animate-pulse",
        // Idle state - pulsing blue/purple/cyan (default)
        "[&[data-state=idle]]:from-blue-500/30 [&[data-state=idle]]:via-purple-500/30 [&[data-state=idle]]:to-cyan-500/30",
        "[&[data-state=idle]]:before:from-blue-400/70 [&[data-state=idle]]:before:via-purple-400/70 [&[data-state=idle]]:before:to-cyan-400/70",
        "[&[data-state=idle]]:shadow-[0_0_40px_rgba(59,130,246,0.5),0_0_80px_rgba(147,51,234,0.4),0_0_120px_rgba(6,182,212,0.3)]",
        // Listening state - blue/cyan
        "[&[data-state=listening]]:from-blue-500/40 [&[data-state=listening]]:via-cyan-500/40 [&[data-state=listening]]:to-blue-600/40",
        "[&[data-state=listening]]:before:from-blue-400/80 [&[data-state=listening]]:before:via-cyan-400/80 [&[data-state=listening]]:before:to-blue-500/80",
        "[&[data-state=listening]]:shadow-[0_0_50px_rgba(59,130,246,0.7),0_0_100px_rgba(6,182,212,0.6)]",
        // Speaking state - orange/red
        "[&[data-state=speaking]]:from-orange-500/40 [&[data-state=speaking]]:via-red-500/40 [&[data-state=speaking]]:to-orange-600/40",
        "[&[data-state=speaking]]:before:from-orange-400/80 [&[data-state=speaking]]:before:via-red-400/80 [&[data-state=speaking]]:before:to-orange-500/80",
        "[&[data-state=speaking]]:shadow-[0_0_50px_rgba(249,115,22,0.7),0_0_100px_rgba(239,68,68,0.6)]",
        // Hover effect for better clickability
        "hover:scale-105 hover:before:opacity-90 hover:shadow-[0_0_60px_rgba(59,130,246,0.8),0_0_120px_rgba(147,51,234,0.6)]",
        "active:scale-95",
        className
      )}
      data-state={currentState}
      style={
        {
          "--volume": "0",
          "--pulse-scale": "1.15",
          "--glow-opacity": "0.7",
        } as React.CSSProperties
      }
    >
      {/* Inner glow layer */}
      {!imageSrc && (
        <div
          className={cn(
            "absolute inset-2 rounded-full z-0 backdrop-blur-sm transition-all duration-500",
            currentState === "idle" &&
              "bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20",
            currentState === "listening" &&
              "bg-gradient-to-br from-blue-500/30 via-cyan-500/30 to-blue-600/30",
            currentState === "speaking" &&
              "bg-gradient-to-br from-orange-500/30 via-red-500/30 to-orange-600/30"
          )}
        />
      )}
      {/* Center dot or profile picture */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        {imageSrc ? (
          <div className="relative h-[90%] w-[90%] overflow-hidden rounded-full border-2 border-white/20 shadow-lg">
            <img
              src={imageSrc}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-3 w-3 rounded-full bg-white/60 shadow-lg" />
        )}
      </div>
    </div>
  );
}
