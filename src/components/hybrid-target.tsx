"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  Users,
  Target,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { Button } from "./ui/button";
import { useState, useRef, useEffect } from "react";

// Mindshare Configuration
const MINDSHARE_TARGET_YAPPERS = 5000;

// Info Popover Component
function InfoPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 hover:bg-cyan-500/30 hover:border-cyan-500/40 transition-all duration-200 text-cyan-400 hover:text-cyan-300 text-xs font-bold"
        aria-label="More information"
      >
        𝐢
      </button>

      {isOpen && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="absolute left-[-200px] top-8 z-50 w-80 bg-black/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4 shadow-2xl"
          style={{
            boxShadow:
              "0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(6, 182, 212, 0.2)",
          }}
        >
          <div className="space-y-2.5 text-sm text-gray-300">
            <p className="text-gray-300 leading-relaxed">
              - The utility of Creator Coins within Mindshare Capital Markets -
              tokenized leaderboards for sybil-resistant InfoFi
            </p>
            <p className="text-gray-300 leading-relaxed">
              - Creator Coins as the base currency of AI Voice Agents -
              deflationary tokenomics based on LLM token denomination
            </p>
            <p className="text-gray-300 leading-relaxed">
              - $SANG token utility to earn multiplier on $ADAM leaderboard +
              fundamentals in Voice Verification Proof-of-Stake Network
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function HybridTarget({
  currentYappers,
}: {
  currentYappers: number;
}) {
  const mindshareProgress = Math.min(
    (currentYappers / MINDSHARE_TARGET_YAPPERS) * 100,
    100
  );

  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      {/* Main Progress Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        {/* Glowing background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-orange-500/20 blur-3xl -z-10" />

        <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 overflow-hidden">
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                linear-gradient(to right, rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
              `,
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          {/* Side by Side Progress Bars Container */}
          <div className="relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sign Message Section */}
              <div className="bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30">
                    <Wallet className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-purple-300">
                      SOL Commit
                    </h3>
                    <p className="text-sm text-gray-400">
                      Minimum 0.1 SOL required to sign and participate
                    </p>
                  </div>
                </div>

                {/* Sign Message Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Min Balance</p>
                    <p className="text-lg font-bold text-purple-300">0.1 SOL</p>
                  </div>
                </div>

                {/* Simple Info */}
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-bold text-purple-300">
                      Simple Participation
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Just hold 0.1+ SOL and sign the message to indicate
                    commitment to the Pre-Sale.
                  </p>
                </div>

                {/* Wallet Connection and Sign Message Button */}
                <div className="mt-4 space-y-3">
                  <Button
                    onClick={() => {
                      window.open(
                        "https://leaderboard.songjam.space/adam",
                        "_blank"
                      );
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Wallet className="w-5 h-5" />
                      Sign Message
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  </Button>
                </div>
              </div>

              {/* Mindshare Progress Section */}
              <div className="bg-gradient-to-br from-cyan-500/5 to-transparent border border-cyan-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                    <Users className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-cyan-300">
                        Mindshare Target
                      </h3>
                      <InfoPopover />
                    </div>
                    <p className="text-sm text-gray-400">
                      #2 Reach 5k space mentions to progress to next $ADAM MSI
                      target
                    </p>
                  </div>
                </div>

                {/* Mindshare Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Mentions</p>
                    <motion.p
                      key={currentYappers}
                      initial={{ scale: 1.2, color: "#06b6d4" }}
                      animate={{ scale: 1, color: "#67e8f9" }}
                      className="text-lg font-bold"
                    >
                      {currentYappers.toLocaleString()}
                    </motion.p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Target</p>
                    <p className="text-lg font-bold text-blue-100">
                      {MINDSHARE_TARGET_YAPPERS.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Mindshare Progress Bar */}
                <div className="relative">
                  <div className="relative h-6 bg-black/60 rounded-full border border-white/10 overflow-hidden">
                    {/* Background glow */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />

                    {/* Progress fill */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${mindshareProgress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-600 rounded-full"
                      style={{
                        boxShadow:
                          "0 0 20px rgba(6, 182, 212, 0.6), 0 0 40px rgba(59, 130, 246, 0.4)",
                      }}
                    />

                    {/* Animated shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{
                        x: ["-100%", "200%"],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatDelay: 1,
                      }}
                      style={{ width: "50%" }}
                    />
                  </div>

                  {/* Mindshare Milestone markers */}
                  <div className="relative mt-2 flex justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span className="text-cyan-400">500</span>
                    <span className="text-blue-400">1,000</span>
                    <span className="text-cyan-400">1,750</span>
                    <span className="text-white font-bold">2,500</span>
                  </div>
                </div>

                {/* Progress percentage */}
                <div className="mt-4 text-center">
                  <motion.p
                    key={mindshareProgress}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
                  >
                    {mindshareProgress.toFixed(1)}% Complete
                  </motion.p>
                </div>

                {/* Yap now button */}
                <div className="mt-5">
                  <motion.a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      "Why @adam_songjam?"
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 hover:from-cyan-500/20 hover:to-transparent hover:border-cyan-500/30 text-cyan-300 hover:text-cyan-200 font-bold py-1 rounded-xl transition-all duration-300 transform hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MessageSquare className="w-5 h-5" />
                    Sing now
                    <ExternalLink className="w-4 h-4" />
                  </motion.a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
