'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MSRoom, SpeakerRequest } from '@/services/db/msRooms.db';
import {
    HMSPeer,
    useHMSStore,
    selectIsPeerAudioEnabled,
} from '@100mslive/react-sdk';
import { Mic, MicOff, X } from 'lucide-react';

const SpeakerRow = ({
    peer,
    onMutePeer,
    onRemoveSpeaker,
    currentTrack
}: {
    peer: HMSPeer;
    onMutePeer: (peerId: string) => void;
    onRemoveSpeaker: (peerId: string) => void;
    currentTrack: any;
}) => {
    const isAudioEnabled = useHMSStore(selectIsPeerAudioEnabled(peer.id));

    return (
        <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
            <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                    {/* Simple Avatar */}
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-[10px] font-bold text-white">
                        {peer.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                </div>
                <span className="text-xs text-white/80 font-medium truncate">
                    {peer.name} {peer.isLocal && '(You)'}
                </span>
            </div>
            <div className="flex items-center gap-1">
                {/* Mute Button */}
                <button
                    onClick={() => onMutePeer(peer.id)}
                    className={`p-1.5 hover:bg-white/10 rounded-full transition-colors ${!isAudioEnabled ? 'text-red-500' : 'text-white/60 hover:text-white'
                        }`}
                    title={isAudioEnabled ? "Mute Speaker" : "Speaker Muted"}
                >
                    {isAudioEnabled ? (
                        <Mic size={14} />
                    ) : (
                        <MicOff size={14} />
                    )}
                </button>
                {/* Remove Speaker Button */}
                <button
                    onClick={() => onRemoveSpeaker(peer.id)}
                    className="p-1.5 hover:bg-red-500/20 rounded-full text-white/40 hover:text-red-400 transition-colors"
                    title="Remove Speaker"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};

interface MiniSpaceBannerProps {
    isHost: boolean;
    isSpeaker: boolean;
    isConnected: boolean;
    participantCount: number;
    activeRoom: MSRoom | null;
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
    showCaptions: boolean;
    onToggleCaptions: () => void;
    onSendReaction?: (text: string) => void;
    onMuteAll?: () => void;
    isRecordingOn?: boolean;
    onToggleRecording?: () => void;
    sessionPoints?: number;
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
    showCaptions,
    onToggleCaptions,
    onSendReaction = () => { },
    onMuteAll,
    isRecordingOn = false,
    onToggleRecording,
    sessionPoints = 0
}: MiniSpaceBannerProps) {
    const [showRequests, setShowRequests] = React.useState(false);
    const [showSpeakers, setShowSpeakers] = React.useState(false);
    const [showPlaylist, setShowPlaylist] = React.useState(false);
    const [showReactions, setShowReactions] = React.useState(false);
    const [reactionText, setReactionText] = React.useState('');


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
            <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 pr-2 sm:pr-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-full shadow-2xl shadow-purple-500/10">

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Status Indicator / Avatar */}
                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                            src={`https://unavatar.io/x/${activeRoom?.hostName}`}
                            alt={activeRoom?.hostName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Fallback if image fails
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                        />
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
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                                <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                                LIVE
                            </span>
                        </div>
                        <div className="text-[10px] text-white/60 flex items-center gap-1 hidden sm:flex">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {participantCount} listening
                        </div>
                    </div>

                </div>

                {/* Vertical Divider */}
                <div className="w-px h-8 bg-white/10 mx-1 hidden sm:block" />

                {/* Controls */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start pt-2 sm:pt-0 border-t border-white/5 sm:border-0">

                    {/* Join Button (if not connected) */}
                    {!isConnected && (
                        <button
                            onClick={onJoin}
                            className="group relative px-6 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white rounded-full text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                            <span className="relative flex items-center gap-2">
                                <span>🎙️</span>
                                Join<span className="hidden sm:inline"> Space</span>
                            </span>
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
                                    title={authenticated ? "Request to Speak" : "Login to Raise Hand"}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <title>Request to Speak</title>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.5 6.5C22.5 7.5 22.5 10.5 21.5 11.5M19 8.5c.5.5.5 1.5 0 2" />
                                    </svg>
                                </button>
                            )}

                            {/* Reaction Button */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowReactions(!showReactions)}
                                    className={`p-2 rounded-full transition-all ${showReactions
                                        ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                                        : 'bg-white/10 hover:bg-white/20 text-white'
                                        }`}
                                    title="Send Reaction"
                                >
                                    <span className="text-sm">❤️</span>
                                </button>
                                <AnimatePresence>
                                    {showReactions && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            className="fixed top-24 left-1/2 -translate-x-1/2 sm:absolute sm:bottom-full sm:top-auto sm:left-1/2 sm:-translate-x-1/2 sm:mb-3 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[70] p-3 w-64"
                                        >
                                            <div className="grid grid-cols-5 gap-1 mb-3">
                                                {['😂', '😲', '😢', '💜', '💯', '👏', '✊', '👍', '👎', '👋'].map(emoji => (
                                                    <button
                                                        key={emoji}
                                                        onClick={() => {
                                                            onSendReaction(emoji);
                                                            setShowReactions(false);
                                                        }}
                                                        className="aspect-square bg-white/5 hover:bg-white/10 rounded-lg text-xl flex items-center justify-center transition-colors hover:scale-110 active:scale-95"
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                            <form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    if (reactionText.trim()) {
                                                        onSendReaction(reactionText.trim().slice(0, 40));
                                                        setReactionText('');
                                                        setShowReactions(false);
                                                    }
                                                }}
                                                className="flex gap-2"
                                            >
                                                <input
                                                    type="text"
                                                    value={reactionText}
                                                    onChange={(e) => setReactionText(e.target.value)}
                                                    placeholder="Say something..."
                                                    maxLength={40}
                                                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!reactionText.trim()}
                                                    className="px-3 bg-white text-black rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                                                >
                                                    Send
                                                </button>
                                            </form>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Caption Toggle */}
                            <button
                                onClick={onToggleCaptions}
                                className={`p-2 rounded-full transition-all ${showCaptions
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                    }`}
                                title={showCaptions ? "Hide Captions" : "Show Captions"}
                            >
                                <span className="text-sm font-bold">CC</span>
                            </button>

                            {/* Host: Recording Toggle */}
                            {/* {isHost && onToggleRecording && (
                                <button
                                    onClick={onToggleRecording}
                                    className={`p-2 rounded-full transition-all ${isRecordingOn
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-lg shadow-red-500/10'
                                        : 'bg-white/10 hover:bg-white/20 text-white'
                                        }`}
                                    title={isRecordingOn ? "Stop Recording" : "Start Recording"}
                                >
                                    <div className="flex items-center gap-1">
                                        <div className={`w-2 h-2 rounded-full ${isRecordingOn ? 'bg-red-500 animate-pulse' : 'bg-current'}`} />
                                        <span className="text-xs font-bold hidden sm:inline">{isRecordingOn ? 'REC' : 'REC'}</span>
                                    </div>
                                </button>
                            )} */}

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
                                                className="fixed top-24 left-2 right-2 sm:absolute sm:top-full sm:right-0 sm:left-auto sm:w-[450px] sm:mt-3 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[60]"
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
                                                className="fixed top-24 left-2 right-2 sm:absolute sm:top-full sm:right-0 sm:left-auto sm:w-[350px] sm:mt-3 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[60]"
                                            >
                                                <div className="px-3 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
                                                    <h3 className="text-xs font-bold text-white/80">Active Speakers</h3>
                                                    <div className="flex gap-2">
                                                        {onMuteAll && (
                                                            <button
                                                                onClick={onMuteAll}
                                                                className="px-2 py-0.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded text-[10px] font-bold transition-colors"
                                                                title="Mute All Speakers"
                                                            >
                                                                Mute All
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto p-1">
                                                    {activeSpeakers.map((peer) => (
                                                        <SpeakerRow
                                                            key={peer.id}
                                                            peer={peer}
                                                            onMutePeer={onMutePeer}
                                                            onRemoveSpeaker={onRemoveSpeaker}
                                                            currentTrack={currentTrack}
                                                        />
                                                    ))}
                                                </div>
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
                                                className="fixed top-24 left-2 right-2 sm:absolute sm:top-full sm:right-0 sm:left-auto sm:w-[350px] sm:mt-3 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[60]"
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
                                className="px-3 py-2 sm:py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-full text-xs font-bold transition-all flex items-center justify-center"
                                title={isHost ? 'End Space' : 'Leave Space'}
                            >
                                <span className="hidden sm:inline">{isHost ? 'End Space' : 'Leave'}</span>
                                <span className="sm:hidden">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
