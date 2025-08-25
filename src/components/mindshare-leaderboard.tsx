"use client";
import { motion } from "framer-motion";
import Navbar from "./navbar";
import OnlineDot from "./online";
import { useState, useMemo, type ReactNode } from "react";
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

export default function MindshareLeaderboard({
  projectId,
  timeframes,
  title,
  moto,
  banner,
  backgroundImageUrl,
}: {
  projectId: string;
  timeframes: Array<"4H" | "24H" | "7D" | "30D">;
  title: string;
  moto: string;
  banner?: ReactNode;
  backgroundImageUrl?: string;
}) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "4H" | "24H" | "7D" | "30D"
  >(timeframes[0]);

  // Resolve endpoint per timeframe
  const getEndpointForTimeframe = (timeframe: "4H" | "24H" | "7D" | "30D") => {
    if (timeframe === "4H") {
      return `https://songjamspace-leaderboard.logesh-063.workers.dev/${projectId}_hourly`;
    } else if (timeframe === "24H") {
      return `https://songjamspace-leaderboard.logesh-063.workers.dev/${projectId}_daily`;
    } else if (timeframe === "7D") {
      return `https://songjamspace-leaderboard.logesh-063.workers.dev/${projectId}_weekly`;
    }
    return `https://songjamspace-leaderboard.logesh-063.workers.dev/${projectId}_monthly`;
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

  const handleTimeframeChange = (timeframe: "4H" | "24H" | "7D" | "30D") => {
    setSelectedTimeframe(timeframe);
    // Here you would typically fetch new data based on the selected timeframe
    // For now, we'll just update the state
  };

  return (
    <>
      <div
        className="relative bg-cover bg-top p-4 min-h-screen md:min-h-auto md:pb-[200px]"
        style={{
          backgroundImage: `url(${backgroundImageUrl ?? "/images/banner.png"})`,
        }}
      >
        {/* Bottom gradient fade overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[oklch(0.145_0_0)]" />
        <Navbar />

        {/* Header */}
        <div className="relative z-10 text-center py-8 px-4">
          <motion.h1
            className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg"
            style={{ fontFamily: "Orbitron, sans-serif" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {title === "SANG" ? `Who ${title}` : title}
          </motion.h1>
          <motion.p
            className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-lg"
            style={{ fontFamily: "Inter, sans-serif" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {moto}
          </motion.p>
        </div>

        {/* Treemap Container */}
        <div className="relative z-10 px-4 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6 gap-4">
                <h2
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: "Orbitron, sans-serif" }}
                >
                  Leaderboard
                </h2>
                {banner && (
                  <div className="flex-1 flex items-center justify-center">
                    {banner}
                  </div>
                )}
                <div className="flex bg-white/10 rounded-lg p-1 border border-white/20">
                  {timeframes.map((timeframe) => (
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
                {error && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/10 border border-white/20 shadow-md">
                      <span
                        className="text-white/90 text-sm"
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
        <div className="relative z-10 px-4 pb-8">
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
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
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

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
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

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
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

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
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

      {/* All Users Table */}
      <div className="px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3
                className="text-lg font-semibold text-white"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                {selectedTimeframe} Users
              </h3>
              <div
                className="text-sm text-white/60"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {sortedAllUsers.length.toLocaleString()} users
              </div>
            </div>
            <div className="overflow-x-auto max-h-[40rem] overflow-y-auto">
              <table className="min-w-full">
                <thead className="sticky top-0 z-10 bg-black/60 border-b border-white/10 shadow-sm">
                  <tr
                    className="text-left text-white/70 text-sm"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <th className="px-6 py-3">Rank</th>
                    <th className="px-6 py-3">Yapper</th>
                    <th className="px-6 py-3 text-right">Total Points</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAllUsers.map((u, idx) => (
                    <tr
                      key={u.userId}
                      className={`${
                        idx % 2 === 0 ? "bg-white/0" : "bg-white/[0.03]"
                      } border-t border-white/10`}
                    >
                      <td className="px-6 py-3 align-middle">
                        <span
                          className="text-white font-medium"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-3 align-middle">
                        <div className="flex flex-col">
                          <span
                            className="text-white font-medium"
                            style={{ fontFamily: "Inter, sans-serif" }}
                          >
                            {u.name || u.username}
                          </span>
                          <span
                            className="text-white/60 text-sm"
                            style={{ fontFamily: "Inter, sans-serif" }}
                          >
                            @{u.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right align-middle">
                        <span
                          className="text-white font-medium"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {u.totalPoints.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
