"use client";
import React, { useEffect, useState } from "react";
import MindshareLeaderboard from "@/components/mindshare-leaderboard";
import Navbar from "@/components/navbar";
import MindshareOverview from "@/components/mindshare-overview";
import { getAudiofiLatestCountAndTimestamp, getLatestCountAndTimestamp } from "@/services/db/leaderboardProjects";
import { number } from "framer-motion";

const PROJECT_ID = 'bettercallzaal_s2';

export default function Page() {
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [totalDiscussions, setTotalDiscussions] = useState(0);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number>();

  const fetchTotalUsersCount = async () => {
    try {
      const audiofiRes = await getAudiofiLatestCountAndTimestamp(PROJECT_ID);
      setTotalDiscussions(audiofiRes.count);
      const infofiRes = await getLatestCountAndTimestamp(PROJECT_ID);
      setTotalUsersCount(infofiRes.count);
      setLastUpdatedAt(infofiRes.timestamp);
    } catch (error) {
      console.error("Error fetching total users count:", error);
    }
  };

  useEffect(() => {
    fetchTotalUsersCount();
  }, []);

  return (
    <div className="relative bg-cover bg-top p-4 min-h-screen md:min-h-auto md:pb-[200px]">

      {/* Content with proper z-index */}
      <div className="relative z-10">
        <Navbar />
        <MindshareOverview
          countdownTargetDate="2026-01-01T11:00:00-05:00"
          nextLaunchLabel="$ZABAL Empire Season 2 Launching in:"
          nextLaunchDate="2026-01-06T00:00:00-05:00"
          leftSection={{
            title: "Timeline Singers",
            subtitle: "Mention @bettercallzaal or $ZABAL",
            statLabel: "Total Mentions",
            statValue: totalUsersCount.toString(),
          }}
          rightSection={{
            title: "Space Discussions",
            subtitle: "Discuss \"Zaal’s empire token the Zabal\"",
            statLabel: "Total Discussions",
            statValue: totalDiscussions.toString(),
          }}
        />
        <MindshareLeaderboard
          title="$ZABAL Empire"
          moto="Assembling the Zabal so artists own profit - Building on Base for the Farcaster Future"
          projectId={PROJECT_ID}
          timeframes={["ALL"]}
          backgroundImageUrl="/images/banners/zaal.png"
          showStakingMultiplier
          minStakeStr="100,000"
          audioRoomEnabled
          lastUpdatedAt={lastUpdatedAt}
        />
      </div>
    </div>
  );
}
