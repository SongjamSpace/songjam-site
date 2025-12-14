'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpeakerRequest } from '@/services/db/msRooms.db';
import { HMSPeer } from '@100mslive/react-sdk';

interface MiniSpaceBannerProps {
    isHost: boolean;
    isSpeaker: boolean;
    isConnected: boolean;
    participantCount: number;
    activeRoom: any;
    speakerRequests: SpeakerRequest[];
    activeSpeakers: HMSPeer[];
    handRaised: boolean;
    isAudioEnabled: boolean;
    authenticated: boolean;
    onGoLive: () => void;
    onJoin: () => void;
    onLeave: () => void;
    onEndRoom: () => void;
    onToggleMic: () => void;
    onRaiseHand: () => void;
    onLogin: () => void;
    onApproveRequest: (req: SpeakerRequest) => void;
    onDenyRequest: (req: SpeakerRequest) => void;
    onMutePeer: (peerId: string) => void;
    onRemoveSpeaker: (peerId: string) => void;
    playlist: { name: string; audioUrl: string }[];
    currentTrack: string | null;
    onPlayTrack: (url: string) => void;
    onStopTrack: () => void;
    onPinTweet: (url: string) => void;
    pinnedLink?: string | null;
}

export default function MiniSpaceBanner({
    isHost,
    isSpeaker,
    isConnected,
    participantCount,
    activeRoom,
    speakerRequests,
    activeSpeakers,
    handRaised,
    isAudioEnabled,
    authenticated,
    playlist,
    currentTrack,
    onGoLive,
    onJoin,
    onLeave,
    onEndRoom,
    onToggleMic,
    onRaiseHand,
    onLogin,
    onApproveRequest,
    onDenyRequest,
    onMutePeer,
    onRemoveSpeaker,
    onPlayTrack,
    onStopTrack,
    onPinTweet,
    pinnedLink,
}: MiniSpaceBannerProps) {
    const [showRequests, setShowRequests] = React.useState(false);
    const [showSpeakers, setShowSpeakers] = React.useState(false);
    const [showPlaylist, setShowPlaylist] = React.useState(false);
    const [showPinInput, setShowPinInput] = React.useState(false);
    const [tweetUrl, setTweetUrl] = React.useState('');

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
        exit: { opacity: 0, y: 20 }
    };

    const pulseVariants = {
        pulse: { scale: [1, 1.1, 1], opacity: [1, 0.8, 1], transition: { duration: 2, repeat: Infinity } }
    };

    if (!activeRoom && !isConnected) {
        // State: No active room -> Show "Go Live" (if auth) or "Login"
        return (
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-3"
            >
                {!authenticated ? (
                    <button
                        onClick={onLogin}
                        className="group relative px-6 py-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 rounded-full transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <span className="relative text-sm font-medium text-white flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            Login to Host
                        </span>
                    </button>
                ) : (
                    <button
                        onClick={onGoLive}
                        className="group relative px-8 py-3 bg-black rounded-full overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300 hover:scale-105"
                    >
                        {/* Animated Gradient Background */}
                        {/* <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 animate-gradient-x opacity-80 group-hover:opacity-100 transition-opacity" /> */}

                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine" />

                        <span className="relative flex items-center gap-2 text-sm font-bold text-white tracking-wide">
                            <motion.span
                                variants={pulseVariants}
                                animate="pulse"
                                className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                            />
                            START AUDIO SPACE
                        </span>
                    </button>
                )}
            </motion.div>
        );
    }

    // State: Active Room Exists
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-50"
        >
            <div className="flex items-center gap-2 p-1.5 pr-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-purple-500/10">

                {/* Status Indicator / Avatar */}
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shrink-0 overflow-hidden">
                    {activeRoom?.hostName ? (
                        <span className="text-sm font-bold text-white">{activeRoom.hostName[0]}</span>
                    ) : (
                        <span className="text-lg">🎙️</span>
                    )}
                    {isConnected && (
                        <motion.div
                            className="absolute inset-0 border-2 border-green-400 rounded-full"
                            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    )}
                </div>

                {/* Info Section */}
                <div className="flex flex-col mr-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white tracking-wide">
                            {activeRoom?.hostName || 'Live Space'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                            LIVE
                        </span>
                    </div>
                    <div className="text-[10px] text-white/60 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {participantCount} listening
                    </div>
                </div>

                {/* Vertical Divider */}
                <div className="w-px h-8 bg-white/10 mx-1" />

                {/* Controls */}
                <div className="flex items-center gap-2">

                    {/* Join Button (if not connected) */}
                    {!isConnected && (
                        <button
                            onClick={onJoin}
                            className="px-4 py-1.5 bg-white text-black hover:bg-gray-200 rounded-full text-xs font-bold transition-colors"
                        >
                            Join Space
                        </button>
                    )}

                    {/* Connected Controls */}
                    {isConnected && (
                        <>
                            {/* Mic Toggle (Host/Speaker only) */}
                            {(isHost || isSpeaker) && (
                                <button
                                    onClick={onToggleMic}
                                    className={`p-2 rounded-full transition-all ${isAudioEnabled
                                        ? 'bg-white/10 hover:bg-white/20 text-white'
                                        : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
                                        }`}
                                    title={isAudioEnabled ? "Mute" : "Unmute"}
                                >
                                    {isAudioEnabled ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth={2} /></svg>
                                    )}
                                </button>
                            )}

                            {/* Raise Hand (Listener only) */}
                            {!isHost && !isSpeaker && (
                                <button
                                    onClick={onRaiseHand}
                                    className={`p-2 rounded-full transition-all ${handRaised
                                        ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30'
                                        : 'bg-white/10 hover:bg-white/20 text-white'
                                        }`}
                                    title={authenticated ? "Raise Hand" : "Login to Raise Hand"}
                                >
                                    <span className="text-sm">✋</span>
                                </button>
                            )}

                            {/* Host: DJ Console */}
                            {isHost && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowPlaylist(!showPlaylist)}
                                        className={`p-2 rounded-full transition-all ${showPlaylist || currentTrack
                                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                                            : 'bg-white/10 hover:bg-white/20 text-white/60'
                                            }`}
                                        title="DJ Console"
                                    >
                                        <span className="text-sm">🎵</span>
                                        {currentTrack && (
                                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]" />
                                        )}
                                    </button>

                                    {/* Playlist Dropdown */}
                                    <AnimatePresence>
                                        {showPlaylist && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                className="absolute top-full right-0 mt-3 w-72 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                                            >
                                                <div className="px-3 py-2 bg-white/5 border-b border-white/5 flex justify-between items-center">
                                                    <h3 className="text-xs font-bold text-white/80">DJ Playlist</h3>
                                                    {currentTrack && (
                                                        <span className="text-[10px] text-green-400 font-mono animate-pulse">NOW PLAYING</span>
                                                    )}
                                                </div>
                                                <div className="max-h-80 overflow-y-auto p-1">
                                                    {playlist.length === 0 ? (
                                                        <div className="p-4 text-center text-xs text-white/40 italic">
                                                            No tracks found. Upload music to start DJing! 🎧
                                                        </div>
                                                    ) : (
                                                        playlist.map((track, idx) => {
                                                            const isPlaying = currentTrack === track.audioUrl;
                                                            return (
                                                                <div key={idx} className={`flex items-center justify-between p-2 rounded-lg transition-colors ${isPlaying ? 'bg-purple-500/10 border border-purple-500/20' : 'hover:bg-white/5'}`}>
                                                                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                                        <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${isPlaying ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/40'}`}>
                                                                            {isPlaying ? (
                                                                                <div className="flex items-end gap-[1px] h-3 pb-1">
                                                                                    <motion.div animate={{ height: [4, 8, 4] }} transition={{ duration: 0.5, repeat: Infinity }} className="w-[2px] bg-white" />
                                                                                    <motion.div animate={{ height: [6, 10, 5] }} transition={{ duration: 0.4, repeat: Infinity, delay: 0.1 }} className="w-[2px] bg-white" />
                                                                                    <motion.div animate={{ height: [3, 7, 3] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-[2px] bg-white" />
                                                                                </div>
                                                                            ) : (
                                                                                idx + 1
                                                                            )}
                                                                        </div>
                                                                        <span className={`text-xs truncate ${isPlaying ? 'text-purple-300 font-medium' : 'text-white/80'}`}>{track.name}</span>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => isPlaying ? onStopTrack() : onPlayTrack(track.audioUrl)}
                                                                        className={`p-1.5 rounded transition-colors ${isPlaying ? 'bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white' : 'bg-white/10 hover:bg-white/20 text-white/60 hover:text-white'}`}
                                                                    >
                                                                        {isPlaying ? (
                                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                                                        ) : (
                                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Host: Active Speakers Management */}
                            {isHost && activeSpeakers.length > 0 && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowSpeakers(!showSpeakers)}
                                        className={`p-2 rounded-full transition-all ${showSpeakers
                                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                                            : 'bg-white/10 hover:bg-white/20 text-white/60'
                                            }`}
                                        title="Manage Speakers"
                                    >
                                        <span className="text-sm">🎙️</span>
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-black">
                                            {activeSpeakers.length}
                                        </span>
                                    </button>

                                    {/* Speakers Dropdown */}
                                    <AnimatePresence>
                                        {showSpeakers && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                className="absolute top-full right-0 mt-3 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                                            >
                                                <div className="px-3 py-2 bg-white/5 border-b border-white/5">
                                                    <h3 className="text-xs font-bold text-white/80">Active Speakers</h3>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto p-1">
                                                    {activeSpeakers.map((peer) => (
                                                        <div key={peer.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                                                                    {peer.name?.[0] || '?'}
                                                                </div>
                                                                <span className="text-xs text-white truncate">{peer.name || 'Unknown'}</span>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={() => onMutePeer(peer.id)}
                                                                    className="p-1.5 bg-white/10 hover:bg-white/20 text-white/60 hover:text-white rounded transition-colors"
                                                                    title="Mute"
                                                                >
                                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth={2} /></svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => onRemoveSpeaker(peer.id)}
                                                                    className="p-1.5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded transition-colors"
                                                                    title="Remove Speaker"
                                                                >
                                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Host: Pin Tweet */}
                            {isHost && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowPinInput(!showPinInput)}
                                        className={`p-2 rounded-full transition-all ${showPinInput || pinnedLink
                                            ? 'bg-blue-400/20 text-blue-400 border border-blue-400/50'
                                            : 'bg-white/10 hover:bg-white/20 text-white/60'
                                            }`}
                                        title="Pin Tweet"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                    </button>

                                    {/* Pin Input Dropdown */}
                                    <AnimatePresence>
                                        {showPinInput && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                className="absolute top-full right-0 mt-3 w-80 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden p-3"
                                            >
                                                <h3 className="text-xs font-bold text-white/80 mb-2">Pin a Tweet</h3>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={tweetUrl}
                                                        onChange={(e) => setTweetUrl(e.target.value)}
                                                        placeholder="Paste tweet URL..."
                                                        className="flex-1 bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            onPinTweet(tweetUrl);
                                                            setShowPinInput(false);
                                                            setTweetUrl('');
                                                        }}
                                                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-colors"
                                                    >
                                                        Pin
                                                    </button>
                                                </div>
                                                {pinnedLink && (
                                                    <button
                                                        onClick={() => {
                                                            onPinTweet(''); // Unpin
                                                            setShowPinInput(false);
                                                        }}
                                                        className="mt-2 w-full py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded transition-colors"
                                                    >
                                                        Unpin Current Tweet
                                                    </button>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Host: Speaker Requests */}
                            {isHost && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowRequests(!showRequests)}
                                        className={`p-2 rounded-full transition-all ${speakerRequests.length > 0
                                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/50'
                                            : 'bg-white/10 hover:bg-white/20 text-white/40'
                                            }`}
                                    >
                                        <span className="text-sm">👥</span>
                                        {speakerRequests.length > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-black">
                                                {speakerRequests.length}
                                            </span>
                                        )}
                                    </button>

                                    {/* Requests Dropdown */}
                                    <AnimatePresence>
                                        {showRequests && speakerRequests.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                className="absolute top-full right-0 mt-3 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                                            >
                                                <div className="px-3 py-2 bg-white/5 border-b border-white/5">
                                                    <h3 className="text-xs font-bold text-white/80">Speaker Requests</h3>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto p-1">
                                                    {speakerRequests.map((req) => (
                                                        <div key={req.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                                                                    {req.userName[0]}
                                                                </div>
                                                                <span className="text-xs text-white truncate">{req.userName}</span>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={() => onApproveRequest(req)}
                                                                    className="p-1.5 bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white rounded transition-colors"
                                                                >
                                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => onDenyRequest(req)}
                                                                    className="p-1.5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded transition-colors"
                                                                >
                                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Leave / End Button */}
                            <button
                                onClick={isHost ? onEndRoom : onLeave}
                                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-full text-xs font-bold transition-all"
                            >
                                {isHost ? 'End Space' : 'Leave'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
