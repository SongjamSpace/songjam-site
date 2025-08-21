"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Loading() {
  useEffect(() => {
    // Disable scrolling
    document.body.style.overflow = "hidden";

    // Cleanup function to re-enable scrolling
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []); // Empty dependency array means this runs once on mount

  return (
    <motion.div
      className="fixed inset-0 bg-white/30 backdrop-blur-sm z-1000 flex items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="w-32 h-32 relative">
        <Image
          src="/images/logo-animated.gif"
          alt="Loading..."
          width={224}
          height={224}
          className="animate-pulse"
        />
      </div>
    </motion.div>
  );
}
