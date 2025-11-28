import React from "react";
import MindshareLeaderboard from "@/components/mindshare-leaderboard";
import Navbar from "@/components/navbar";
import MindshareOverview from "@/components/mindshare-overview";

export default function Page() {
  return (
    <div className="relative bg-cover bg-top p-4 min-h-screen md:min-h-auto md:pb-[200px]">

      {/* Content with proper z-index */}
      <div className="relative z-10">
        <Navbar />
        <MindshareOverview
          countdownTargetDate="2026-01-01T09:00:00-05:00"
          leftSection={{
            title: "Timeline Mentions",
            subtitle: "Mention @bettercallzaal or $ZABAL",
            statLabel: "Total Mentions",
            statValue: "167",
          }}
          rightSection={{
            title: "Space Discussions",
            subtitle: "Discuss \"Zaal’s empire token the Zabal\"",
            statLabel: "Total Discussions",
            statValue: "0",
          }}
        />
        <MindshareLeaderboard
          title="$ZABAL Empire"
          moto="Assembling the Zabal so artists own profit - Building on Base for the Farcaster Future"
          projectId="bettercallzaal"
          timeframes={["ALL"]}
          backgroundImageUrl="/images/banners/zaal.png"
        />
      </div>
    </div>
  );
}
