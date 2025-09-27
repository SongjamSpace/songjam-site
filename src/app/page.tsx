"use client";

import { useEffect, useState } from "react";
import Loading from "./loading";
import { AnimatePresence } from "framer-motion";
import HeroSection from "@/components/hero-section";
import AboutShort from "@/components/about-short";
import Abilities from "@/components/abilities";
import GenesisCountdown from "@/components/genesis-countdown";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 500); // Reduced from 1000ms to 500ms for better UX
  }, []);

  return (
    <>
      <HeroSection backgroundImageUrl="/images/voxpop.png" />
      <GenesisCountdown />
      <Abilities />
      <AboutShort />
      <AnimatePresence>{isLoading && <Loading />}</AnimatePresence>
    </>
  );
}
