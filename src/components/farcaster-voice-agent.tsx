"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useConversation } from "@elevenlabs/react";
import { Orb } from "@/components/ui/orb";
import { SuggestionCard, SuggestionData } from "./suggestion-card";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_AGENT = {
    agentId: process.env.NEXT_PUBLIC_ADAM_AGENT!,
};

type AgentState =
    | "disconnected"
    | "connecting"
    | "connected"
    | "disconnecting"
    | null;

interface FarcasterVoiceAgentProps {
    onVolumeChange?: (inputVolume: number, outputVolume: number) => void;
    onStateChange?: (state: AgentState) => void;
    userProfile?: any;
    feedData?: any[];
}

export default function FarcasterVoiceAgent({
    onVolumeChange,
    onStateChange,
    userProfile,
    feedData = [],
}: FarcasterVoiceAgentProps) {
    const [agentState, setAgentState] = useState<AgentState>("disconnected");
    const [currentSuggestion, setCurrentSuggestion] = useState<SuggestionData | null>(null);
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
            suggestProfile: ({ name, username, bio, reason }: any) => {
                console.log("Suggesting profile:", username);
                setCurrentSuggestion({
                    id: `profile-${username}`,
                    type: "profile",
                    title: name || username,
                    description: reason || bio,
                    imageUrl: `https://unavatar.io/${username}`,
                    stats: [
                        { label: "Username", value: `@${username}` },
                        { label: "Match", value: "98%" },
                    ],
                    actionLabel: "Follow Profile",
                    onAction: () => window.open(`https://warpcast.com/${username}`, "_blank"),
                });
                return "Profile suggested to user";
            },
            suggestContent: ({ author, content, reason }: any) => {
                console.log("Suggesting content from:", author);
                setCurrentSuggestion({
                    id: `content-${Date.now()}`,
                    type: "content",
                    title: `Cast by ${author}`,
                    description: content,
                    stats: [
                        { label: "Relevance", value: "High" },
                        { label: "Topic", value: "Crypto" },
                    ],
                    actionLabel: "View Cast",
                    onAction: () => window.open(`https://warpcast.com`, "_blank"), // Placeholder
                });
                return "Content suggested to user";
            },
            analyzeMarket: ({ token, trend, analysis }: any) => {
                console.log("Analyzing market:", token);
                setCurrentSuggestion({
                    id: `analysis-${token}`,
                    type: "analysis",
                    title: `${token} Analysis`,
                    description: analysis,
                    stats: [
                        { label: "Trend", value: trend },
                        { label: "Sentiment", value: "Bullish" },
                    ],
                    actionLabel: "Trade Now",
                    onAction: () => window.open(`https://dexscreener.com`, "_blank"),
                });
                return "Market analysis shown";
            },
            summarizeFeed: ({ summary, topTopics, castCount }: any) => {
                console.log("Summarizing feed:", { summary, topTopics, castCount });

                // Get today's casts
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayCasts = feedData.filter((cast: any) => {
                    const castDate = new Date(cast.timestamp);
                    return castDate >= today;
                });

                setCurrentSuggestion({
                    id: `feed-summary-${Date.now()}`,
                    type: "analysis",
                    title: "Today's Feed Summary",
                    description: summary || `Analyzed ${todayCasts.length} casts from your feed today. ${topTopics ? `Top topics: ${topTopics.join(", ")}` : ""}`,
                    stats: [
                        { label: "Total Casts", value: `${castCount || todayCasts.length}` },
                        { label: "Period", value: "Today" },
                    ],
                    actionLabel: "View Feed",
                    onAction: () => window.scrollTo({ top: 0, behavior: "smooth" }),
                });
                return `Feed summary displayed. Found ${todayCasts.length} casts from today.`;
            },
        },
    });

    const startConversation = useCallback(async () => {
        try {
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
            setCurrentSuggestion(null);
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

    // Update volumes
    useEffect(() => {
        if (isCallActive && onVolumeChange) {
            const interval = setInterval(() => {
                const inputVolume = getInputVolume();
                const outputVolume = getOutputVolume();
                const threshold = 0.01;

                if (
                    Math.abs(inputVolume - lastVolumesRef.current.input) > threshold ||
                    Math.abs(outputVolume - lastVolumesRef.current.output) > threshold
                ) {
                    lastVolumesRef.current = { input: inputVolume, output: outputVolume };
                    onVolumeChange(inputVolume, outputVolume);
                }
            }, 50);
            return () => clearInterval(interval);
        } else {
            lastVolumesRef.current = { input: 0, output: 0 };
            if (onVolumeChange) onVolumeChange(0, 0);
        }
    }, [isCallActive, getInputVolume, getOutputVolume, onVolumeChange]);

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
            {/* Suggestion Card Area - Floating above the orb */}
            <div className="absolute top-1/4 w-full flex justify-center px-4 pointer-events-auto z-20">
                <AnimatePresence mode="wait">
                    {currentSuggestion && (
                        <SuggestionCard key={currentSuggestion.id} data={currentSuggestion} />
                    )}
                </AnimatePresence>
            </div>

            {/* Voice Orb - Centered */}
            <div className="absolute bottom-20 pointer-events-auto z-30 flex flex-col items-center gap-6">
                <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition duration-500 animate-pulse" />
                    <div
                        onClick={handleCall}
                        className="relative w-32 h-32 cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
                    >
                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/10 bg-black/50 backdrop-blur-md shadow-2xl">
                            <Orb
                                className="w-full h-full"
                                volumeMode="manual"
                                getInputVolume={getInputVolume}
                                getOutputVolume={getOutputVolume}
                                imageSrc="/images/adam-dp.jpg"
                            />
                        </div>
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                        {agentState === "connected" ? "Listening..." : "Tap to Speak"}
                    </h3>
                    <p className="text-sm text-gray-400">
                        {agentState === "connected"
                            ? "Ask for profiles, trends, or analysis"
                            : "Connect with your AI Farcaster Agent"}
                    </p>
                </div>
            </div>
        </div>
    );
}
