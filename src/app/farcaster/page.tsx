"use client";

import { SignInButton, useProfile } from "@farcaster/auth-kit";
import { useState, useCallback } from "react";
import FarcasterVoiceAgent from "@/components/farcaster-voice-agent";
import AudioReactiveBackground from "@/components/audio-reactive-background";
import { motion } from "framer-motion";

export default function FarcasterPage() {
    const {
        isAuthenticated,
        profile: { username, pfpUrl, bio, displayName },
    } = useProfile();

    const [inputVolume, setInputVolume] = useState(0);
    const [outputVolume, setOutputVolume] = useState(0);
    const [agentState, setAgentState] = useState<string | null>("disconnected");

    const handleVolumeChange = useCallback((input: number, output: number) => {
        setInputVolume(input);
        setOutputVolume(output);
    }, []);

    const handleStateChange = useCallback((state: string | null) => {
        setAgentState(state);
    }, []);

    const isConnected = agentState === "connected";

    if (!isAuthenticated) {
        return (
            <div className="relative flex min-h-screen flex-col items-center justify-center bg-black overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />

                <div className="relative z-10 w-full max-w-md space-y-8 text-center p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl font-bold tracking-tight text-white mb-2">
                            Songjam <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Voice</span>
                        </h2>
                        <p className="text-gray-400 text-lg">
                            Experience the future of social interaction
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex justify-center"
                    >
                        <div className="p-[2px] rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                            <div className="bg-black rounded-xl p-1">
                                <SignInButton />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
            {/* Audio Reactive Background */}
            <AudioReactiveBackground
                inputVolume={inputVolume}
                outputVolume={outputVolume}
                isConnected={isConnected}
                reactToUserInput
            />

            {/* Main Content Layer */}
            <div className="relative z-10 h-screen flex flex-col">
                {/* Header */}
                <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
                    <div className="flex items-center gap-3 bg-black/20 backdrop-blur-lg rounded-full p-2 pr-6 border border-white/10">
                        {pfpUrl && (
                            <img
                                src={pfpUrl}
                                alt={displayName || "Profile"}
                                className="h-10 w-10 rounded-full border border-purple-500/50"
                            />
                        )}
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white leading-none">
                                {displayName}
                            </span>
                            <span className="text-xs text-purple-400 leading-none mt-1">
                                @{username}
                            </span>
                        </div>
                    </div>

                    <div className="bg-black/20 backdrop-blur-lg rounded-full px-4 py-2 border border-white/10">
                        <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
                            {isConnected ? "Live Session" : "Voice Agent Ready"}
                        </span>
                    </div>
                </header>

                {/* Voice Agent Interface */}
                <main className="flex-1 relative">
                    <FarcasterVoiceAgent
                        onVolumeChange={handleVolumeChange}
                        onStateChange={handleStateChange}
                        userProfile={{ username, displayName, bio }}
                    />
                </main>
            </div>
        </div>
    );
}
