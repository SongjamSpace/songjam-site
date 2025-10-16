import React from "react";
import Link from "next/link";
import MindshareLeaderboard from "@/components/mindshare-leaderboard";

export default function Page() {
  return (
    <MindshareLeaderboard
      title="SANG"
      moto="Top Voices in the Battle for Voice Sovereignty"
      projectId="songjamspace"
      timeframes={["7D", "30D", "ALL"]}
      backgroundImageUrl="/images/banners/songjam.png"
      banner={
        <div className="text-center py-4 px-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-lg backdrop-blur-sm">
          <p className="text-lg font-semibold text-white mb-1">
            The Songjam Genesis Campaign concluded on September 19th, 2025
          </p>
          <p className="text-sm text-gray-300">
            <Link
              href="/"
              className="hover:text-white transition-colors underline"
            >
              Watch this space for further campaigns! 🎵
            </Link>
          </p>
        </div>
      }
    />
  );
}
