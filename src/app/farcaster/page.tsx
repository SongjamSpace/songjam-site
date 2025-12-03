"use client";

import { SignInButton, useProfile, useSignIn } from "@farcaster/auth-kit";
import { useState, useCallback, useEffect } from "react";
import FarcasterVoiceAgent from "@/components/farcaster-voice-agent";
import AudioReactiveBackground from "@/components/audio-reactive-background";
import { motion } from "framer-motion";
import { FeedItem } from "./feed-item";
import { FeedResponse } from "./types";

const NEYNAR_BASE_URL = 'https://api.neynar.com';

export default function FarcasterPage() {
    // const {
    //     signIn,
    //     url,
    //     data,
    //     isSuccess,
    //     isError,
    // } = useSignIn({
    //     onSuccess: ({ fid }) => console.log('Your fid:', fid),
    // });

    // const signInUsername = data?.username;

    // console.log('signInUsername', data);

    // const {
    //     isAuthenticated,
    //     profile: { username, pfpUrl, bio, displayName, fid },
    // } = useProfile();
    const isAuthenticated = true;
    const { fid, username, display_name: displayName, pfp_url: pfpUrl, bio } = {
        "fid": 19640,
        "username": "zaal",
        "display_name": "Zaal @ The ZAO",
        "pfp_url": "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/f9277373-2f85-411b-5d94-d8e11a43de00/original",
        "bio": "Better call ZAAL || Founder of ZAO // Zeal // Alignment // Ownership || Empowering musicians to bring control back to independent creators || Storyteller ||"
    }

    const [inputVolume, setInputVolume] = useState(0);
    const [outputVolume, setOutputVolume] = useState(0);
    const [agentState, setAgentState] = useState<string | null>("disconnected");
    const [feedData, setFeedData] = useState<FeedResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // const [userFid, setUserFid] = useState<number | null>(null);

    const handleVolumeChange = useCallback((input: number, output: number) => {
        setInputVolume(input);
        setOutputVolume(output);
    }, []);

    const handleStateChange = useCallback((state: string | null) => {
        setAgentState(state);
    }, []);

    const isConnected = agentState === "connected";

    // // Fetch FID from username if not available directly
    // useEffect(() => {
    //     if (isAuthenticated && username && !userFid) {
    //         const fetchFid = async () => {
    //             try {
    //                 const response = await fetch(`${NEYNAR_BASE_URL}/v2/farcaster/user?username=${username}`);
    //                 if (response.ok) {
    //                     const data = await response.json();
    //                     setUserFid(data.user?.fid || null);
    //                 }
    //             } catch (err) {
    //                 console.error("Error fetching FID:", err);
    //             }
    //         };

    //         // Check if fid is available directly from profile
    //         if (fid) {
    //             setUserFid(fid);
    //         } else {
    //             fetchFid();
    //         }
    //     }
    // }, [isAuthenticated, username, fid, userFid]);

    // Fetch feed when user is authenticated and we have FID
    useEffect(() => {
        if (isAuthenticated && fid) {
            const fetchFeed = async () => {
                setLoading(true);
                setError(null);
                try {
                    // const response = await fetch(`${NEYNAR_BASE_URL}/v2/farcaster/feed/for_you/?fid=${userFid}&limit=25`);
                    const response = await fetch(`${NEYNAR_BASE_URL}/v2/farcaster/feed/user/casts/?fid=${fid}&limit=10`, { headers: { "x-api-key": process.env.NEXT_PUBLIC_NEYNAR_API_KEY || '' } });
                    if (!response.ok) {
                        throw new Error("Failed to fetch feed");
                    }
                    const data = await response.json();
                    setFeedData(data);
                } catch (err) {
                    setError(err instanceof Error ? err.message : "Failed to load feed");
                } finally {
                    setLoading(false);
                }
            };
            fetchFeed();
        }
    }, [isAuthenticated, fid]);

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
                                <SignInButton onSuccess={() => console.log('Signed in')} />
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
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-lg border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            {/* Branding */}
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-white">
                                    Songjam <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Voice</span>
                                </h1>
                                <p className="text-sm text-gray-400">
                                    Experience the future of social interaction
                                </p>
                            </div>

                            {/* User Info */}
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
                        </div>
                    </div>
                </header>

                {/* Feed Section */}
                <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Feed Column */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-white mb-4">Your Feed</h2>

                            {loading && (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200">
                                    {error}
                                </div>
                            )}

                            {!loading && !error && feedData?.casts && feedData.casts.length > 0 && (
                                <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
                                    {feedData.casts.map((cast) => (
                                        <FeedItem key={cast.hash} cast={cast} />
                                    ))}
                                </div>
                            )}

                            {!loading && !error && feedData?.casts && feedData.casts.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    No casts in your feed yet
                                </div>
                            )}
                        </div>

                        {/* Voice Agent Column */}
                        <div className="relative min-h-[600px]">
                            <div className="sticky top-24">
                                <FarcasterVoiceAgent
                                    onVolumeChange={handleVolumeChange}
                                    onStateChange={handleStateChange}
                                    userProfile={{ username, displayName, bio }}
                                    feedData={feedData?.casts || []}
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
