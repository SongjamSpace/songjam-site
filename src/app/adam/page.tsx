import React from "react";
import MindshareLeaderboard from "@/components/mindshare-leaderboard";

export default function Page() {
  return (
    <MindshareLeaderboard
      title="$ADAM"
      moto="The Rise of Adam"
      projectId="adam_songjam"
      timeframes={["ALL"]}
      backgroundImageUrl="/images/banners/songjam.png"
    />
  );
}
