"use client";
import React, { useEffect, useState, useCallback } from "react";
import MindshareLeaderboard from "@/components/mindshare-leaderboard";
import Navbar from "@/components/navbar";
import HybridTarget from "@/components/hybrid-target";
import AudioReactiveBackground from "@/components/audio-reactive-background";
import AgentConversation from "@/components/agent-conversation";
import axios from "axios";

const projectId = "adam_songjam";

type AgentState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "disconnecting"
  | null;

export default function Page() {
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [inputVolume, setInputVolume] = useState(0);
  const [outputVolume, setOutputVolume] = useState(0);
  const [agentState, setAgentState] = useState<AgentState>("disconnected");

  const fetchTotalUsersCount = async () => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_SONGJAM_SERVER}/leaderboard/latest-lb-users-count/${projectId}`
    );
    if (res.data.usersCount) {
      setTotalUsersCount(res.data.usersCount);
    }
  };

  const handleVolumeChange = useCallback((input: number, output: number) => {
    setInputVolume(input);
    setOutputVolume(output);
  }, []);

  const handleStateChange = useCallback((state: AgentState) => {
    setAgentState(state);
  }, []);

  useEffect(() => {
    fetchTotalUsersCount();
  }, []);

  // Client Tools:

  const isConnected = agentState === "connected";

  return (
    <div className="relative bg-cover bg-top p-4 min-h-screen md:min-h-auto md:pb-[200px]">
      {/* Audio-reactive background */}
      <AudioReactiveBackground
        inputVolume={inputVolume}
        outputVolume={outputVolume}
        isConnected={isConnected}
        reactToUserInput
      />

      {/* Content with proper z-index */}
      <div className="relative z-10">
        <Navbar />
        <HybridTarget currentYappers={totalUsersCount} />
        <MindshareLeaderboard
          title="Why $ADAM?"
          moto="1st Creator Coin in Songjam Ecosystem - Seeded in SOL for a Cross-Chain Future"
          projectId={projectId}
          timeframes={["24H", "7D", "ALL"]}
          backgroundImageUrl="/images/banners/adam.jpeg"
        />
      </div>

      {/* Agent conversation UI */}
      <AgentConversation
        onVolumeChange={handleVolumeChange}
        onStateChange={handleStateChange}
        metaDetails={{
          totalUsersCount,
        }}
      />
    </div>
  );
}
