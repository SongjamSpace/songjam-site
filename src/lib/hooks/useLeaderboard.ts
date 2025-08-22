import { useQuery } from "@tanstack/react-query";

export interface LeaderboardEntry {
  username: string;
  userId: string;
  name: string;
  // engagementPoints: number;
  totalPoints: number;
  // preGenesisPoints: number;
  // postGenesisPoints: number;
  flagCount: number;
  botScore: number;
}

export interface LeaderboardResponse {
  success: boolean;
  result: LeaderboardEntry[];
  count: number;
}

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const response = await fetch(
    "https://songjamspace-leaderboard.logesh-063.workers.dev/songjamspace"
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const result: LeaderboardEntry[] = await response.json();
  return result;
}

export function useLeaderboard() {
  return useQuery<LeaderboardEntry[], Error>({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboard,
    staleTime: 60 * 1000, // 1 minute
  });
}
