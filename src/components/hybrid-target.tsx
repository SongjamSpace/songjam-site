"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Users,
  Target,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { Button } from "./ui/button";
import { usePrivyWallet } from "@/lib/hooks/usePrivyWallet";

// Mindshare Configuration
const MINDSHARE_TARGET_YAPPERS = 2500;

export default function HybridTarget({
  currentYappers,
}: {
  currentYappers: number;
}) {
  // const [currentYappers, setCurrentYappers] = useState(totalUsersCount);
  // const [engagementScore, setEngagementScore] = useState(MOCK_ENGAGEMENT_SCORE);

  // Use Privy wallet hook
  const {
    ready,
    authenticated,
    user,
    solanaWallet,
    hasSolanaWallet,
    isSigning,
    isSigned,
    signature,
    connectWallet,
    signMessage,
    disconnectWallet,
    hasMinimumBalance,
  } = usePrivyWallet();

  const mindshareProgress = Math.min(
    (currentYappers / MINDSHARE_TARGET_YAPPERS) * 100,
    100
  );

  const handleSignMessage = async () => {
    try {
      if (!authenticated) {
        await connectWallet();
        return;
      }

      if (!hasSolanaWallet) {
        alert("Please connect a Solana wallet to sign the message.");
        return;
      }

      const hasEnoughBalance = await hasMinimumBalance(0.1);
      if (!hasEnoughBalance) {
        alert("You need at least 0.1 SOL to participate.");
        return;
      }

      await signMessage(
        "Sign this message to participate in the Songjam Pre-Sale"
      );
    } catch (error) {
      console.error("Failed to sign message:", error);
      alert("Failed to sign message. Please try again.");
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  };

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
                      Sign Message
                    </h3>
                    <p className="text-sm text-gray-400">
                      Minimum 0.1 SOL required to sign and participate
                    </p>
                  </div>
                </div>

                {/* Sign Message Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Min Required</p>
                    <p className="text-lg font-bold text-purple-300">0.1 SOL</p>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Status</p>
                    <p
                      className={`text-lg font-bold ${
                        isSigned
                          ? "text-green-400"
                          : authenticated && hasSolanaWallet
                          ? "text-blue-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {isSigned
                        ? "Signed"
                        : authenticated && hasSolanaWallet
                        ? "Connected"
                        : "Ready"}
                    </p>
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
                  {!authenticated ? (
                    <Button
                      onClick={handleConnectWallet}
                      disabled={!ready}
                      className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Wallet className="w-5 h-5" />
                        Connect Wallet
                      </span>
                    </Button>
                  ) : authenticated && !hasSolanaWallet ? (
                    <div className="text-center">
                      <p className="text-sm text-yellow-400 mb-2">
                        Please connect a Solana wallet to continue
                      </p>
                      <Button
                        onClick={handleConnectWallet}
                        variant="outline"
                        className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Add Solana Wallet
                        </span>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleSignMessage}
                      disabled={isSigning || isSigned}
                      className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSigning ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          />
                          Signing...
                        </span>
                      ) : isSigned ? (
                        <span className="flex items-center justify-center gap-2">
                          <MessageSquare className="w-5 h-5" />
                          Message Signed ✓
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <MessageSquare className="w-5 h-5" />
                          Sign Message
                        </span>
                      )}
                    </Button>
                  )}

                  {/* Wallet Info */}
                  {authenticated && hasSolanaWallet && solanaWallet && (
                    <div className="text-center">
                      <p className="text-xs text-gray-400">
                        Connected: {solanaWallet.address.slice(0, 8)}...
                        {solanaWallet.address.slice(-8)}
                      </p>
                      {signature && (
                        <p className="text-xs text-green-400 mt-1">
                          Signature: {signature.slice(0, 16)}...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Mindshare Progress Section */}
              <div className="bg-gradient-to-br from-orange-500/5 to-transparent border border-orange-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
                    <Users className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-orange-300">
                      Mindshare Target
                    </h3>
                    <p className="text-sm text-gray-400">
                      #1 Achieve 2.5k total Songjammers to go to the next unlock
                    </p>
                  </div>
                </div>

                {/* Mindshare Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Songjammers</p>
                    <motion.p
                      key={currentYappers}
                      initial={{ scale: 1.2, color: "#fb923c" }}
                      animate={{ scale: 1, color: "#fed7aa" }}
                      className="text-lg font-bold"
                    >
                      {currentYappers.toLocaleString()}
                    </motion.p>
                  </div>
                  <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Target</p>
                    <p className="text-lg font-bold text-red-100">
                      {MINDSHARE_TARGET_YAPPERS.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Mindshare Progress Bar */}
                <div className="relative">
                  <div className="relative h-6 bg-black/60 rounded-full border border-white/10 overflow-hidden">
                    {/* Background glow */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20"
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
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 rounded-full"
                      style={{
                        boxShadow:
                          "0 0 20px rgba(251, 146, 60, 0.6), 0 0 40px rgba(239, 68, 68, 0.4)",
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
                    <span className="text-orange-400">500</span>
                    <span className="text-red-400">1,000</span>
                    <span className="text-orange-400">1,750</span>
                    <span className="text-white font-bold">2,500</span>
                  </div>
                </div>

                {/* Progress percentage */}
                <div className="mt-4 text-center">
                  <motion.p
                    key={mindshareProgress}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-lg font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent"
                  >
                    {mindshareProgress.toFixed(1)}% Complete
                  </motion.p>
                </div>

                {/* Yap now button */}
                <div className="mt-5">
                  <motion.a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      "Lets sing for $SANG"
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 hover:from-orange-500/20 hover:to-transparent hover:border-orange-500/30 text-orange-300 hover:text-orange-200 font-bold py-1 rounded-xl transition-all duration-300 transform hover:scale-105"
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
