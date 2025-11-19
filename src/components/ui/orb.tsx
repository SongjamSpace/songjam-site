"use client";

import { useEffect, useRef } from "react";
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
      } else if (isSpeaking) {
        container.setAttribute("data-state", "speaking");
      } else {
        container.setAttribute("data-state", "idle");
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
        "relative h-full w-full rounded-full",
        "bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20",
        "before:absolute before:inset-0 before:rounded-full",
        "before:bg-gradient-to-br before:from-blue-400/30 before:via-purple-400/30 before:to-cyan-400/30",
        "before:opacity-[var(--glow-opacity,0.3)] before:blur-xl",
        "before:scale-[var(--pulse-scale,1)] before:transition-transform before:duration-300",
        !imageSrc && "after:absolute after:inset-2 after:rounded-full",
        !imageSrc &&
          "after:bg-gradient-to-br after:from-blue-500/10 after:via-purple-500/10 after:to-cyan-500/10",
        !imageSrc && "after:backdrop-blur-sm",
        "[&[data-state=listening]]:from-blue-500/30 [&[data-state=listening]]:via-cyan-500/30 [&[data-state=listening]]:to-blue-600/30",
        "[&[data-state=listening]]:before:from-blue-400/40 [&[data-state=listening]]:before:via-cyan-400/40 [&[data-state=listening]]:before:to-blue-500/40",
        "[&[data-state=speaking]]:from-orange-500/30 [&[data-state=speaking]]:via-red-500/30 [&[data-state=speaking]]:to-orange-600/30",
        "[&[data-state=speaking]]:before:from-orange-400/40 [&[data-state=speaking]]:before:via-red-400/40 [&[data-state=speaking]]:before:to-orange-500/40",
        className
      )}
      data-state="idle"
      style={
        {
          "--volume": "0",
          "--pulse-scale": "1",
          "--glow-opacity": "0.3",
          animation:
            "orb-breathe 2.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite",
        } as React.CSSProperties
      }
    >
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
