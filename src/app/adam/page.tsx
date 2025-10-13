import React from "react";
import MindshareLeaderboard from "@/components/mindshare-leaderboard";
import Navbar from "@/components/navbar";
import HybridTarget from "@/components/hybrid-target";

export default function Page() {
  return (
    <div className="relative bg-cover bg-top p-4 min-h-screen md:min-h-auto md:pb-[200px]">
      <Navbar />
      <HybridTarget />
      <MindshareLeaderboard
        title="Who is $ADAM"
        moto="The First Creator Coin in the Songjam Ecosystem - Seeded in SOL for a Cross-Chain Future"
        projectId="adam_songjam"
        timeframes={["ALL"]}
        backgroundImageUrl="/images/banners/songjam.png"
      />
    </div>
  );
}
