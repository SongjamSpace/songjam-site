"use client";

import { useEffect, useState } from "react";
import Loading from "./loading";
import { AnimatePresence } from "framer-motion";
import MindshareLeaderboard from "@/components/mindshare-leaderboard";
import AboutShort from "@/components/about-short";
import Abilities from "@/components/abilities";
import GenesisCountdown from "@/components/genesis-countdown";
import CampaignBanner from "@/components/campaign-banner";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <>
      <MindshareLeaderboard
        title="SANG"
        moto="Top Voices in the Battle for Voice Sovereignty"
        projectId="songjamspace"
        timeframes={["24H", "7D", "30D", "ALL"]}
        backgroundImageUrl="/images/banners/songjam.png"
        banner={
          <CampaignBanner
            label="10X Points Multiplier:"
            href="https://leaderboard.songjam.space/creator"
            value="Mint Your Testnet Creator Coin"
          />
        }
      />
      <GenesisCountdown />
      <Abilities />
      <AboutShort />
      <AnimatePresence>{isLoading && <Loading />}</AnimatePresence>
    </>
  );
}
