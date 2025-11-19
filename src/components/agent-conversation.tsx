"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useConversation } from "@elevenlabs/react";
import { Orb } from "@/components/ui/orb";

const DEFAULT_AGENT = {
  agentId: process.env.NEXT_PUBLIC_ADAM_AGENT!,
};

type AgentState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "disconnecting"
  | null;

interface AgentConversationProps {
  onVolumeChange?: (inputVolume: number, outputVolume: number) => void;
  onStateChange?: (state: AgentState) => void;
  metaDetails: {
    totalUsersCount: number;
  };
}

export default function AgentConversation({
  onVolumeChange,
  onStateChange,
  metaDetails,
}: AgentConversationProps) {
  const [agentState, setAgentState] = useState<AgentState>("disconnected");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastVolumesRef = useRef<{ input: number; output: number }>({
    input: 0,
    output: 0,
  });

  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (message) => console.log("Message:", message),
    onError: (error) => {
      console.error("Error:", error);
      setAgentState("disconnected");
      if (onStateChange) onStateChange("disconnected");
    },
    clientTools: {
      totalUsersCount: () => {
        console.log("Client tool totalUsersCount called");
        return metaDetails.totalUsersCount;
      },
      stakeOrSignMessage: (type: "signMessage" | "staking") => {
        console.log("Client tool routeUser called");
        if (type === "signMessage") {
          window.open("https://leaderboard.songjam.space/adam", "_blank");
        } else if (type === "staking") {
          window.open("https://leaderboard.songjam.space/stake", "_blank");
        }
      },
      getLeaderboardData: () => {
        console.log("Client tool getLeaderboardData called");
        // Scroll to leaderboard
        window.scrollTo({ top: 2000, behavior: "smooth" });
        return "";
      },
      createRequest: ({ username, issueDetails }) => {
        console.log("Issue reported: ", username, issueDetails);
        return "Request created";
      },
    },
  });

  const startConversation = useCallback(async () => {
    try {
      setErrorMessage(null);
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: DEFAULT_AGENT.agentId,
        connectionType: "webrtc",
        onStatusChange: (status) => {
          setAgentState(status.status);
          if (onStateChange) onStateChange(status.status);
        },
      });
    } catch (error) {
      console.error("Error starting conversation:", error);
      setAgentState("disconnected");
      if (onStateChange) onStateChange("disconnected");
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setErrorMessage(
          "Please enable microphone permissions in your browser."
        );
      }
    }
  }, [conversation, onStateChange]);

  const handleCall = useCallback(() => {
    if (agentState === "disconnected" || agentState === null) {
      setAgentState("connecting");
      if (onStateChange) onStateChange("connecting");
      startConversation();
    } else if (agentState === "connected") {
      conversation.endSession();
      setAgentState("disconnected");
      if (onStateChange) onStateChange("disconnected");
    }
  }, [agentState, conversation, startConversation, onStateChange]);

  const isCallActive = agentState === "connected";

  const getInputVolume = useCallback(() => {
    const rawValue = conversation.getInputVolume?.() ?? 0;
    return Math.min(1.0, Math.pow(rawValue, 0.5) * 2.5);
  }, [conversation]);

  const getOutputVolume = useCallback(() => {
    const rawValue = conversation.getOutputVolume?.() ?? 0;
    return Math.min(1.0, Math.pow(rawValue, 0.5) * 2.5);
  }, [conversation]);

  // Update volumes continuously when connected
  useEffect(() => {
    if (isCallActive && onVolumeChange) {
      const interval = setInterval(() => {
        const inputVolume = getInputVolume();
        const outputVolume = getOutputVolume();

        // Only call onVolumeChange if the volume actually changed
        const threshold = 0.01; // Small threshold to avoid unnecessary updates
        const inputChanged =
          Math.abs(inputVolume - lastVolumesRef.current.input) > threshold;
        const outputChanged =
          Math.abs(outputVolume - lastVolumesRef.current.output) > threshold;

        if (inputChanged || outputChanged) {
          lastVolumesRef.current = { input: inputVolume, output: outputVolume };
          onVolumeChange(inputVolume, outputVolume);
        }
      }, 50); // Update every 50ms for smooth animation
      return () => clearInterval(interval);
    } else {
      // Reset volumes when disconnected
      lastVolumesRef.current = { input: 0, output: 0 };
      if (onVolumeChange) {
        onVolumeChange(0, 0);
      }
    }
  }, [isCallActive, getInputVolume, getOutputVolume, onVolumeChange]);

  const getStatusText = () => {
    switch (agentState) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "disconnecting":
        return "Disconnecting...";
      case "disconnected":
      case null:
      default:
        return "Click to Speak";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-4">
      {/* Animated "Meet $ADAM" text */}
      <div className="relative mb-2">
        <div className="adam-text-container">
          <div className="adam-text-line" data-text="Meet">
            Meet
          </div>
          <div className="adam-text-line adam-text-center" data-text="$ADAM">
            $ADAM
          </div>
        </div>
      </div>

      <div className="relative size-32">
        <div
          onClick={handleCall}
          className="bg-muted relative h-full w-full cursor-pointer rounded-full p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]"
        >
          <div className="bg-background h-full w-full overflow-hidden rounded-full shadow-[inset_0_0_12px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_12px_rgba(0,0,0,0.3)]">
            <Orb
              className="h-full w-full"
              volumeMode="manual"
              getInputVolume={getInputVolume}
              getOutputVolume={getOutputVolume}
              imageSrc="/images/adam-dp.jpg"
            />
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{getStatusText()}</p>
    </div>
  );
}
