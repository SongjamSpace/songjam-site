'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DailyProvider, useDaily, useParticipantIds, useLocalParticipant, DailyAudio } from '@daily-co/daily-react';
import { getEmpireBuilderByHostSlug, EmpireBuilder } from '@/services/db/empireBuilder.db';
import { useAuth } from '@/components/providers';
import { Mic, MicOff, Users, LogOut, Radio, Crown, Loader2 } from 'lucide-react';

// Loading component
const LoadingSpinner = () => (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
        >
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            <p className="text-slate-400">Loading space...</p>
        </motion.div>
    </div>
);

// Not found component
const NotFound = ({ username }: { username: string }) => (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
        >
            <h1 className="text-4xl font-bold text-white mb-4">Space Not Found</h1>
            <p className="text-slate-400 mb-6">
                No host found with username @{username}
            </p>
            <a
                href="/spaces"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition-colors"
            >
                Go to Spaces
            </a>
        </motion.div>
    </div>
);

// Token not deployed component
const TokenNotDeployed = ({ hostData }: { hostData: EmpireBuilder }) => (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
        >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <Crown className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">{hostData.name}</h1>
            <p className="text-slate-400 mb-6">
                This host&apos;s token is not yet deployed. Check back soon!
            </p>
            <p className="text-sm text-slate-500">
                Status: {hostData.deploymentStatus || 'pending'}
            </p>
        </motion.div>
    </div>
);

// Participant bubble component
const ParticipantBubble = ({ id, isHost }: { id: string; isHost: boolean }) => {
    const participant = useLocalParticipant();
    const isLocal = participant?.session_id === id;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group"
        >
            <div className={`
                w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 
                ${isHost 
                    ? 'bg-gradient-to-br from-purple-500 to-cyan-500 p-1' 
                    : 'bg-slate-800 border-2 border-slate-700'
                }
            `}>
                <div className={`
                    w-full h-full rounded-full flex items-center justify-center
                    ${isHost ? 'bg-slate-900' : ''}
                `}>
                    <span className="text-xl font-bold text-white">
                        {isLocal ? 'You' : '?'}
                    </span>
                </div>
            </div>
            {isHost && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full text-white text-[10px] font-bold uppercase">
                    Host
                </div>
            )}
        </motion.div>
    );
};

// Main room content component
const RoomContent = ({ 
    hostData, 
    isHost,
    onLeave 
}: { 
    hostData: EmpireBuilder;
    isHost: boolean;
    onLeave: () => void;
}) => {
    const daily = useDaily();
    const localParticipant = useLocalParticipant();
    const participantIds = useParticipantIds();
    const [isMicEnabled, setIsMicEnabled] = useState(false);

    const handleToggleMic = useCallback(() => {
        if (!daily) return;
        const newState = !isMicEnabled;
        daily.setLocalAudio(newState);
        setIsMicEnabled(newState);
    }, [daily, isMicEnabled]);

    const handleLeave = useCallback(() => {
        daily?.leave();
        onLeave();
    }, [daily, onLeave]);

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-white">
            <DailyAudio />
            
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center p-6 border-b border-slate-800"
            >
                <div className="flex items-center gap-4">
                    {hostData.imageUrl && (
                        <img 
                            src={hostData.imageUrl} 
                            alt={hostData.name}
                            className="w-12 h-12 rounded-full border-2 border-purple-500"
                        />
                    )}
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            {hostData.name}&apos;s Space
                        </h1>
                        <p className="text-slate-400 text-sm">@{hostData.hostSlug} • ${hostData.symbol}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full text-slate-300">
                        <Users className="w-4 h-4" />
                        <span>{participantIds.length}</span>
                    </div>
                    
                    <button
                        onClick={handleToggleMic}
                        className={`
                            p-3 rounded-full transition-all
                            ${isMicEnabled 
                                ? 'bg-green-500 hover:bg-green-600' 
                                : 'bg-slate-700 hover:bg-slate-600'
                            }
                        `}
                    >
                        {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </button>
                    
                    <button
                        onClick={handleLeave}
                        className="p-3 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>

            {/* Main content - Participants */}
            <div className="flex-1 p-6 overflow-hidden">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="h-full bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex flex-wrap gap-6 content-start"
                >
                    {participantIds.map((id, index) => (
                        <ParticipantBubble 
                            key={id} 
                            id={id} 
                            isHost={index === 0} // First participant is usually the host
                        />
                    ))}
                    
                    {participantIds.length === 0 && (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                            <div className="text-center">
                                <Radio className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Waiting for participants...</p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Token info footer */}
            {hostData.tokenAddress && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border-t border-slate-800 bg-slate-900/50"
                >
                    <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
                        <span>Token: {hostData.tokenAddress.slice(0, 6)}...{hostData.tokenAddress.slice(-4)}</span>
                        <span>•</span>
                        <a 
                            href={`https://basescan.org/token/${hostData.tokenAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            View on Basescan
                        </a>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

// Pre-join lobby component
const PreJoinLobby = ({ 
    hostData, 
    onJoin, 
    isJoining 
}: { 
    hostData: EmpireBuilder;
    onJoin: () => void;
    isJoining: boolean;
}) => {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl" />
            </div>
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 max-w-md w-full"
            >
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 p-8 text-center">
                    {/* Host token image */}
                    {hostData.imageUrl && (
                        <motion.img 
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            src={hostData.imageUrl}
                            alt={hostData.name}
                            className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-purple-500 shadow-xl shadow-purple-500/20"
                        />
                    )}
                    
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {hostData.name}&apos;s Space
                    </h1>
                    <p className="text-slate-400 mb-6">
                        @{hostData.hostSlug} • ${hostData.symbol}
                    </p>
                    
                    {/* Live badge */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <span className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            Ready to go live
                        </span>
                    </div>
                    
                    <button
                        onClick={onJoin}
                        disabled={isJoining}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-2xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isJoining ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Joining...
                            </>
                        ) : (
                            <>
                                <Radio className="w-5 h-5" />
                                Join Space
                            </>
                        )}
                    </button>
                    
                    <p className="text-slate-500 text-sm mt-4">
                        Your microphone will be requested when you join
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

// Main page component (wrapped with DailyProvider)
const HostSpaceContent = () => {
    const params = useParams();
    const router = useRouter();
    const twitterUsername = params.twitterUsername as string;
    const { user, authenticated, twitterObj } = useAuth();
    
    const daily = useDaily();
    
    const [hostData, setHostData] = useState<EmpireBuilder | null>(null);
    const [loading, setLoading] = useState(true);
    const [roomState, setRoomState] = useState<'lobby' | 'joining' | 'joined'>('lobby');
    const [error, setError] = useState<string | null>(null);

    // Fetch host data
    useEffect(() => {
        const fetchHost = async () => {
            try {
                const host = await getEmpireBuilderByHostSlug(twitterUsername);
                setHostData(host);
            } catch (err) {
                console.error('Error fetching host:', err);
                setError('Failed to load host data');
            } finally {
                setLoading(false);
            }
        };
        
        if (twitterUsername) {
            fetchHost();
        }
    }, [twitterUsername]);

    // Check if current user is the host
    const isHost = hostData && (twitterObj?.twitterId === hostData.twitterId || user?.uid === hostData.twitterId);

    // Handle joining the room
    const handleJoinRoom = useCallback(async () => {
        if (!hostData || !daily) return;
        
        setRoomState('joining');
        
        try {
            // Create a room via the API
            const response = await fetch('/api/daily/room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    properties: {
                        // Room will expire in 24 hours
                        exp: Math.round(Date.now() / 1000) + 24 * 60 * 60,
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to create room');
            }
            
            const roomData = await response.json();
            
            // Request mic permission
            await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Join the Daily room
            await daily.join({
                url: roomData.url,
                userName: twitterObj?.name || user?.displayName || 'Guest',
            });
            
            setRoomState('joined');
        } catch (err) {
            console.error('Error joining room:', err);
            setError('Failed to join room');
            setRoomState('lobby');
        }
    }, [hostData, daily, twitterObj, user]);

    // Handle leaving the room
    const handleLeaveRoom = useCallback(() => {
        setRoomState('lobby');
    }, []);

    // Loading state
    if (loading) {
        return <LoadingSpinner />;
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button 
                        onClick={() => router.push('/songjam-space')}
                        className="text-purple-400 hover:text-purple-300"
                    >
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    // Not found state
    if (!hostData) {
        return <NotFound username={twitterUsername} />;
    }

    // Token not deployed state
    if (hostData.deploymentStatus !== 'deployed') {
        return <TokenNotDeployed hostData={hostData} />;
    }

    // Joined state - show the room
    if (roomState === 'joined') {
        return (
            <RoomContent 
                hostData={hostData}
                isHost={isHost || false}
                onLeave={handleLeaveRoom}
            />
        );
    }

    // Lobby state - show pre-join UI
    return (
        <PreJoinLobby 
            hostData={hostData}
            onJoin={handleJoinRoom}
            isJoining={roomState === 'joining'}
        />
    );
};

// Export with DailyProvider wrapper
export default function HostSpacePage() {
    return (
        <DailyProvider>
            <HostSpaceContent />
        </DailyProvider>
    );
}
