import React from "react";
import MindshareLeaderboard from "@/components/mindshare-leaderboard";
import Navbar from "@/components/navbar";

export default function Page() {
  return (
    <div className="relative bg-cover bg-top p-4 min-h-screen md:min-h-auto md:pb-[200px]">
      <Navbar />
      <MindshareLeaderboard
        title="$ADAM"
        moto="The Rise of Adam"
        projectId="adam_songjam"
        timeframes={["ALL"]}
        backgroundImageUrl="/images/banners/songjam.png"
      />
    </div>
  );
}
