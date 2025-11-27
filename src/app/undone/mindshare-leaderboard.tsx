"use client";
import React, { useState, useMemo, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import Link from "next/link";
import localFont from "next/font/local";
import { AlertCircle } from "lucide-react";
// import mockLeaderboardData from "./mock-leaderboard.json";

const williamsFont = localFont({
  src: "../../../public/fonts/Williams-SemiBold.ttf",
  variable: "--font-williams",
  display: "swap",
});

export interface UndonePointsBreakdown {
  stickers: {
    count: number;
    metadata: { stickers: { id: string; name: string; file_url: string }[] };
  };
  helmet_stickers: {
    count: number;
    metadata: { stickers: { id: string; name: string; file_url: string }[] };
  };
  tasks: { completed: number };
  daily_spins: { count: number };
  watch_orders: { count: number };
  rounds: { completed: number };
}

interface LeaderboardRow {
  username: string;
  name: string;
  totalPoints: number;
  userId: string;
  stakingMultiplier?: number;
  spacePoints?: number;
  undonePoints?: number;
  activity?: UndonePointsBreakdown;
}

// Mindshare data will be generated dynamically from leaderboard data

// Flexible Space-Filling Treemap Algorithm
function createTreemap(
  items: any[],
  containerWidth: number,
  containerHeight: number
) {
  if (items.length === 0) return [];

  const sortedItems = [...items].sort((a, b) => b.percentage - a.percentage);

  // Use a recursive treemap approach that fills space naturally
  function squarify(
    items: any[],
    x: number,
    y: number,
    width: number,
    height: number
  ): any[] {
    if (items.length === 0) return [];
    if (items.length === 1) {
      return [
        {
          ...items[0],
          x,
          y,
          width,
          height,
        },
      ];
    }

    // Calculate total area for these items
    const totalValue = items.reduce((sum, item) => sum + item.percentage, 0);
    const totalArea = width * height;

    // Decide whether to split horizontally or vertically
    const aspectRatio = width / height;
    const splitVertically = aspectRatio > 1;

    // Find the best split point
    let bestSplit = 1;
    let bestRatio = Infinity;

    for (let i = 1; i < items.length; i++) {
      const leftItems = items.slice(0, i);
      const rightItems = items.slice(i);

      const leftValue = leftItems.reduce(
        (sum, item) => sum + item.percentage,
        0
      );
      const rightValue = rightItems.reduce(
        (sum, item) => sum + item.percentage,
        0
      );

      if (splitVertically) {
        const leftWidth = (leftValue / totalValue) * width;
        const rightWidth = (rightValue / totalValue) * width;

        // Calculate worst aspect ratio in this split
        const leftAspect = Math.max(leftWidth / height, height / leftWidth);
        const rightAspect = Math.max(rightWidth / height, height / rightWidth);
        const worstRatio = Math.max(leftAspect, rightAspect);

        if (worstRatio < bestRatio) {
          bestRatio = worstRatio;
          bestSplit = i;
        }
      } else {
        const leftHeight = (leftValue / totalValue) * height;
        const rightHeight = (rightValue / totalValue) * height;

        // Calculate worst aspect ratio in this split
        const leftAspect = Math.max(width / leftHeight, leftHeight / width);
        const rightAspect = Math.max(width / rightHeight, rightHeight / width);
        const worstRatio = Math.max(leftAspect, rightAspect);

        if (worstRatio < bestRatio) {
          bestRatio = worstRatio;
          bestSplit = i;
        }
      }
    }

    // Split the items
    const leftItems = items.slice(0, bestSplit);
    const rightItems = items.slice(bestSplit);

    const leftValue = leftItems.reduce((sum, item) => sum + item.percentage, 0);
    const rightValue = rightItems.reduce(
      (sum, item) => sum + item.percentage,
      0
    );

    if (splitVertically) {
      const leftWidth = (leftValue / totalValue) * width;
      const rightWidth = (rightValue / totalValue) * width;

      return [
        ...squarify(leftItems, x, y, leftWidth, height),
        ...squarify(rightItems, x + leftWidth, y, rightWidth, height),
      ];
    } else {
      const leftHeight = (leftValue / totalValue) * height;
      const rightHeight = (rightValue / totalValue) * height;

      return [
        ...squarify(leftItems, x, y, width, leftHeight),
        ...squarify(rightItems, x, y + leftHeight, width, rightHeight),
      ];
    }
  }

  // Show as many items as possible (up to 10)
  const itemsToShow = sortedItems.slice(0, Math.min(10, sortedItems.length));

  return squarify(itemsToShow, 0, 0, containerWidth, containerHeight);
}

type Timeframe = "4H" | "24H" | "7D" | "30D" | "ALL";

// Mobile View Component
function MindshareLeaderboardMobile({
  items,
  isLight,
}: {
  items: any[];
  isLight: boolean;
}) {
  const getCardStyle = (index: number) => {
    // Stepped layout: Bigger to smaller
    // grid-cols-6 allows for 1 (6), 2 (3+3), and 3 (2+2+2) items per row
    if (index === 0) return "col-span-6 h-72"; // Rank 1: Huge
    if (index < 3) return "col-span-3 h-60";   // Rank 2, 3: Large
    if (index < 5) return "col-span-3 h-52";   // Rank 4, 5: Medium-Large
    if (index < 7) return "col-span-3 h-44";   // Rank 6, 7: Medium
    // Rank 8, 9, 10: Small, 3 in a row
    return "col-span-2 h-40";
  };

  const getTextSizes = (index: number) => {
    if (index === 0) return { name: "text-3xl", percent: "text-6xl", rank: "text-6xl" };
    if (index < 3) return { name: "text-xl", percent: "text-4xl", rank: "text-4xl" };
    if (index < 5) return { name: "text-lg", percent: "text-3xl", rank: "text-3xl" };
    if (index < 7) return { name: "text-base", percent: "text-2xl", rank: "text-2xl" };
    return { name: "text-xs", percent: "text-lg", rank: "text-lg" }; // Smaller text for 3-col items
  };

  return (
    <div className="grid grid-cols-6 gap-2">
      {items.map((item, index) => {
        const gridClass = getCardStyle(index);
        const textSizes = getTextSizes(index);
        const isWide = gridClass.includes("col-span-6");

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`relative overflow-hidden rounded-xl border p-3 flex flex-col justify-between ${gridClass} ${isLight
                ? "bg-white/40 border-black/5"
                : "bg-white/5 border-white/10"
              }`}
          >
            {/* Rank Badge */}
            <div className="absolute top-2 right-2 flex flex-col items-end">
              <span className={`font-black opacity-20 leading-none ${textSizes.rank}`}>
                #{index + 1}
              </span>
            </div>

            {/* Content Top */}
            <div className="relative z-10 mt-1 max-w-[85%]">
              <div className={`font-bold truncate leading-tight ${textSizes.name} ${isLight ? "text-slate-900" : "text-white"}`}
                style={{ fontFamily: "var(--font-williams), sans-serif" }}
              >
                {item.name}
              </div>
              <div className={`truncate opacity-70 ${index < 3 ? "text-sm" : "text-[10px]"} ${isLight ? "text-slate-700" : "text-white"}`}>
                {item.description}
              </div>
            </div>

            {/* Content Bottom (Stats) */}
            <div className="relative z-10">
              {/* Spacer */}
              <div className="flex-1" />

              <div className="flex items-end justify-between mt-2">
                <div>
                  <div className={`font-bold leading-none ${textSizes.percent} ${isLight ? "text-slate-900" : "text-white"}`}
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {item.percentage}%
                  </div>
                  <div className={`mt-1 opacity-60 ${index < 3 ? "text-sm" : "text-[10px]"} ${isLight ? "text-slate-700" : "text-white"}`}>
                    {item.points.toLocaleString()} pts
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar / Background Fill */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t ${isLight ? "from-black/5 to-transparent" : "from-white/5 to-transparent"
                }`}
            />
            <div
              className={`absolute bottom-0 left-0 h-1.5 ${isLight ? "bg-black/20" : "bg-white/30"
                }`}
              style={{ width: `${item.percentage}%` }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

export default function MindshareLeaderboard({
  projectId,
  timeframes,
  title,
  moto,
  banner,
  backgroundImageUrl,
  showSpacePoints = false,
}: {
  projectId: string;
  timeframes: Array<Timeframe>;
  title: string;
  moto: string;
  banner?: ReactNode;
  backgroundImageUrl?: string;
  showSpacePoints?: boolean;
}) {
  const isLight = false;
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>(
    timeframes[0]
  );
  const [expandedUndoneRow, setExpandedUndoneRow] = useState<string | null>(
    null
  );

  // Resolve endpoint per timeframe
  const getEndpointForTimeframe = (timeframe: Timeframe) => {
    if (timeframe === "4H") {
      return `https://songjamspace-leaderboard.logesh-063.workers.dev/${projectId}_hourly`;
    } else if (timeframe === "24H") {
      return `https://songjamspace-leaderboard.logesh-063.workers.dev/${projectId}_daily`;
    } else if (timeframe === "7D") {
      return `https://songjamspace-leaderboard.logesh-063.workers.dev/${projectId}_weekly`;
    } else if (timeframe === "30D") {
      return `https://songjamspace-leaderboard.logesh-063.workers.dev/${projectId}_monthly`;
    }
    return `https://songjamspace-leaderboard.logesh-063.workers.dev/${projectId}`;
  };

  // Fetch leaderboard data by timeframe
  const {
    data: leaderboardData,
    isLoading,
    isFetching,
    error,
  } = useQuery<LeaderboardRow[], Error>({
    queryKey: ["leaderboard", selectedTimeframe],
    queryFn: async (): Promise<LeaderboardRow[]> => {
      // Use mock data for development
      // return mockLeaderboardData as LeaderboardRow[];

      // Uncomment below to use real API
      const endpoint = getEndpointForTimeframe(selectedTimeframe);
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = (await response.json()) as LeaderboardRow[];
      return result;
    },
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  // Transform leaderboard data to mindshare format and calculate percentages
  const mindshareData = useMemo((): Array<{
    id: string;
    name: string;
    percentage: number;
    points: number;
    description: string;
    contribution?: string;
  }> => {
    if (!leaderboardData || (leaderboardData as LeaderboardRow[]).length === 0)
      return [];

    // Calculate total points across all entries
    const totalPoints = (leaderboardData as LeaderboardRow[]).reduce(
      (sum: number, entry: LeaderboardRow) => sum + entry.totalPoints,
      0
    );

    // Transform and calculate percentages
    return (leaderboardData as LeaderboardRow[])
      .slice(0, 10) // Data is already sorted by points descending; take top 10
      .map((entry: LeaderboardRow, index: number) => {
        const percentage =
          totalPoints > 0 ? (entry.totalPoints / totalPoints) * 100 : 0;

        return {
          id: entry.userId,
          name: entry.name || entry.username,
          // contribution: getContributionType(index),
          percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
          points: entry.totalPoints,
          description: `@${entry.username}`,
        };
      });
  }, [leaderboardData]);

  // Calculate treemap layout using improved algorithm
  const treemapItems = useMemo(() => {
    const containerWidth = 1200;
    const containerHeight = 600;
    return createTreemap(mindshareData, containerWidth, containerHeight);
  }, [mindshareData]);

  // Full sorted list for table view (all users)
  const sortedAllUsers = useMemo(() => {
    if (!leaderboardData || (leaderboardData as LeaderboardRow[]).length === 0)
      return [] as LeaderboardRow[];
    return leaderboardData as LeaderboardRow[]; // Already sorted
  }, [leaderboardData]);

  const handleTimeframeChange = (timeframe: Timeframe) => {
    setSelectedTimeframe(timeframe);
    // Here you would typically fetch new data based on the selected timeframe
    // For now, we'll just update the state
  };

  // Calculate points from breakdown
  const calculatePointsFromBreakdown = (
    breakdown: UndonePointsBreakdown | undefined
  ): number => {
    if (!breakdown) return 0;

    const pointsMap: Record<string, number> = {
      daily_spins: 5,
      stickers: 20,
      helmet_stickers: 50,
      tasks: 100,
      rounds: 200,
      watch_orders: 0, // This is a multiplier, not points
    };

    let total = 0;

    // Handle daily_spins
    if (breakdown.daily_spins?.count) {
      total += breakdown.daily_spins.count * pointsMap.daily_spins;
    }

    // Handle stickers
    if (breakdown.stickers?.count) {
      total += breakdown.stickers.count * pointsMap.stickers;
    }

    // Handle helmet_stickers
    if (breakdown.helmet_stickers?.count) {
      total += breakdown.helmet_stickers.count * pointsMap.helmet_stickers;
    }

    // Handle tasks
    if (breakdown.tasks?.completed) {
      total += breakdown.tasks.completed * pointsMap.tasks;
    }

    // Handle rounds
    if (breakdown.rounds?.completed) {
      total += breakdown.rounds.completed * pointsMap.rounds;
    }

    // Apply watch_orders multiplier (x2 if count > 0)
    const multiplier =
      breakdown.watch_orders && breakdown.watch_orders.count > 0 ? 2 : 1;

    return total * multiplier;
  };

  return (
    <div className={williamsFont.variable}>
      <div
        id="leaderboard"
        className="relative bg-cover bg-top p-4 min-h-screen md:min-h-auto md:pb-[200px]"
        style={{
          backgroundImage: `url(${backgroundImageUrl ?? "/images/banner.png"})`,
        }}
      >
        {/* Background opacity overlay */}
        <div className="pointer-events-none absolute inset-0 bg-black/20" />

        {/* Top gradient fade overlay */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b ${isLight ? "from-white" : "from-[oklch(0.145_0_0)]"
            } to-transparent`}
        />

        {/* Softening overlay for light theme (pharmachainai) */}
        {isLight && (
          <div className="pointer-events-none absolute inset-0 backdrop-blur-sm bg-white/30" />
        )}
        {/* Bottom gradient fade overlay */}
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent ${isLight ? "to-white" : "to-[oklch(0.145_0_0)]"
            }`}
        />

        {/* Header */}
        <div className="relative z-10 text-center py-4 md:py-8 px-3 md:px-4">
          <motion.h1
            className={`text-2xl md:text-6xl font-black mb-2 md:mb-4 drop-shadow-lg break-words ${isLight ? "text-[#48333D]" : "text-white"
              }`}
            style={{ fontFamily: "var(--font-williams), sans-serif" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {title === "SANG" ? `Who $${title}?` : title}
          </motion.h1>
          <motion.p
            className={`text-sm md:text-xl max-w-4xl mx-auto drop-shadow-lg px-2 md:px-0 break-words ${isLight ? "text-slate-700" : "text-white/90"
              }`}
            style={{ fontFamily: "Inter, sans-serif" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {moto}
          </motion.p>
        </div>

        {/* Treemap Container */}
        <div className="relative z-10 pb-8">
          <div className="max-w-7xl mx-auto">
            <div
              className={`${isLight
                ? "bg-black/5 border-black/10"
                : "bg-white/5 border-white/20"
                } backdrop-blur-sm rounded-2xl border p-6`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2
                  className={`text-xl sm:text-2xl font-bold ${isLight ? "text-[#48333D]" : "text-white"
                    }`}
                  style={{ fontFamily: "var(--font-williams), sans-serif" }}
                >
                  Leaderboard
                </h2>
                {banner && (
                  <div className="w-full sm:flex-1 flex items-center justify-center">
                    {banner}
                  </div>
                )}
                <div
                  className={`flex rounded-lg p-1 border w-full sm:w-auto ${isLight
                    ? "bg-black/5 border-black/10"
                    : "bg-white/10 border-white/20"
                    }`}
                >
                  {timeframes.map((timeframe) => (
                    <button
                      key={timeframe}
                      onClick={() => handleTimeframeChange(timeframe)}
                      className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm sm:text-base ${selectedTimeframe === timeframe
                        ? isLight
                          ? "bg-black/10 text-[#48333D] shadow-sm"
                          : "bg-white/20 text-white shadow-sm"
                        : isLight
                          ? "text-slate-700 hover:text-slate-900"
                          : "text-white/70 hover:text-white/90"
                        }`}
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {timeframe}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile View */}
              <div className="block md:hidden">
                <MindshareLeaderboardMobile
                  items={mindshareData}
                  isLight={isLight}
                />
              </div>

              {/* Desktop Treemap View */}
              <div
                className={`hidden md:block relative w-full h-[600px] rounded-lg overflow-hidden ${isLight ? "bg-black/5" : "bg-white/5"
                  }`}
              >
                {treemapItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className={`absolute cursor-pointer transition-all duration-300 ${selectedItem === item.id
                      ? "ring-4 ring-white ring-opacity-50"
                      : ""
                      } ${hoveredItem === item.id
                        ? "scale-105 z-10"
                        : "hover:scale-102"
                      }`}
                    style={{
                      left: `${(item.x / 1200) * 100}%`,
                      top: `${(item.y / 600) * 100}%`,
                      width: `${(item.width / 1200) * 100}%`,
                      height: `${(item.height / 600) * 100}%`,
                      backgroundColor: isLight
                        ? "rgba(0,0,0,0.06)"
                        : "rgba(255, 255, 255, 0.08)",
                      border: isLight
                        ? "1px solid rgba(0,0,0,0.12)"
                        : "1px solid rgba(255, 255, 255, 0.15)",
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onClick={() =>
                      setSelectedItem(selectedItem === item.id ? null : item.id)
                    }
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {/* Content */}
                    <div className="absolute inset-0 p-3 flex flex-col justify-between">
                      <div>
                        <div
                          className={`font-bold text-sm md:text-base truncate drop-shadow-lg ${isLight ? "text-slate-800" : "text-white"
                            }`}
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {item.name}
                        </div>
                        <div
                          className={`text-xs truncate drop-shadow-lg ${isLight ? "text-slate-700" : "text-white/90"
                            }`}
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {item.description}
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`font-bold text-lg md:text-xl drop-shadow-lg ${isLight ? "text-slate-900" : "text-white"
                            }`}
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {item.percentage}%
                        </div>
                        <div
                          className={`text-xs drop-shadow-lg ${isLight ? "text-slate-700" : "text-white/80"
                            }`}
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {item.points.toLocaleString()} pts
                        </div>
                      </div>
                    </div>

                    {/* Hover/Selected Overlay */}
                    {(hoveredItem === item.id || selectedItem === item.id) && (
                      <motion.div
                        className={`absolute inset-0 backdrop-blur-sm flex items-center justify-center rounded ${isLight ? "bg-black/10" : "bg-white/20"
                          }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* <div
                          className={`text-center p-3 ${
                            isLight ? "text-slate-900" : "text-white"
                          }`}
                        >
                          <div
                            className="font-bold text-base mb-1 drop-shadow-lg"
                            style={{ fontFamily: "Inter, sans-serif" }}
                          >
                            {item.name}
                          </div>
                          <div
                            className="text-xs mb-1 drop-shadow-lg"
                            style={{ fontFamily: "Inter, sans-serif" }}
                          >
                            {item.contribution}
                          </div>
                          <div
                            className="text-xs opacity-90 leading-tight drop-shadow-lg"
                            style={{ fontFamily: "Inter, sans-serif" }}
                          >
                            {item.description}
                          </div>
                        </div> */}
                      </motion.div>
                    )}
                  </motion.div>
                ))}

                {isFetching && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg shadow-md border ${isLight
                        ? "bg-black/5 border-black/10"
                        : "bg-white/10 border-white/20"
                        }`}
                    >
                      <div className="h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                      <span
                        className={`text-sm ${isLight ? "text-slate-800" : "text-white/90"
                          }`}
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        Updating {selectedTimeframe} Leaderboard…
                      </span>
                    </div>
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg shadow-md border ${isLight
                        ? "bg-black/5 border-black/10"
                        : "bg-white/10 border-white/20"
                        }`}
                    >
                      <span
                        className={`text-sm ${isLight ? "text-slate-800" : "text-white/90"
                          }`}
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        Error fetching the Leaderboard for {selectedTimeframe}{" "}
                        timeframe
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="relative z-10 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`text-lg font-semibold ${isLight ? "text-[#48333D]" : "text-white"
                  }`}
                style={{ fontFamily: "var(--font-williams), sans-serif" }}
              >
                {selectedTimeframe} Overview
              </h3>
              <div
                className={`text-sm ${isLight ? "text-slate-600" : "text-white/60"
                  }`}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Total:{" "}
                {mindshareData
                  .reduce((sum, item) => sum + item.points, 0)
                  .toLocaleString()}{" "}
                points
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                className={`${isLight
                  ? "bg-black/5 border-black/10"
                  : "bg-white/10 border-white/20"
                  } backdrop-blur-lg rounded-xl p-4 border text-center`}
              >
                <div
                  className={`text-2xl font-bold ${isLight ? "text-slate-900" : "text-white"
                    }`}
                  style={{ fontFamily: "var(--font-williams), sans-serif" }}
                >
                  {leaderboardData?.length || "-"}
                </div>
                <div
                  className={`${isLight ? "text-slate-700" : "text-white/70"
                    } text-sm`}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Contributors
                </div>
              </div>

              <div
                className={`${isLight
                  ? "bg-black/5 border-black/10"
                  : "bg-white/10 border-white/20"
                  } backdrop-blur-lg rounded-xl p-4 border text-center`}
              >
                <div
                  className={`text-2xl font-bold ${isLight ? "text-slate-900" : "text-white"
                    }`}
                  style={{ fontFamily: "var(--font-williams), sans-serif" }}
                >
                  {mindshareData
                    .reduce((sum, item) => sum + item.points, 0)
                    .toFixed(2)}
                </div>
                <div
                  className={`${isLight ? "text-slate-700" : "text-white/70"
                    } text-sm`}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Sing Points
                </div>
              </div>

              <div
                className={`${isLight
                  ? "bg-black/5 border-black/10"
                  : "bg-white/10 border-white/20"
                  } backdrop-blur-lg rounded-xl p-4 border text-center`}
              >
                <div
                  className={`text-2xl font-bold ${isLight ? "text-slate-900" : "text-white"
                    }`}
                  style={{ fontFamily: "var(--font-williams), sans-serif" }}
                >
                  {mindshareData[0]?.percentage || 0}%
                </div>
                <div
                  className={`${isLight ? "text-slate-700" : "text-white/70"
                    } text-sm`}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Top Share
                </div>
              </div>

              <div
                className={`${isLight
                  ? "bg-black/5 border-black/10"
                  : "bg-white/10 border-white/20"
                  } backdrop-blur-lg rounded-xl p-4 border text-center`}
              >
                <div
                  className={`text-2xl font-bold ${isLight ? "text-slate-900" : "text-white"
                    }`}
                  style={{ fontFamily: "var(--font-williams), sans-serif" }}
                >
                  {mindshareData[0]?.name || "N/A"}
                </div>
                <div
                  className={`${isLight ? "text-slate-700" : "text-white/70"
                    } text-sm`}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Leader
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Users Table */}
      <div className="pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
            <div className="px-3 md:px-6 py-3 md:py-4 border-b border-white/10 flex items-center justify-between">
              <h3
                className="text-base md:text-lg font-semibold text-white"
                style={{ fontFamily: "var(--font-williams), sans-serif" }}
              >
                {selectedTimeframe}{" "}
                <span className="hidden md:inline">Users</span>
              </h3>
              <Link href="https://leaderboard.songjam.space" target="_blank">
                <motion.button
                  className="inline-flex items-center px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-400/50 text-white font-medium rounded-full text-xs md:text-sm shadow-sm transition-all duration-200 hover:shadow-md whitespace-nowrap"
                  style={{ fontFamily: "Inter, sans-serif" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="mr-1 md:mr-1.5">🎯</span>
                  <span className="inline">Stake & Activate multiplier</span>
                </motion.button>
              </Link>
              <div
                className="text-xs md:text-sm text-white/60 whitespace-nowrap"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {sortedAllUsers.length.toLocaleString()} users
              </div>
            </div>
            <div className="overflow-x-auto max-h-[40rem] overflow-y-auto">
              <table className="min-w-full">
                <thead className="sticky top-0 z-10 bg-black/60 border-b border-white/10 shadow-sm">
                  <tr
                    className="text-left text-white/70 text-xs md:text-sm"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <th className="px-2 md:px-6 py-2 md:py-3 whitespace-nowrap">
                      Rank
                    </th>
                    <th className="px-2 md:px-6 py-2 md:py-3 whitespace-nowrap min-w-[120px] md:min-w-0">
                      Yapper
                    </th>
                    <th className="px-2 md:px-6 py-2 md:py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1 md:gap-1.5 group relative">
                        <span className="hidden md:inline">
                          Staking Multiplier
                        </span>
                        <span className="md:hidden">Multiplier</span>
                        <div className="relative inline-block">
                          <span className="text-white/50 hover:text-white/80 transition-colors text-xs md:text-base">
                            ⓘ
                          </span>
                          <div className="absolute left-1/2 -translate-x-1/2 mb-2 w-64 bg-black/95 text-white text-xs rounded-lg p-3 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none z-50 shadow-2xl border border-white/30 whitespace-normal">
                            {/* <div className="font-semibold mb-2 text-center">
                              Formula:
                            </div> */}
                            <div className="font-mono bg-white/10 p-2 rounded mb-2 text-center">
                              1 + √(Stake Amount / Minimum Stake)
                            </div>
                            <div className="text-white/80 text-center">
                              Minimum Stake: 10,000 $SANG
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-[6px] border-transparent border-t-black/95"></div>
                          </div>
                        </div>
                      </div>
                    </th>
                    {showSpacePoints && (
                      <th className="px-2 md:px-6 py-2 md:py-3 text-right whitespace-nowrap">
                        <span className="hidden md:inline">Space Points</span>
                        <span className="md:hidden">Space</span>
                      </th>
                    )}
                    <th className="px-2 md:px-6 py-2 md:py-3 text-right whitespace-nowrap">
                      <span className="hidden md:inline">Undone Points</span>
                      <span className="md:hidden">Undone</span>
                    </th>
                    <th className="px-2 md:px-6 py-2 md:py-3 text-right whitespace-nowrap">
                      <span className="hidden md:inline">Sing Points</span>
                      <span className="md:hidden">Points</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAllUsers.map((u, idx) => {
                    const hasUndonePoints = Boolean(u.undonePoints);
                    const baseRowBg =
                      idx % 2 === 0 ? "bg-white/0" : "bg-white/[0.03]";
                    const rowBgClass = hasUndonePoints
                      ? baseRowBg
                      : "bg-red-500/10";

                    return (
                      <React.Fragment key={u.userId}>
                        <tr
                          className={`${rowBgClass} border-t ${hasUndonePoints
                            ? "border-white/10"
                            : "border-red-500/30"
                            }`}
                        >
                          <td className="px-2 md:px-6 py-2 md:py-3 align-middle">
                            <span
                              className="text-white font-medium text-xs md:text-sm"
                              style={{ fontFamily: "Inter, sans-serif" }}
                            >
                              {idx + 1}
                            </span>
                          </td>
                          <td className="px-2 md:px-6 py-2 md:py-3 align-middle min-w-[120px] md:min-w-0">
                            <div className="flex flex-col">
                              <span
                                className="text-white font-medium text-xs md:text-sm truncate max-w-[100px] md:max-w-none"
                                style={{ fontFamily: "Inter, sans-serif" }}
                                title={u.name || u.username}
                              >
                                {u.name || u.username}
                              </span>
                              <span
                                className="text-white/60 text-xs truncate max-w-[100px] md:max-w-none"
                                style={{ fontFamily: "Inter, sans-serif" }}
                                title={`@${u.username}`}
                              >
                                @{u.username}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 md:px-6 py-2 md:py-3 text-center align-middle">
                            <span
                              className={`inline-flex items-center px-2 md:px-3 py-0.5 md:py-1 rounded-full font-semibold text-xs md:text-sm shadow-sm ${u.stakingMultiplier && u.stakingMultiplier > 1
                                ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-white"
                                : "bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-500/30 text-white/70"
                                }`}
                              style={{ fontFamily: "Inter, sans-serif" }}
                            >
                              {u.stakingMultiplier
                                ? u.stakingMultiplier.toFixed(2) + "x"
                                : "1x"}
                            </span>
                          </td>
                          {showSpacePoints && (
                            <td className="px-2 md:px-6 py-2 md:py-3 text-right align-middle">
                              <span
                                className="text-white/70 font-medium text-xs md:text-sm"
                                style={{ fontFamily: "Inter, sans-serif" }}
                              >
                                {u.spacePoints?.toFixed(2) || "-"}
                              </span>
                            </td>
                          )}
                          <td className="px-2 py-2 text-right align-middle">
                            {!u.undonePoints ? (
                              <div className="inline-flex items-center justify-center px-2 md:px-3 py-1 md:py-1.5 rounded text-red-400/80 group relative">
                                <AlertCircle className="w-4 h-4" />
                                <div className="absolute right-0 bottom-full mb-2 w-56 bg-black/95 text-white text-xs rounded-lg p-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-auto z-50 shadow-2xl border border-white/30 whitespace-normal">
                                  <a
                                    href="https://bit.ly/unWF1"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white/90 text-center hover:text-white block"
                                  >
                                    Play the{" "}
                                    <span className="underline">
                                      Undone game
                                    </span>{" "}
                                    to qualify
                                  </a>
                                  <div className="absolute top-full right-4 -mt-1 border-[6px] border-transparent border-t-black/95"></div>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  setExpandedUndoneRow(
                                    expandedUndoneRow === u.userId
                                      ? null
                                      : u.userId
                                  )
                                }
                                className="inline-flex items-center justify-center px-2 md:px-3 py-1 md:py-1.5 rounded text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors"
                                style={{ fontFamily: "Inter, sans-serif" }}
                                title="View points breakdown"
                              >
                                <span className="text-xs md:text-sm font-medium">
                                  {u.undonePoints !== undefined
                                    ? u.undonePoints.toFixed(2)
                                    : u.activity
                                      ? calculatePointsFromBreakdown(
                                        u.activity
                                      ).toFixed(2)
                                      : ""}
                                </span>
                                <svg
                                  className={`ml-1.5 w-3 h-3 transition-transform duration-200 ${expandedUndoneRow === u.userId
                                    ? "rotate-180"
                                    : ""
                                    }`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2.5}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>
                            )}
                          </td>
                          <td className="px-2 md:px-6 py-2 md:py-3 text-right align-middle">
                            <span
                              className="text-white font-medium text-xs md:text-sm"
                              style={{ fontFamily: "Inter, sans-serif" }}
                            >
                              {u.totalPoints.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                        {/* Expanded row for Undone Points breakdown */}
                        <AnimatePresence>
                          {expandedUndoneRow === u.userId && (
                            <tr className="bg-white/[0.08] border-t border-white/20">
                              <td
                                colSpan={showSpacePoints ? 6 : 5}
                                className="px-2 md:px-6 py-0"
                              >
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    ease: "easeInOut",
                                  }}
                                  className="overflow-hidden"
                                >
                                  <div className="py-4">
                                    {u.activity ? (
                                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 md:gap-2">
                                        {u.activity.daily_spins && (
                                          <div className="text-center">
                                            <div
                                              className="text-white/60 text-[10px] leading-tight"
                                              style={{
                                                fontFamily: "Inter, sans-serif",
                                              }}
                                            >
                                              Daily Spins
                                            </div>
                                            <div
                                              className="text-white font-medium text-xs leading-tight"
                                              style={{
                                                fontFamily: "Inter, sans-serif",
                                              }}
                                            >
                                              {u.activity.daily_spins.count * 5}{" "}
                                              pts
                                            </div>
                                          </div>
                                        )}
                                        {u.activity.stickers && (
                                          <div className="text-center">
                                            <div
                                              className="text-white/60 text-[10px] leading-tight"
                                              style={{
                                                fontFamily: "Inter, sans-serif",
                                              }}
                                            >
                                              Stickers
                                            </div>
                                            <div
                                              className="text-white font-medium text-xs leading-tight"
                                              style={{
                                                fontFamily: "Inter, sans-serif",
                                              }}
                                            >
                                              {u.activity.stickers.count * 20}{" "}
                                              pts
                                            </div>
                                          </div>
                                        )}
                                        {u.activity.helmet_stickers && (
                                          <div className="text-center">
                                            <div
                                              className="text-white/60 text-[10px] leading-tight"
                                              style={{
                                                fontFamily: "Inter, sans-serif",
                                              }}
                                            >
                                              Helmet
                                            </div>
                                            <div
                                              className="text-white font-medium text-xs leading-tight"
                                              style={{
                                                fontFamily: "Inter, sans-serif",
                                              }}
                                            >
                                              {u.activity.helmet_stickers
                                                .count * 50}{" "}
                                              pts
                                            </div>
                                          </div>
                                        )}
                                        {u.activity.tasks && (
                                          <div className="text-center">
                                            <div
                                              className="text-white/60 text-[10px] leading-tight"
                                              style={{
                                                fontFamily: "Inter, sans-serif",
                                              }}
                                            >
                                              Tasks
                                            </div>
                                            <div
                                              className="text-white font-medium text-xs leading-tight"
                                              style={{
                                                fontFamily: "Inter, sans-serif",
                                              }}
                                            >
                                              {u.activity.tasks.completed * 100}{" "}
                                              pts
                                            </div>
                                          </div>
                                        )}
                                        {u.activity.rounds && (
                                          <div className="text-center">
                                            <div
                                              className="text-white/60 text-[10px] leading-tight"
                                              style={{
                                                fontFamily: "Inter, sans-serif",
                                              }}
                                            >
                                              Rounds
                                            </div>
                                            <div
                                              className="text-white font-medium text-xs leading-tight"
                                              style={{
                                                fontFamily: "Inter, sans-serif",
                                              }}
                                            >
                                              {u.activity.rounds.completed *
                                                200}{" "}
                                              pts
                                            </div>
                                          </div>
                                        )}
                                        {u.activity.watch_orders && (
                                          <div className="text-center">
                                            <div
                                              className="text-white/60 text-[10px] leading-tight"
                                              style={{
                                                fontFamily: "Inter, sans-serif",
                                              }}
                                            >
                                              Watch
                                            </div>
                                            <div
                                              className="text-white font-medium text-xs leading-tight"
                                              style={{
                                                fontFamily: "Inter, sans-serif",
                                              }}
                                            >
                                              {u.activity.watch_orders.count > 0
                                                ? "x2"
                                                : "-"}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ) : null}
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
