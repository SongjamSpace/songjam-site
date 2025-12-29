"use client";
import React, { useEffect, useState, useCallback } from "react";
import MindshareLeaderboard from "@/components/mindshare-leaderboard";
import Navbar from "@/components/navbar";
import HybridTarget from "@/components/hybrid-target";
import AudioReactiveBackground from "@/components/audio-reactive-background";
// import AgentConversation from "@/components/agent-conversation";
import { subscribeToActiveRoom, MSRoom } from "@/services/db/msRooms.db";
import { getAudiofiLatestCountAndTimestamp, getLatestCountAndTimestamp } from "@/services/db/leaderboardProjects";

const PROJECT_ID = "adam_songjam";

type AgentState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "disconnecting"
  | null;

export default function Page() {
  const [totalDiscussions, setTotalDiscussions] = useState(0);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [inputVolume, setInputVolume] = useState(0);
  const [outputVolume, setOutputVolume] = useState(0);
  const [agentState, setAgentState] = useState<AgentState>("disconnected");
  const [activeRoom, setActiveRoom] = useState<MSRoom | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number>();

  const fetchTotalUsersCount = async () => {
    try {
      const audiofiRes = await getAudiofiLatestCountAndTimestamp(PROJECT_ID);
      setTotalDiscussions(audiofiRes.count);
      const infofiRes = await getLatestCountAndTimestamp(PROJECT_ID);
      setTotalUsersCount(infofiRes.count);
      setLastUpdatedAt(infofiRes.timestamp);
    } catch (error) {
      console.error("Error fetching total users count:", error);
    }
  };

  useEffect(() => {
    fetchTotalUsersCount();
  }, []);

  const handleVolumeChange = useCallback((input: number, output: number) => {
    setInputVolume(input);
    setOutputVolume(output);
  }, []);

  const handleStateChange = useCallback((state: AgentState) => {
    setAgentState(state);
  }, []);

  // Subscribe to active room
  useEffect(() => {
    const unsubscribe = subscribeToActiveRoom(PROJECT_ID, (room) => {
      setActiveRoom(room);
    });
    return unsubscribe;
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
        <HybridTarget currentYappers={totalDiscussions} />
        <MindshareLeaderboard
          title="Why $ADAM?"
          moto="1st Creator Coin in Songjam Ecosystem - Seeded in SOL for a Cross-Chain Future"
          projectId={PROJECT_ID}
          timeframes={["24H", "7D", "ALL"]}
          backgroundImageUrl="/images/banners/adam.jpeg"
          showSpacePoints
          showStakingMultiplier
          minStakeStr="10,000"
          lastUpdatedAt={lastUpdatedAt}
          // audioRoomEnabled
        />
      </div>

      {/* Agent conversation UI - Only show if no active room */}
      {/* {!activeRoom && (
        <AgentConversation
          onVolumeChange={handleVolumeChange}
          onStateChange={handleStateChange}
          metaDetails={{
            totalUsersCount,
            // totalDiscussions
          }}
        />
      )} */}
    </div>
  );
}
