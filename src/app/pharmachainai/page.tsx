import React from "react";
import MindshareLeaderboard from "@/components/mindshare-leaderboard";

export default function Page() {
  return (
    <MindshareLeaderboard
      title="Pharmachain AI"
      moto="AI Powered Medication Finder 💊 Predicts & Tracks Medication Availability In Over 50,000 Pharmacies.
"
      projectId="pharmachainai"
      timeframes={["24H", "7D", "ALL"]}
      backgroundImageUrl="/images/banners/pharmachainai.jpeg"
    />
  );
}
