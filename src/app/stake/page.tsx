"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Corners from "@/components/corners";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getStakingStatus,
  isValidEthereumAddress,
  type StakingInfo,
} from "@/lib/staking";

export default function Stake() {
  const [walletAddress, setWalletAddress] = useState("");
  const [stakingInfo, setStakingInfo] = useState<StakingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckBalance = async () => {
    if (!walletAddress.trim()) {
      setError("Please enter a wallet address");
      return;
    }

    if (!isValidEthereumAddress(walletAddress.trim())) {
      setError(
        "Please enter a valid Ethereum address (0x followed by 40 characters)"
      );
      return;
    }

    setIsLoading(true);
    setError("");
    setStakingInfo(null);

    try {
      const info = await getStakingStatus(walletAddress.trim());
      setStakingInfo(info);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch staking information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative bg-top p-4 min-h-screen flex flex-col">
      <Navbar inverse />

      <div className="flex-1 flex flex-col lg:flex-row justify-center text-[#48333D] gap-8 lg:gap-16 max-w-6xl mx-auto pt-16 px-4">
        {/* Left side - Staking Information */}
        <div className="flex flex-col w-full lg:w-1/2">
          <h1 className="text-3xl lg:text-4xl font-bold uppercase mb-6">
            EVA Staking
          </h1>

          <div className="space-y-6">
            {/* EVA Stake Multiplier Bonus */}
            <div className="relative">
              {/* <Corners /> */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-[#FF007A]">
                  EVA Stake Multiplier Bonus
                </h3>
                <p className="text-sm lg:text-base">
                  Stake your EVA tokens to earn multiplier bonuses. The longer
                  you stake, the higher your multiplier becomes, maximizing your
                  rewards and earning potential.
                </p>
              </div>
            </div>

            {/* Mystery Stake Bonus */}
            <div className="relative ">
              {/* <Corners /> */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-[#FF007A]">
                  Mystery Stake Bonus
                </h3>
                <p className="text-sm lg:text-base">
                  Unlock exclusive mystery bonuses through strategic staking.
                  Special rewards and rare bonuses await those who participate
                  in our mystery stake program.
                </p>
              </div>
            </div>

            {/* IP Activation */}
            <div className="relative ">
              {/* <Corners /> */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-[#FF007A]">
                  IP Activation
                </h3>
                <p className="text-sm lg:text-base">
                  Activate your intellectual property rights through staking.
                  Gain access to exclusive content, early features, and special
                  privileges within the EVA ecosystem.
                </p>
              </div>
            </div>

            {/* Stake $EVA Button */}
            <div className="relative mt-8">
              {/* <Corners /> */}
              <div className="p-6 text-center">
                <a
                  href="https://app.virtuals.io/virtuals/33654"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-black text-white border border-white/30 hover:bg-black/90 hover:border-white/50 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Stake $EVA
                </a>
                <p className="text-sm mt-3 text-gray-600">
                  Click to open the Virtuals staking platform
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Video */}
        <div className="flex flex-col w-full lg:w-1/2">
          <div className="relative p-6">
            <Corners />
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#FF007A]">
                Staking Tutorial
              </h3>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                  poster="/images/banner.png"
                >
                  <source src="/evastake.mov" type="video/quicktime" />
                  <source src="/evastake.mov" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <p className="text-sm text-center">
                Watch our comprehensive guide to understand the staking process
                and maximize your rewards.
              </p>
            </div>
          </div>

          {/* Check Staking Balance */}
          <div className="relative mt-8">
            {/* <Corners /> */}
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-[#FF007A]">
                Check Your Staking $EVA Balance
              </h3>
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Enter wallet address (0x...)"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="!border-[#FF007A]/20 focus:!border-[#FF007A] focus:!ring-2 focus:!ring-[#FF007A]/20 focus:!ring-offset-0 focus:!outline-none bg-white/90 backdrop-blur-sm text-[#48333D] placeholder:text-[#48333D]/60"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button
                  onClick={handleCheckBalance}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#FF007A] to-[#FF6B9D] hover:from-[#FF6B9D] hover:to-[#FF007A] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? "Checking..." : "Check Balance"}
                </Button>
              </div>

              {/* Staking Results */}
              {stakingInfo && (
                <div className="mt-4 p-4 bg-gradient-to-r from-[#FF007A]/10 to-[#FF6B9D]/10 rounded-lg border border-[#FF007A]/20">
                  <h4 className="font-bold text-[#FF007A] mb-2">
                    Staking Status
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Balance:</span>
                      <span className="font-mono">
                        {stakingInfo.formattedBalance} $EVA
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Minimum Stake (50k): </span>
                      <span
                        className={
                          stakingInfo.hasMinimumStake
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {stakingInfo.hasMinimumStake ? "✓ Met" : "✗ Not Met"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Optimal amount (500k):</span>
                      <span
                        className={
                          stakingInfo.optimalStake
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {stakingInfo.optimalStake
                          ? "✓ Optimal"
                          : "✗ Not Optimal"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span
                        className={
                          stakingInfo.hasMinimumStake
                            ? "text-green-600 font-bold"
                            : "text-gray-600"
                        }
                      >
                        {stakingInfo.hasMinimumStake
                          ? "Active Staker"
                          : "No Active Stake"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-center py-6 text-[#48333D]">
        COPYRIGHT © 2025 SONGJAM
      </div>
    </div>
  );
}
