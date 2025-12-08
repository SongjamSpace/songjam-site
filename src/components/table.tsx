"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeaderboardEntry, useLeaderboard } from "@/lib/hooks/useLeaderboard";
import { formatNumber } from "@/lib/utils";
import { useEffect, useState } from "react";
// import SeasonTwoBanner from "./season-two-banner";

export default function TableDemo() {
  const { data, isLoading, isError, error } = useLeaderboard();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [likelyBottedData, setLikelyBottedData] = useState<LeaderboardEntry[]>(
    []
  );
  const [showFlaggedYappers, setShowFlaggedYappers] = useState(false);

  useEffect(() => {
    if (data) {
      setLikelyBottedData(
        data.filter((d) => d.flagCount >= 5 && d.botScore >= 85)
      );
      setLeaderboardData(
        data.filter((d) => !(d.flagCount >= 5 && d.botScore >= 85))
      );
    }
  }, [data, showFlaggedYappers]);

  if (isLoading) {
    return (
      <div className="w-full overflow-x-auto">
        {/* Season Two Banner */}
        {/* <SeasonTwoBanner /> */}

        {/* Add the Connect Wallet for Airdrop */}
        <Table className="w-full p-4 rounded-lg border border-white bg-white/10 text-[#48333D] min-w-[400px]">
          <TableHeader>
            <TableRow className="text-[#48333D] font-bold">
              <TableHead className="w-[100px] text-[#48333D]">Rank</TableHead>
              <TableHead className="text-[#48333D]">Singer</TableHead>
              <TableHead className="w-40" />
              <TableHead className="text-[#48333D]">Total Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (isError) {
    return <div className="p-4 text-red-500">Error: {error?.message}</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      {/* Season Two Banner */}
      {/* <SeasonTwoBanner /> */}

      {/* Add the Connect Wallet for Airdrop */}
      <div className="mb-4 flex justify-center">
        {/* <div className="text-center py-6">
          <div className="text-lg font-semibold text-gray-700 mb-2">
            Submissions are closed
          </div>
          <div className="text-sm text-gray-500">
            Wallet submission for airdrop has ended
          </div>
        </div> */}
        {/* <button
          className="group relative flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-[#FF007A]/20 to-[#FF007A]/10 border border-[#FF007A]/30 shadow-none opacity-90 hover:opacity-100 hover:bg-gradient-to-r hover:from-[#FF007A]/30 hover:to-[#FF007A]/20 hover:shadow-[0_0_12px_2px_rgba(255,0,122,0.25)] transition-all duration-300 font-medium text-[#FF007A] hover:text-[#FF007A]/90 text-sm tracking-wide"
          onClick={() => {
            const url = "https://leaderboard.songjam.space/evaonlinexyz";
            window.open(
              url,
              "AirdropPopup",
              "width=500,height=700,noopener,noreferrer"
            );
          }}
        >
          <span className="relative z-10 group-hover:scale-105 transition-transform duration-200 flex items-center gap-2">
            <svg
              className="w-4 h-4 opacity-80 group-hover:opacity-100 transition-opacity duration-200"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span>Connect Wallet for Airdrop</span>
          </span>
          <span className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-[#FF007A]/10 transition-colors duration-300 blur-sm" />
        </button> */}
      </div>
      <Table className="w-full p-4 rounded-lg border border-white bg-white/10 text-[#48333D] min-w-[400px]">
        <TableHeader>
          <TableRow className="text-[#48333D] font-bold">
            <TableHead className="w-[100px] text-[#48333D]">Rank</TableHead>
            <TableHead className="text-[#48333D]">Singer</TableHead>
            <TableHead className="w-20 text-[#48333D]">
              <div className="flex items-center justify-center relative">
                <div className="relative group cursor-pointer">
                  <svg
                    onClick={() => setShowFlaggedYappers(!showFlaggedYappers)}
                    className={`w-4 h-4 transition-colors duration-200 ${showFlaggedYappers
                        ? "text-red-500 opacity-100"
                        : "text-[#48333D] opacity-60 hover:opacity-100"
                      }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                    {showFlaggedYappers
                      ? "Show Leaderboard"
                      : "Show Likely Botted"}
                    <div className="absolute top-1/2 left-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-800"></div>
                  </div>
                </div>
              </div>
            </TableHead>
            <TableHead className="text-[#48333D] text-right w-20">
              Total Points
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data && data.length > 0 ? (
            (showFlaggedYappers ? likelyBottedData : leaderboardData).map(
              (entry, idx) => (
                <TableRow key={entry.userId} className="items-center">
                  <TableCell className="font-medium align-middle text-center">
                    {!showFlaggedYappers && idx + 1}
                  </TableCell>
                  <TableCell className="align-middle text-center max-w-[220px]">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1 max-w-[220px]">
                      <span
                        className="font-medium whitespace-nowrap truncate z-10"
                        title={entry.name || entry.username}
                      >
                        {entry.name || entry.username}
                      </span>
                      {entry.username && (
                        <span className="text-sm text-[#979797] whitespace-nowrap">
                          @{entry.username}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="align-middle text-center w-20">
                    <div className="flex justify-center items-center w-full h-full">
                      <div className="relative">
                        <button
                          className="group relative flex items-center justify-center px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20 shadow-none opacity-70 hover:opacity-100 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-red-600/20 hover:shadow-[0_0_12px_2px_rgba(239,68,68,0.25)] transition-all duration-300 font-medium text-red-500/80 hover:text-red-500 text-sm tracking-wide"
                          style={{ minWidth: 80 }}
                          onClick={() => {
                            const url = `https://songjam.space/flags?userId=${entry.userId}`;
                            window.open(
                              url,
                              "ScorePopup",
                              "width=400,height=700,noopener,noreferrer"
                            );
                          }}
                        >
                          <span className="relative z-10 group-hover:scale-105 transition-transform duration-200 flex items-center gap-1.5">
                            <svg
                              className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity duration-200"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                              <line x1="4" y1="22" x2="4" y2="15" />
                            </svg>
                            <span>Flag</span>
                          </span>
                          <span className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-red-500/10 transition-colors duration-300 blur-sm" />
                          {!!entry.flagCount &&
                            entry.flagCount > 0 &&
                            entry.botScore > 80 && (
                              <div className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-red-500/60 text-white text-[10px] font-bold border-2 border-white/60 shadow-sm opacity-70 group-hover:opacity-100 group-hover:bg-red-500 group-hover:border-white group-hover:shadow-[0_0_8px_2px_rgba(239,68,68,0.4)] transition-all duration-300 z-10">
                                {entry.flagCount}
                              </div>
                            )}
                        </button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-middle text-right w-20">
                    {showFlaggedYappers ? "" : formatNumber(entry.totalPoints)}
                  </TableCell>
                </TableRow>
              )
            )
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
