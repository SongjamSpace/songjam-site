import React from "react";
import MindshareLeaderboard from "@/components/mindshare-leaderboard";

export default function Page() {
  return (
    <MindshareLeaderboard
      title="SANG"
      moto="Top Voices in the Battle for Voice Sovereignty"
      projectId="songjamspace"
      timeframes={["24H", "7D", "30D", "ALL"]}
      backgroundImageUrl="/images/banners/songjam.png"
    />
  );
}
