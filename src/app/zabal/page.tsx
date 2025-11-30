"use client";
import React, { useEffect, useState } from "react";
import MindshareLeaderboard from "@/components/mindshare-leaderboard";
import Navbar from "@/components/navbar";
import MindshareOverview from "@/components/mindshare-overview";
import axios from "axios";

const PROJECT_ID = 'bettercallzaal';

export default function Page() {
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [totalDiscussions, setTotalDiscussions] = useState(0);

  const fetchTotalUsersCount = async () => {
    try {
      const audiofiRes = await axios.get(
        `${process.env.NEXT_PUBLIC_SONGJAM_SERVER}/audiofi/discussion-count/${PROJECT_ID}`
      );
      if (audiofiRes.data.count) {
        setTotalDiscussions(audiofiRes.data.count);
      }
      const infofiRes = await axios.get(
        `${process.env.NEXT_PUBLIC_SONGJAM_SERVER}/leaderboard/latest-lb-users-count/${PROJECT_ID}`
      );
      if (infofiRes.data.usersCount) {
        setTotalUsersCount(infofiRes.data.usersCount);
      }
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
          countdownTargetDate="2026-01-01T09:00:00-05:00"
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
          timeframes={["24H", "7D", "ALL"]}
          backgroundImageUrl="/images/banners/zaal.png"
          showStakingMultiplier
          minStakeStr="100,000"
        />
      </div>
    </div>
  );
}
