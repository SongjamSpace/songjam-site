"use client";

import { useEffect, useState } from "react";
import Loading from "./loading";
import { AnimatePresence } from "framer-motion";
import MindshareLeaderboard from "@/components/mindshare-leaderboard";
import AboutShort from "@/components/about-short";
import Abilities from "@/components/abilities";
import GenesisCountdown from "@/components/genesis-countdown";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  return (
    <>
      <MindshareLeaderboard />
      <GenesisCountdown />
      <Abilities />
      <AboutShort />
      <AnimatePresence>{isLoading && <Loading />}</AnimatePresence>
    </>
  );
}
