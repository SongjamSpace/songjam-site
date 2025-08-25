import React from "react";
import MindshareLeaderboard from "@/components/mindshare-leaderboard";

export default function Page() {
  return (
    <MindshareLeaderboard
      title="PHAI"
      moto="AI Powered Medication Finder 💊 Predicts & Tracks Medication Availability In Over 50,000 Pharmacies.
"
      projectId="pharmachainai"
      timeframes={["4H", "24H", "7D"]}
    />
  );
}
