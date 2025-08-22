"use client";
import { motion } from "framer-motion";
import Navbar from "./navbar";
import OnlineDot from "./online";
import { useState, useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

interface LeaderboardRow {
  username: string;
  name: string;
  totalPoints: number;
  userId: string;
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

export default function MindshareLeaderboard() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "24H" | "7D" | "30D"
  >("24H");

  // Resolve endpoint per timeframe
  const getEndpointForTimeframe = (timeframe: "24H" | "7D" | "30D") => {
    if (timeframe === "24H") {
      return "https://songjamspace-leaderboard.logesh-063.workers.dev/songjamspace_daily";
    } else if (timeframe === "7D") {
      return "https://songjamspace-leaderboard.logesh-063.workers.dev/songjamspace_weekly";
    }
    return "https://songjamspace-leaderboard.logesh-063.workers.dev/songjamspace_monthly";
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
      .slice()
      .sort(
        (a: LeaderboardRow, b: LeaderboardRow) => b.totalPoints - a.totalPoints
      ) // Sort by points descending
      .slice(0, 10) // Take top 10
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

  // Helper function to assign contribution types based on ranking
  const getContributionType = (index: number): string => {
    const contributions = [
      "Voice Verification",
      "Blockchain Integration",
      "AI Infrastructure",
      "Security Protocols",
      "Data Processing",
      "User Experience",
      "Algorithm Development",
      "Network Infrastructure",
      "Testing & QA",
      "Community & Outreach",
    ];
    return contributions[index] || "Platform Contribution";
  };

  // Calculate treemap layout using improved algorithm
  const treemapItems = useMemo(() => {
    const containerWidth = 1200;
    const containerHeight = 600;
    return createTreemap(mindshareData, containerWidth, containerHeight);
  }, [mindshareData]);

  const handleTimeframeChange = (timeframe: "24H" | "7D" | "30D") => {
    setSelectedTimeframe(timeframe);
    // Here you would typically fetch new data based on the selected timeframe
    // For now, we'll just update the state
  };

  // Initial load fallback: only for very first load when no data present yet
  const isInitialLoading = isLoading && mindshareData.length === 0;
  if (isInitialLoading) {
    return (
      <div className="relative bg-[url('/images/banner.png')] bg-cover bg-top p-4 min-h-screen md:min-h-auto md:pb-[200px]">
        <Navbar />
        <div className="text-center py-8 px-4">
          <motion.div
            className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg"
            style={{ fontFamily: "Orbitron, sans-serif" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Loading Leaderboard...
          </motion.div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative bg-[url('/images/banner.png')] bg-cover bg-top p-4 min-h-screen md:min-h-auto md:pb-[200px]">
        <Navbar />
        <div className="text-center py-8 px-4">
          <motion.div
            className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg"
            style={{ fontFamily: "Orbitron, sans-serif" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Error Loading Leaderboard
          </motion.div>
          <motion.p
            className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-lg"
            style={{ fontFamily: "Inter, sans-serif" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {error.message}
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-[url('/images/banner.png')] bg-cover bg-top p-4 min-h-screen md:min-h-auto md:pb-[200px]">
      <Navbar />

      {/* Header */}
      <div className="text-center py-8 px-4">
        <motion.h1
          className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg"
          style={{ fontFamily: "Orbitron, sans-serif" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Who $SANG?
        </motion.h1>
        <motion.p
          className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-lg"
          style={{ fontFamily: "Inter, sans-serif" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Top Voices in the Battle for Voice Sovereignty
        </motion.p>
      </div>

      {/* Treemap Container */}
      <div className="px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                Leaderboard
              </h2>
              <div className="flex bg-white/10 rounded-lg p-1 border border-white/20">
                {(["24H", "7D", "30D"] as const).map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => handleTimeframeChange(timeframe)}
                    className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                      selectedTimeframe === timeframe
                        ? "bg-white/20 text-white shadow-sm"
                        : "text-white/70 hover:text-white/90"
                    }`}
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>

            {/* Treemap Canvas */}
            <div className="relative w-full h-[600px] bg-white/5 rounded-lg overflow-hidden">
              {treemapItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  className={`absolute cursor-pointer transition-all duration-300 ${
                    selectedItem === item.id
                      ? "ring-4 ring-white ring-opacity-50"
                      : ""
                  } ${
                    hoveredItem === item.id
                      ? "scale-105 z-10"
                      : "hover:scale-102"
                  }`}
                  style={{
                    left: `${(item.x / 1200) * 100}%`,
                    top: `${(item.y / 600) * 100}%`,
                    width: `${(item.width / 1200) * 100}%`,
                    height: `${(item.height / 600) * 100}%`,
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
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
                        className="text-white font-bold text-sm md:text-base truncate drop-shadow-lg"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {item.name}
                      </div>
                      <div
                        className="text-white/90 text-xs truncate drop-shadow-lg"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {item.description}
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className="text-white font-bold text-lg md:text-xl drop-shadow-lg"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {item.percentage}%
                      </div>
                      <div
                        className="text-white/80 text-xs drop-shadow-lg"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {item.points.toLocaleString()} pts
                      </div>
                    </div>
                  </div>

                  {/* Hover/Selected Overlay */}
                  {(hoveredItem === item.id || selectedItem === item.id) && (
                    <motion.div
                      className="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center rounded"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-center text-white p-3">
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
                      </div>
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
                  <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/10 border border-white/20 shadow-md">
                    <div className="h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                    <span
                      className="text-white/90 text-sm"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      Updating {selectedTimeframe} Leaderboard…
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Powered By */}
            <div className="mt-6 flex items-center justify-center gap-3 text-sm">
              <span
                className="text-white/60"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Powered by:
              </span>
              <span
                className="text-white/80"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Arbus
              </span>
              <span className="text-white/40">•</span>
              <span
                className="text-white/80"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Lurky
              </span>
              <span className="text-white/40">•</span>
              <span
                className="text-white/80"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Zora
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-lg font-semibold text-white"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              {selectedTimeframe} Overview
            </h3>
            <div
              className="text-sm text-white/60"
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
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
              <div
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                {mindshareData.length}
              </div>
              <div
                className="text-white/70 text-sm"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Contributors
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
              <div
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                {mindshareData
                  .reduce((sum, item) => sum + item.points, 0)
                  .toLocaleString()}
              </div>
              <div
                className="text-white/70 text-sm"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Total Points
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
              <div
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                {mindshareData[0]?.percentage || 0}%
              </div>
              <div
                className="text-white/70 text-sm"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Top Share
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
              <div
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                {mindshareData[0]?.name || "N/A"}
              </div>
              <div
                className="text-white/70 text-sm"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Leader
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
