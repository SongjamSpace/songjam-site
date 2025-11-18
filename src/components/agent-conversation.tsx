"use client";

import { useCallback, useState, useEffect } from "react";
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
      routeUser: (type: "signMessage" | "staking") => {
        console.log("Client tool routeUser called");
        if (type === "signMessage") {
          window.open("https://leaderboard.songjam.space/adam", "_blank");
        } else if (type === "staking") {
          window.open("https://leaderboard.songjam.space/stake", "_blank");
        }
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
    const volume = Math.min(1.0, Math.pow(rawValue, 0.5) * 2.5);
    if (onVolumeChange) {
      const outputVolume = Math.min(
        1.0,
        Math.pow(conversation.getOutputVolume?.() ?? 0, 0.5) * 2.5
      );
      onVolumeChange(volume, outputVolume);
    }
    return volume;
  }, [conversation, onVolumeChange]);

  const getOutputVolume = useCallback(() => {
    const rawValue = conversation.getOutputVolume?.() ?? 0;
    const volume = Math.min(1.0, Math.pow(rawValue, 0.5) * 2.5);
    if (onVolumeChange) {
      const inputVolume = Math.min(
        1.0,
        Math.pow(conversation.getInputVolume?.() ?? 0, 0.5) * 2.5
      );
      onVolumeChange(inputVolume, volume);
    }
    return volume;
  }, [conversation, onVolumeChange]);

  // Update volumes continuously when connected
  useEffect(() => {
    if (isCallActive) {
      const interval = setInterval(() => {
        getInputVolume();
        getOutputVolume();
      }, 50); // Update every 50ms for smooth animation
      return () => clearInterval(interval);
    }
  }, [isCallActive, getInputVolume, getOutputVolume]);

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
            />
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{getStatusText()}</p>
    </div>
  );
}
