'use client';


import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
    HMSRoomProvider,
    useHMSActions,
    useHMSStore,
    selectIsConnectedToRoom,
    selectPeers,
    selectIsPeerAudioEnabled,
    selectLocalPeer,
    selectRoomState,
    selectDominantSpeaker,
    HMSRoomState,
    useTranscript,
    selectIsTranscriptionEnabled,
    HMSTranscriptionMode,
    HMSTranscript,
    selectHMSMessages,
    selectRoom,
} from '@100mslive/react-sdk';
import { useAuth } from '@/components/providers';

// import { useNeynarContext } from "@neynar/react";
import {
    subscribeToActiveRoom,
    createMSRoom,
    endMSRoom,
    addSpeakerRequest,
    subscribeToSpeakerRequests,
    updateSpeakerRequestStatus,
    deleteSpeakerRequest,
    updateSpeakerRequestPeerId,
    joinRoom,
    leaveRoom,
    subscribeToRoomParticipants,
    updateParticipantRole,
    addPinnedLink,
    removePinnedLink,
    PinnedItem,
    updateRoomMusicStatus,
    addSpeakerToRoom,
    SpeakerDetails,
    RoomParticipant,
    SpeakerRequest,
    MSRoom,
} from '@/services/db/msRooms.db';
import { getMusicUploadsByUserId } from '@/services/storage/dj.storage';
import MiniSpaceBanner from './MiniSpaceBanner';
import { Jumbotron } from './Jumbotron';
import { motion, AnimatePresence } from 'framer-motion';
import DevicePreviewModal from './DevicePreviewModal';
import { useSpacePoints } from '@/hooks/useSpacePoints';

const getStableSpeakerPosition = (userId: string) => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate angle from hash (0 to 360 degrees)
    const angle = (Math.abs(hash) % 360) * (Math.PI / 180);

    // Distance from host: Base 16% + 0-10% variation
    // This keeps them relatively close (16-26% away)
    const distance = 16 + (Math.abs(hash >> 4) % 10);

    // Stretch X axis slightly for landscape view (1.3x)
    const xOffset = Math.cos(angle) * distance * 1.3;
    const yOffset = Math.sin(angle) * distance;

    let x = 50 + xOffset;
    let y = 35 + yOffset;

    // Clamp X to avoid Jumbotron on the right (max 70%)
    // And keep off the far left edge (min 5%)
    x = Math.max(5, Math.min(70, x));

    // Clamp Y to keep within reasonable vertical bounds
    y = Math.max(10, Math.min(80, y));

    return { x, y };
};

const ReactionBurst = ({ emoji }: { emoji: string }) => {
    // Generate ~8 particles with random directions
    const particles = useMemo(() => {
        return Array.from({ length: 8 }).map((_, i) => {
            const angle = (Math.PI * 2 * i) / 8; // Uniform distribution
            // Add some randomness to spread
            const spreadAngle = angle + (Math.random() - 0.5) * 0.5;
            const distance = 60 + Math.random() * 60; // 60-120px burst radius (increased)
            return {
                x: Math.cos(spreadAngle) * distance,
                y: Math.sin(spreadAngle) * distance,
                scale: 0.5 + Math.random() * 1.0, // Increased scale variation
                rotation: (Math.random() - 0.5) * 60
            };
        });
    }, []);

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[100]">
            {particles.map((p, i) => (
                <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                    animate={{
                        x: p.x,
                        y: p.y,
                        opacity: [0, 1, 1, 0],
                        scale: [0, p.scale, p.scale * 0.8],
                        rotate: p.rotation
                    }}
                    transition={{
                        duration: 3, // Increased from 1.5s
                        ease: "easeOut",
                        times: [0, 0.1, 0.6, 1]
                    }}
                    className="absolute text-4xl" // Increased from text-2xl
                >
                    {emoji}
                </motion.div>
            ))}
        </div>
    );
};

const ParticipantBubble = ({
    participant,
    isHost,
    isSpeaker,
    isActiveSpeaker,
    isSpeaking,
    targetPosition,
    reaction
}: {
    participant: RoomParticipant;
    isHost: boolean;
    isSpeaker: boolean;
    isActiveSpeaker: boolean;
    isSpeaking?: boolean;
    targetPosition?: { x: number; y: number };
    reaction?: { content: string; timestamp: number } | null;
}) => {
    // Memoize random values with a "safe zone" logic for listeners
    const randomValues = useMemo(() => {
        // Generate a random angle and distance for "orbiting"
        const angle = Math.random() * Math.PI * 2;
        // Minimum distance of 30% from center, max 45% (Increased buffer to prevent overlap with jumbo host bubble)
        const distance = 30 + Math.random() * 15;

        // Calculate offset in %
        const xOffset = Math.cos(angle) * distance * 1.3; // Slightly increased horizontal stretch back to 1.3
        const yOffset = Math.sin(angle) * distance;

        return {
            duration: 8 + Math.random() * 10, // Faster: 8-18s (was 15-30s)
            delay: Math.random() * 2,
            initialOffset: { x: xOffset, y: yOffset },
            // Jitter for the "roaming" effect - Increased range
            roamX: (Math.random() - 0.5) * 200, // Increased from 50 to 200
            roamY: (Math.random() - 0.5) * 200  // Increased from 50 to 200
        };
    }, []);

    // Determine target coordinates based on role
    let finalX = '50%';
    let finalY = '35%';
    let animateProps = {};
    let transitionProps = {};

    if (isHost) {
        finalX = '50%';
        finalY = '35%';
        animateProps = {
            scale: isActiveSpeaker ? 1.2 : 1,
            zIndex: 30, // Host is behind HUD but above listeners? Adjust if needed.
            x: 0,
            y: 0
        };
        transitionProps = {
            scale: { duration: 0.5 }
        };
    } else if (isSpeaker) {
        const pos = getStableSpeakerPosition(participant.userId);
        finalX = `${pos.x}%`;
        finalY = `${pos.y}%`;
        animateProps = {
            scale: isActiveSpeaker ? 1.15 : 1,
            zIndex: 50, // High z-index to ensure visibility above other elements
            x: 0, // Reset any roaming x
            y: isActiveSpeaker ? -10 : 0, // Simple lift
        };
        transitionProps = {
            y: { duration: 0.5, ease: "easeInOut" },
            x: { duration: 0.5 }
        };

        // Optional: Add a gentle hover for speakers if needed, but keeping it simple first to fix visibility
        if (isActiveSpeaker) {
            // If we really want the bounce, we can add it back later, but let's stabilize first.
            // Actually, a simple y-repeat works better in transition than array in animate for this specific bug.
            animateProps = { ...animateProps, y: -10 };
            transitionProps = { ...transitionProps, y: { repeat: Infinity, repeatType: 'reverse', duration: 0.8 } };
        }

    } else {
        // Listener
        // Target position (active speaker) + Orbit offset
        const tx = targetPosition ? targetPosition.x : 50;
        const ty = targetPosition ? targetPosition.y : 35;

        finalX = `${Math.max(5, Math.min(95, tx + randomValues.initialOffset.x))}%`;
        finalY = `${Math.max(5, Math.min(95, ty + randomValues.initialOffset.y))}%`;

        animateProps = {
            scale: [0.8, 1, 0.8], // Gentle pulse
            zIndex: 10,
            // Continuous roaming
            x: [0, randomValues.roamX, 0],
            y: [0, randomValues.roamY, 0],
        };
        transitionProps = {
            scale: { repeat: Infinity, duration: 4, ease: "easeInOut" },
            x: { repeat: Infinity, duration: randomValues.duration, ease: "easeInOut", repeatType: "mirror" },
            y: { repeat: Infinity, duration: randomValues.duration, ease: "easeInOut", repeatType: "mirror" },
        };
    }

    return (
        <motion.div
            className="absolute flex flex-col items-center justify-center pointer-events-auto cursor-pointer group"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: 1, // Always enforce opacity 1
                left: finalX,
                top: finalY,
                ...animateProps
            }}
            // Removed exit animation to prevent accidental disappearances during role switches
            // exit={{ opacity: 0, scale: 0 }} 
            transition={{
                left: { duration: 2, ease: "easeInOut" },
                top: { duration: 2, ease: "easeInOut" },
                default: { duration: 0.5 },
                ...transitionProps
            }}
            style={{ x: '-50%', y: '-50%' }} // Center the element on its coordinate
        >
            {/* Inner Content - changes based on role but keeps structure roughly similar */}

            {/* Host Aura */}
            {isHost && (
                <>
                    <motion.div
                        className={`absolute inset-0 rounded-full ${isActiveSpeaker ? 'bg-cyan-500/40' : 'bg-purple-500/20'} blur-xl`}
                        animate={{
                            scale: isActiveSpeaker ? [1, 1.8, 1] : [1, 1.5, 1],
                            opacity: isActiveSpeaker ? [0.4, 0.8, 0.4] : [0.3, 0.6, 0.3]
                        }}
                        transition={{ repeat: Infinity, duration: isActiveSpeaker ? 2 : 4, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute -inset-4 rounded-full border border-purple-500/30 border-dashed"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute -inset-2 rounded-full border border-cyan-500/30 border-dotted"
                        animate={{ rotate: -360 }}
                        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                    />
                </>
            )}

            {/* Speaker Glow */}
            {!isHost && isSpeaker && (
                <motion.div
                    className={`absolute -inset-1 bg-gradient-to-r ${isActiveSpeaker ? 'from-green-400 to-emerald-500' : 'from-cyan-400 to-blue-500'} rounded-full opacity-75 blur`}
                    animate={{
                        opacity: isActiveSpeaker ? [0.6, 1, 0.6] : 0.75,
                        scale: isActiveSpeaker ? 1.2 : 1
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                ></motion.div>
            )}

            {/* Listener Glow (faint) */}
            {!isHost && !isSpeaker && (
                <div className="absolute inset-0 bg-white/5 blur-md rounded-full"></div>
            )}

            {/* Avatar Container */}
            <div className={`relative rounded-full 
                ${isHost ? 'w-32 h-32 p-1' : isSpeaker ? 'w-20 h-20 p-0.5' : 'w-12 h-12 p-[1px]'}
                ${isHost ? `bg-gradient-to-br ${isActiveSpeaker ? 'from-cyan-400 via-blue-500 to-indigo-500' : 'from-purple-500 via-fuchsia-500 to-cyan-500'} shadow-[0_0_50px_rgba(168,85,247,0.6)]` : ''}
                ${!isHost && isSpeaker ? 'bg-black' : ''}
                ${!isHost && !isSpeaker ? 'bg-gradient-to-tr from-white/60 to-white/40 hover:from-purple-500/50 hover:to-cyan-500/50' : ''}
                transition-all duration-500
            `}>
                <div className={`w-full h-full rounded-full overflow-hidden 
                    ${isHost ? 'border-4 border-black bg-black' : ''}
                    ${!isHost && isSpeaker ? `border-2 ${isActiveSpeaker ? 'border-green-400' : 'border-cyan-400/50'} bg-gray-900` : ''}
                    ${!isHost && !isSpeaker ? 'bg-black/80 backdrop-blur-sm' : ''}
                    transition-all duration-500
                `}>
                    {participant.avatarUrl ? (
                        <img src={participant.avatarUrl} alt={participant.userName} className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center 
                            ${isHost ? 'bg-gradient-to-br from-gray-900 to-black text-white text-4xl font-bold' : ''}
                            ${!isHost && isSpeaker ? 'bg-gradient-to-br from-cyan-900 to-blue-900 text-white text-xl font-bold' : ''}
                            ${!isHost && !isSpeaker ? 'text-white text-[10px]' : ''}
                         `}>
                            {participant.userName.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Status Badges */}
                {isHost && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-full text-white text-[10px] font-bold tracking-widest uppercase shadow-lg border border-white/20 z-20">
                        HOST
                    </div>
                )}
                {!isHost && isSpeaker && (
                    <div className="absolute -right-1 -bottom-1 w-8 h-8 bg-black rounded-full flex items-center justify-center border border-gray-700 shadow-lg">
                        <span className="text-lg">🎤</span>
                    </div>
                )}
            </div>

            {/* Name Label - Show for everyone, but hover-only/absolute for listeners */}
            <div className={`px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white font-semibold tracking-wide shadow-xl 
                ${isHost ? 'mt-4 text-sm relative' : ''}
                ${!isHost && isSpeaker ? 'mt-2 text-xs relative' : ''}
                ${!isHost && !isSpeaker ? 'absolute top-full mt-2 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50' : ''}
             `}>
                {participant.userName}
            </div>

            {/* Speaking Indicator */}
            {isSpeaking && (isHost || isSpeaker) && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 bg-emerald-500/90 rounded-full text-white text-[10px] font-bold tracking-wider uppercase shadow-lg whitespace-nowrap z-50">
                    Speaking...
                </div>
            )}

            {/* Reaction Display */}
            <AnimatePresence mode="wait">
                {reaction && (
                    <>
                        {/* Check if simple emoji (1-2 chars usually) - rudimentary check */}
                        {/^\p{Extended_Pictographic}+$/u.test(reaction.content) || reaction.content.length <= 4 ? (
                            <ReactionBurst key={reaction.timestamp} emoji={reaction.content} />
                        ) : (
                            // Text Chip
                            <motion.div
                                key={reaction.timestamp}
                                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                                animate={{ opacity: 1, y: -15, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.5 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black px-2 py-1 rounded-full shadow-xl z-[100] whitespace-nowrap font-bold text-2xl border-2 border-black/10"
                            >
                                {reaction.content}
                                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-b-2 border-r-2 border-black/10"></div>
                            </motion.div>
                        )}
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const CaptionOverlay = () => {
    const [currentTranscript, setCurrentTranscript] = useState<any | null>(null);
    const peers = useHMSStore(selectPeers);
    const isConnected = useHMSStore(selectIsConnectedToRoom);

    // Clear on disconnect
    useEffect(() => {
        if (!isConnected) {
            setCurrentTranscript(null);
        }
    }, [isConnected]);

    useTranscript({
        onTranscript: (items: any[]) => {
            if (items.length > 0) {
                const latest = items[items.length - 1];
                setCurrentTranscript((prev: any) => {
                    if (prev?.transcript === latest.transcript && prev?.peer_id === latest.peer_id) {
                        return prev;
                    }
                    return latest;
                });
            }
        }
    });

    // Don't render anything if no transcript ever came, BUT
    // to avoid layout jump if we want a permanent placeholder, we could render empty.
    // However, user likely wants it to disappear if silence for a long time?
    // Current requirement: "seamless".
    // Let's keep it visible if we have data.
    if (!currentTranscript) return null;

    const peer = peers.find(p => p.id === currentTranscript.peer_id);
    const name = peer?.name || 'Unknown Speaker';

    return (
        <div className="fixed bottom-24 left-8 max-w-md w-full px-4 z-50 pointer-events-none">
            <div className="flex items-end justify-start min-h-[80px]">
                <motion.div
                    // Using peer_id as key ensures smooth updates for same speaker, 
                    // but triggers animation when speaker changes
                    key={currentTranscript.peer_id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    // Removed exit animation to prevent popping
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="bg-black/60 backdrop-blur-md px-5 py-3 rounded-xl text-white text-base font-medium text-left shadow-2xl border border-white/10 border-l-4 border-l-yellow-400"
                >
                    <span className="text-yellow-400 font-bold block text-xs mb-1 uppercase tracking-wide opacity-80">{name}</span>
                    <span className="leading-relaxed block">
                        {currentTranscript.transcript}
                    </span>
                </motion.div>
            </div>
        </div>
    );
};

const LiveAudioRoomInner = ({ projectId }: { projectId: string }) => {
    const hmsActions = useHMSActions();
    const isConnected = useHMSStore(selectIsConnectedToRoom);
    const peers = useHMSStore(selectPeers);
    const localPeer = useHMSStore(selectLocalPeer);
    const isAudioEnabled = useHMSStore(selectIsPeerAudioEnabled(localPeer?.id || ''));
    const dominantSpeaker = useHMSStore(selectDominantSpeaker);
    const messages = useHMSStore(selectHMSMessages);
    const { user, authenticated, login, twitterObj } = useAuth();

    const room = useHMSStore(selectRoom);
    const isRecordingOn = room?.recording?.server?.running || room?.recording?.browser?.running;
    // const { user: neynarUser, isAuthenticated } = useNeynarContext();
    // const authenticated = isAuthenticated;

    // // Map Neynar user to app user structure
    // const user = neynarUser ? {
    //     uid: neynarUser.fid.toString(),
    //     displayName: neynarUser.display_name,
    //     photoURL: neynarUser.pfp_url,
    // } : null;

    // const twitterObj = neynarUser ? {
    //     twitterId: neynarUser.fid.toString(),
    //     username: neynarUser.username,
    //     name: neynarUser.display_name,
    //     avatarUrl: neynarUser.pfp_url
    // } : null;

    // const login = () => {
    //     // Neynar auth is handled via the button, this is a no-op or we could prompt user
    //     console.log("Please use the Neynar login button");
    //     alert("Please use the Sign in with Neynar button");
    // };

    const [activeRoom, setActiveRoom] = useState<MSRoom | null>(null);
    const [speakerRequests, setSpeakerRequests] = useState<SpeakerRequest[]>([]);
    const [myRequestId, setMyRequestId] = useState<string | null>(null);
    const [firestoreRoomId, setFirestoreRoomId] = useState<string | null>(null);
    const [participants, setParticipants] = useState<RoomParticipant[]>([]);


    // Notification State
    const [notifications, setNotifications] = useState<{ id: string; userName: string; avatarUrl?: string }[]>([]);
    const prevParticipantsRef = useRef<RoomParticipant[]>([]);
    const prevSpeakerRequestsLengthRef = useRef<number>(0);



    // DJ Playlist State
    const [playlist, setPlaylist] = useState<{ name: string; audioUrl: string }[]>([]);
    const [currentTrack, setCurrentTrack] = useState<string | null>(null);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

    // Device Preview State
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewMode, setPreviewMode] = useState<'speaker-request' | 'go-live' | null>(null);
    const [pendingSpeakerSettings, setPendingSpeakerSettings] = useState<{ deviceId: string; isUnmuted: boolean } | null>(null);

    // Caption State
    const [showCaptions, setShowCaptions] = useState(false);

    // Reaction State
    const [activeReactions, setActiveReactions] = useState<Record<string, { content: string; timestamp: number }>>({});
    const reactionTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

    // Check if current user is the host of the active room
    // This handles the refresh case where user is logged in but not connected to 100ms yet
    const isHostUser = activeRoom?.hostId === (twitterObj?.twitterId || user?.uid);

    // Check if connected as host role
    const isConnectedHost = localPeer?.roleName?.toLowerCase() === 'host';

    // Effective host check: either connected as host OR is the host user (for re-join UI)
    const isHost = isConnectedHost || isHostUser;

    // Sound Effect for Speaker Requests
    useEffect(() => {
        if (isHost && speakerRequests.length > prevSpeakerRequestsLengthRef.current) {
            // Play sound
            const audio = new Audio('/sound.wav'); // Custom sound
            audio.volume = 0.5;
            audio.play().catch(e => console.error("Error playing notification sound:", e));
        }
        prevSpeakerRequestsLengthRef.current = speakerRequests.length;
    }, [speakerRequests.length, isHost]);

    // Speaking Logic for Points (Host or Speaker and is Dominant)
    const isSpeakingForPoints = (isHost && dominantSpeaker?.customerUserId === (twitterObj?.twitterId || user?.uid)) || (localPeer?.roleName === 'speaker' && dominantSpeaker?.customerUserId === (twitterObj?.twitterId || user?.uid));

    // Points System Integration
    const { sessionPoints } = useSpacePoints({
        userId: twitterObj?.twitterId || user?.uid,
        spaceId: firestoreRoomId || undefined,
        role: isHost ? 'host' : (localPeer?.roleName === 'speaker' ? 'speaker' : 'listener'),
        isSpeaking: isSpeakingForPoints,
        isConnected: isConnected
    });

    // Join Notifications Logic
    useEffect(() => {
        // Find new participants
        const newParticipants = participants.filter(p =>
            !prevParticipantsRef.current.some(prev => prev.id === p.id)
        );

        // Only show notifications if we are already connected and it's not the initial load
        // (Initial load usually brings in a batch, we might want to skip those or show them all? 
        // Let's skip initial batch to avoid spam on refresh)
        if (prevParticipantsRef.current.length > 0 && newParticipants.length > 0) {
            newParticipants.forEach(p => {
                // Don't notify for self
                if (p.userId === (twitterObj?.twitterId || user?.uid)) return;

                const notificationId = Math.random().toString(36).substring(7);
                const notification = {
                    id: notificationId,
                    userName: p.userName,
                    avatarUrl: p.avatarUrl || ''
                };

                setNotifications(prev => {
                    const updated = [...prev, notification];
                    // Keep only the last 10 notifications to prevent screen clutter
                    if (updated.length > 10) {
                        return updated.slice(10);
                    }
                    return updated;
                });

                // Auto-dismiss after 2 seconds
                setTimeout(() => {
                    setNotifications(prev => prev.filter(n => n.id !== notificationId));
                }, 2000);
            });
        }

        prevParticipantsRef.current = participants;
    }, [participants, twitterObj?.twitterId, user?.uid]);

    // Subscribe to active room from Firestore
    useEffect(() => {
        const unsubscribe = subscribeToActiveRoom(projectId, (room) => {
            setActiveRoom(room);
            if (room) {
                setFirestoreRoomId(room.id);
            } else {
                setFirestoreRoomId(null);
            }
        });

        return unsubscribe;
    }, [projectId]);

    // Subscribe to speaker requests if host
    useEffect(() => {
        if (!firestoreRoomId || !isHost) return;

        const unsubscribe = subscribeToSpeakerRequests(firestoreRoomId, (requests) => {
            setSpeakerRequests(requests);
        });

        return unsubscribe;
    }, [firestoreRoomId, isHost]);

    // Subscribe to participants
    useEffect(() => {
        if (!firestoreRoomId) {
            setParticipants([]);
            return;
        }

        const unsubscribe = subscribeToRoomParticipants(firestoreRoomId, (parts) => {
            setParticipants(parts);
        });

        return unsubscribe;
    }, [firestoreRoomId]);

    // Join/Leave room participant logic
    useEffect(() => {
        if (!firestoreRoomId) return;

        // Only add to Firestore if we are actually connected to the HMS room
        // This prevents auto-joining on page load/reload
        if (!isConnected) return;

        // Determine userId, userName, and avatarUrl based on authentication status
        if (!authenticated || (!twitterObj && !user)) return;

        const userId = twitterObj?.twitterId || user?.uid;
        const userName = twitterObj?.name || twitterObj?.username || user?.displayName || 'User';
        const avatarUrl = twitterObj?.username
            ? `https://unavatar.io/x/${twitterObj.username}`
            : (user?.photoURL || 'https://unavatar.io/x/songjamspace');

        if (!userId) return;

        // Determine initial role based on isHostUser
        let initialRole: 'host' | 'speaker' | 'listener' = 'listener';
        if (isHostUser) initialRole = 'host';
        // We do NOT use localPeer.roleName here to prevent re-triggering this effect on role change
        // We will rely on the role update effect below to sync the correct role if it differs

        // Join room
        joinRoom(firestoreRoomId, userId, userName, initialRole, avatarUrl);

        return () => {
            leaveRoom(firestoreRoomId, userId);
        };
        // Removed localPeer?.roleName from dependency array to prevent leave/join on role switch
    }, [firestoreRoomId, authenticated, twitterObj, user?.uid, isHostUser, isConnected]);

    // Role Update Sync Logic & Applying Pending Settings
    useEffect(() => {
        if (!firestoreRoomId || !isConnected || !localPeer?.roleName) return;

        const userId = twitterObj?.twitterId || user?.uid;
        if (!userId) return;

        let role: 'host' | 'speaker' | 'listener' = 'listener';
        if (isHostUser) role = 'host';
        else if (localPeer.roleName.toLowerCase() === 'speaker') role = 'speaker';

        // Update role in Firestore without leaving the room
        updateParticipantRole(firestoreRoomId, userId, role);

        // Apply pending speaker settings if I just became a speaker or host
        if ((role === 'speaker' || role === 'host') && pendingSpeakerSettings) {
            const applySettings = async () => {
                try {
                    console.log("Applying pending speaker settings:", pendingSpeakerSettings);
                    // Set device
                    await hmsActions.setAudioSettings({ deviceId: pendingSpeakerSettings.deviceId });

                    // Set Mute State (Unmute if requested)
                    // Note: Browser auto-play policies might block this if no user interaction, 
                    // but since they just clicked "Raise Hand" recently, it might work.
                    // safely attempt
                    await hmsActions.setLocalAudioEnabled(pendingSpeakerSettings.isUnmuted);
                } catch (err) {
                    console.error("Failed to apply speaker settings:", err);
                } finally {
                    setPendingSpeakerSettings(null); // Clear settings
                }
            };
            applySettings();
        }

    }, [localPeer?.roleName, firestoreRoomId, isConnected, twitterObj, user?.uid, isHostUser]);

    // Sync peer ID if I have a pending request and just joined/rejoined
    useEffect(() => {
        const syncPeerId = async () => {
            if (isConnected && activeRoom && localPeer && user) {
                // We don't know if we have a pending request easily without querying,
                // but we can blindly try to update it. It's cheap.
                await updateSpeakerRequestPeerId(
                    activeRoom.id,
                    twitterObj?.twitterId || user.uid,
                    localPeer.id
                );
            }
        };

        syncPeerId();
    }, [isConnected, activeRoom, localPeer?.id, user, twitterObj]);

    // Fetch Playlist for Host
    useEffect(() => {
        const fetchPlaylist = async () => {
            if (isHost && user?.uid) {
                try {
                    const tracks = await getMusicUploadsByUserId('ad849d39-c425-4172-9eb9-bc5006f397d7');
                    setPlaylist(tracks);
                } catch (error) {
                    console.error('Failed to fetch playlist', error);
                }
            }
        };
        fetchPlaylist();
    }, [isHost, user?.uid]);

    // Auto-disable captions if music is playing globally
    useEffect(() => {
        if (activeRoom?.isMusicPlaying) {
            setShowCaptions(false);
        }
    }, [activeRoom?.isMusicPlaying]);

    // Cleanup audio on unmount or leave
    useEffect(() => {
        return () => {
            if (audioElement) {
                audioElement.pause();
                audioElement.src = '';
            }
        };
    }, [audioElement]);

    // Handle incoming reactions
    useEffect(() => {
        if (messages && messages.length > 0) {
            const latest = messages[messages.length - 1];
            // Check for REACTION type
            if (latest.type === 'REACTION' && latest.sender && latest.message) {
                const senderPeer = peers.find(p => p.id === latest.sender);

                if (senderPeer?.customerUserId) {
                    const userId = senderPeer.customerUserId;
                    const text = latest.message;

                    // Update state
                    setActiveReactions(prev => ({ ...prev, [userId]: { content: text, timestamp: Date.now() } }));

                    // Clear existing timeout
                    if (reactionTimeouts.current[userId]) {
                        clearTimeout(reactionTimeouts.current[userId]);
                    }

                    // Set new timeout to clear after 5s
                    reactionTimeouts.current[userId] = setTimeout(() => {
                        setActiveReactions(prev => {
                            const next = { ...prev };
                            delete next[userId];
                            return next;
                        });
                    }, 5000);
                }
            }
        }
    }, [messages, peers]);

    const handleSendReaction = async (content: string) => {
        try {
            await hmsActions.sendBroadcastMessage(content, "REACTION");

            // Optimistically show for self since we might not receive our own broadcast
            if (localPeer?.customerUserId) {
                const userId = localPeer.customerUserId;
                setActiveReactions(prev => ({ ...prev, [userId]: { content, timestamp: Date.now() } }));

                if (reactionTimeouts.current[userId]) {
                    clearTimeout(reactionTimeouts.current[userId]);
                }

                reactionTimeouts.current[userId] = setTimeout(() => {
                    setActiveReactions(prev => {
                        const next = { ...prev };
                        delete next[userId];
                        return next;
                    });
                }, 5000);
            }
        } catch (err) {
            console.error("Failed to send reaction", err);
        }
    };

    const handleGoLive = async () => {
        if (!authenticated) {
            login();
            return;
        }
        // Show preview before joining
        setPreviewMode('go-live');
        setShowPreviewModal(true);
    };

    const executeGoLive = async () => {
        const userId = twitterObj?.twitterId;
        const userName = twitterObj?.username;
        if (!userId) {
            alert('No user ID found');
            return;
        }
        if (!userName) {
            alert('No user name found');
            return;
        }
        if (projectId !== userName.toLowerCase()) {
            alert(`Mindshare space can only be hosted by the creator: @${projectId}`);
            return;
        }
        try {
            // 1. Get token for host role

            const response = await fetch('/api/100ms/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'host', userId }),
            });

            const { token } = await response.json();

            if (!token) throw new Error('Failed to get token');

            // 2. Join 100ms room
            await hmsActions.join({
                userName: userName,
                authToken: token,
            });

            // 3. Create Firestore room record (only if not re-joining)
            // If we are re-joining, the room already exists in Firestore
            if (!activeRoom) {
                const msRoom = await createMSRoom(
                    projectId,
                    userId,
                    userName,
                    'genesis-room'
                );
                setFirestoreRoomId(msRoom.id);
            }
        } catch (error) {
            console.error('Failed to go live', error);
        }
    };

    const handleJoin = async () => {
        if (!activeRoom) return;

        if (!authenticated) {
            login();
            return;
        }

        // If I am the host user re-joining, join as host
        if (isHostUser) {
            await handleGoLive();
            return;
        }

        try {
            const userId = twitterObj?.twitterId;

            if (!userId) {
                console.error("No user ID found for fetching token");
                return;
            }

            const response = await fetch('/api/100ms/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'listener', userId }),
            });

            const { token } = await response.json();

            if (token && twitterObj?.username) {
                await hmsActions.join({
                    userName: twitterObj.username,
                    authToken: token,
                });
            }
        } catch (error) {
            console.error('Failed to join room', error);
        }
    };

    const confirmSpeakerRequest = async () => {
        if (!activeRoom || !localPeer) return;

        try {
            const userId = twitterObj?.twitterId || localPeer.customerUserId;
            if (!userId) {
                console.error("No user ID found for speaker request");
                return;
            }
            const request = await addSpeakerRequest(
                activeRoom.id,
                userId,
                twitterObj?.name || twitterObj?.username || localPeer.name,
                localPeer.id
            );
            setMyRequestId(request.id);
        } catch (error) {
            console.error('Failed to request speaker access', error);
            // Clear pending settings on failure
            setPendingSpeakerSettings(null);
        }
    };

    // Updated name to handle both flows or delegate
    const handleConfirmPreview = async (deviceId: string, isUnmuted: boolean) => {
        setPendingSpeakerSettings({ deviceId, isUnmuted });
        setShowPreviewModal(false);

        if (previewMode === 'go-live') {
            await executeGoLive();
        } else {
            // speaker-request
            await confirmSpeakerRequest();
        }

    };

    const handleRaiseHand = async () => {
        // Enforce login for raising hand
        if (!authenticated) {
            login();
            return;
        }

        if (!activeRoom || !localPeer) return;

        if (myRequestId) {
            // If already requested, cancel the request
            try {
                await deleteSpeakerRequest(activeRoom.id, myRequestId);
                setMyRequestId(null);
            } catch (error) {
                console.error('Failed to cancel request', error);
            }
        } else {
            // Show preview modal instead of requesting immediately
            setPreviewMode('speaker-request');
            setShowPreviewModal(true);
        }
    };

    const handleToggleMic = async () => {
        await hmsActions.setLocalAudioEnabled(!isAudioEnabled);
    };

    const handleLeave = async () => {
        await hmsActions.leave();
    };

    const handleEndRoom = async () => {
        if (window.confirm('Are you sure you want to end this space?')) {
            try {
                if (firestoreRoomId) {
                    await endMSRoom(firestoreRoomId);
                }
                if (isConnected) {
                    await hmsActions.endRoom(false, "Host ended the space");
                }
                setFirestoreRoomId(null);
            } catch (error) {
                console.error('Failed to end stream', error);
            }
        }
    };

    const handleApproveRequest = async (request: SpeakerRequest) => {
        if (!firestoreRoomId) return;
        try {
            console.log('Approving request for peer:', request.peerId);
            // Promote peer to speaker role in 100ms
            // force=true to change role immediately without asking user
            await hmsActions.changeRole(request.peerId, 'speaker', true);

            // Update participant role in Firestore
            await updateParticipantRole(firestoreRoomId, request.userId, 'speaker');

            // Update request status in Firestore
            await updateSpeakerRequestStatus(firestoreRoomId, request.id, 'approved');

            // Add speaker details to ms_rooms doc
            const speakerDetails: SpeakerDetails = {
                twitterId: request.userId, // Assuming userId is twitterId for now as per app convention
                username: request.userName, // Or fetch actual username if needed, but request has userName
                name: request.userName,
                uuid: request.userId,
            };

            // We might want to refine username/name from peers or other sources if request.userName is not enough,
            // but request.userName comes from addSpeakerRequest which uses twitterObj if available.
            await addSpeakerToRoom(firestoreRoomId, speakerDetails);

            // Delete the request
            await deleteSpeakerRequest(firestoreRoomId, request.id);
        } catch (error) {
            console.error('Failed to approve request:', error);
            // If error is "Peer not present", it means peerId is stale or user left
            // We should probably delete the request anyway or mark as failed
            if (error instanceof Error && error.message.includes('Peer not present')) {
                await deleteSpeakerRequest(firestoreRoomId, request.id);
            }
        }
    };

    const handleDenyRequest = async (request: SpeakerRequest) => {
        if (!firestoreRoomId) return;
        try {
            await deleteSpeakerRequest(firestoreRoomId, request.id);
        } catch (error) {
            console.error('Failed to deny request', error);
        }
    };

    // DJ Handlers
    const handlePlayTrack = async (url: string) => {
        try {
            // Stop current track if any
            if (audioElement) {
                audioElement.pause();
                audioElement.src = '';
            }

            const audio = new Audio(url);
            audio.crossOrigin = "anonymous";
            setAudioElement(audio);
            setCurrentTrack(url);
            setShowCaptions(false); // Disable CC locally immediately

            if (firestoreRoomId) {
                updateRoomMusicStatus(firestoreRoomId, true);
            }

            // Use Web Audio API for more robust stream capture
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContext();
            const source = audioContext.createMediaElementSource(audio);
            const destination = audioContext.createMediaStreamDestination();

            // Connect source to destination (for streaming) AND to speakers (so host can hear)
            source.connect(destination);
            source.connect(audioContext.destination);

            await audio.play();

            const stream = destination.stream;
            const audioTrack = stream.getAudioTracks()[0];

            if (audioTrack) {
                console.log('Adding auxiliary audio track to room...');
                // Use 'auxiliary' source to indicate this is background music/extra audio
                await hmsActions.addTrack(audioTrack, 'auxiliary');
            }

            // Handle track end
            audio.onended = () => {
                setCurrentTrack(null);
                // Cleanup
                audioContext.close();
                if (firestoreRoomId) {
                    updateRoomMusicStatus(firestoreRoomId, false);
                }
            };

        } catch (error) {
            console.error('Failed to play track', error);
        }
    };

    const handleStopTrack = async () => {
        if (audioElement) {
            audioElement.pause();
            setCurrentTrack(null);
            // Ideally remove track from HMS too, but for now pausing stops the audio stream
            if (firestoreRoomId) {
                await updateRoomMusicStatus(firestoreRoomId, false);
            }
        }
    };

    const handleToggleRecording = async () => {
        try {
            if (isRecordingOn) {
                if (window.confirm("Stop recording?")) {
                    await hmsActions.stopRTMPAndRecording();
                }
            } else {
                await hmsActions.startRTMPOrRecording({
                    record: true,
                });
            }
        } catch (err) {
            console.error("Failed to toggle recording", err);
        }
    };

    const handlePinTweet = async (item: PinnedItem) => {
        if (!firestoreRoomId) return;
        try {
            await addPinnedLink(firestoreRoomId, item);
        } catch (error) {
            console.error('Failed to pin tweet', error);
        }
    };

    const handleUnpinTweet = async (url: string) => {
        if (!firestoreRoomId || !isHost) return;
        try {
            await removePinnedLink(firestoreRoomId, url);
        } catch (error) {
            console.error('Failed to unpin tweet', error);
        }
    };


    const isSpeaker = localPeer?.roleName?.toLowerCase() === 'speaker';
    const role = isHost ? 'host' : (localPeer?.roleName === 'speaker' ? 'speaker' : 'listener');

    // Get all active speakers (excluding host if needed, but usually we want to see them)
    // Actually, we want to see everyone who is a speaker
    const activeSpeakers = peers.filter(p => p.roleName?.toLowerCase() === 'speaker' && !p.isLocal);

    // ... existing useEffects ...

    const handleMutePeer = async (peerId: string) => {
        try {
            const peer = peers.find(p => p.id === peerId);
            if (peer?.audioTrack) {
                await hmsActions.setRemoteTrackEnabled(peer.audioTrack, false);
            }
        } catch (error) {
            console.error('Failed to mute peer', error);
        }
    };

    const handleRemoveSpeaker = async (peerId: string) => {
        if (!firestoreRoomId) return;
        try {
            // Find the peer to get their userId
            const peer = peers.find(p => p.id === peerId);
            if (!peer) {
                console.error('Peer not found');
                return;
            }

            // Demote speaker to listener in 100ms
            await hmsActions.changeRole(peerId, 'listener', true);

            // Update participant role in Firestore
            const userId = peer.customerUserId || peer.id;
            await updateParticipantRole(firestoreRoomId, userId, 'listener');
        } catch (error) {
            console.error('Failed to remove speaker', error);
        }
    };

    return (
        <>
            {activeRoom && <Jumbotron
                pinnedLinks={activeRoom?.pinnedLinks || []}
                isHost={isHost}
                onUnpin={handleUnpinTweet}
                onPin={handlePinTweet}
                projectId={projectId}
                twitterId={twitterObj?.twitterId}
                twitterHandle={twitterObj?.username}
            />}

            {/* Floating Bubbles Layer */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <AnimatePresence>
                    {participants.map((participant) => {
                        const isParticipantHost = participant.role === 'host';
                        const isParticipantSpeaker = participant.role === 'speaker';

                        // Determine active speaker user ID
                        // If dominant speaker exists in HMS, use that ID
                        // Otherwise default to host ID if activeRoom exists
                        // Note: dominantSpeaker.customerUserId aligns with participant.userId
                        const activeSpeakerUserId = dominantSpeaker?.customerUserId || activeRoom?.hostId;



                        const isActiveSpeaker = participant.userId === activeSpeakerUserId;

                        // Check if actually speaking (audio level checks are internal to HMS but dominantSpeaker implies speaking)
                        const isSpeaking = dominantSpeaker?.customerUserId === participant.userId;

                        // Calculate target position for listeners
                        let targetPosition = { x: 50, y: 35 }; // Default to Host position
                        if (activeSpeakerUserId) {
                            if (activeSpeakerUserId === activeRoom?.hostId) {
                                targetPosition = { x: 50, y: 35 };
                            } else {
                                targetPosition = getStableSpeakerPosition(activeSpeakerUserId);
                            }
                        }

                        return (
                            <ParticipantBubble
                                key={participant.id}
                                participant={participant}
                                isHost={isParticipantHost}
                                isSpeaker={isParticipantSpeaker}
                                isActiveSpeaker={isActiveSpeaker}
                                isSpeaking={isSpeaking}
                                targetPosition={targetPosition}
                                reaction={activeReactions[participant.id]}
                            />
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Main UI Layer */}
            <div className="relative z-10 pointer-events-auto flex items-center justify-center gap-4 p-4">

                {/* Points Counter (Only for non-hosts when connected) */}
                <AnimatePresence>
                    {isConnected && !isHost && (
                        <motion.div
                            initial={{ opacity: 0, x: -20, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -20, scale: 0.8 }}
                            className="relative group rounded-2xl h-[58px]" // Match MiniSpaceBanner height approx
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 rounded-2xl blur opacity-50 group-hover:opacity-80 transition duration-500 animate-gradient-x"></div>
                            <div className="relative h-full px-6 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl border border-yellow-500/20 rounded-2xl shadow-2xl">
                                <div className="text-[10px] font-bold text-yellow-500/60 uppercase tracking-wider mb-0.5">SING POINTS</div>
                                <div className="flex items-end gap-1">
                                    <motion.span
                                        key={sessionPoints}
                                        initial={{ y: 5, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="text-2xl font-black text-white tabular-nums leading-none tracking-tight font-outfit"
                                    >
                                        {sessionPoints.toLocaleString()}
                                    </motion.span>
                                    {/* Show 2x when speaking, otherwise nothing */}
                                    {isSpeakingForPoints && (role === 'speaker') ? (
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.5, x: -5 }}
                                            animate={{ opacity: 1, scale: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.5, x: -5 }}
                                            className="text-xs font-bold text-orange-500 mb-0.5 bg-orange-500/20 px-1 rounded ml-1 animate-pulse"
                                        >
                                            2x 🔥
                                        </motion.span>
                                    ) : null}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="relative group rounded-2xl">
                    {/* Animated Gradient Border / Glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-x"></div>

                    {/* Content Container */}
                    <div className="relative bg-black rounded-2xl ring-1 ring-white/10">
                        <MiniSpaceBanner
                            isHost={isHost}
                            isSpeaker={isSpeaker}
                            isConnected={!!isConnected}
                            participantCount={(participants.length || 1) - 1} // Use participants from DB
                            activeRoom={activeRoom}
                            speakerRequests={speakerRequests}
                            activeSpeakers={activeSpeakers}
                            handRaised={!!myRequestId}
                            isAudioEnabled={isAudioEnabled}
                            authenticated={authenticated}
                            playlist={playlist}
                            sessionPoints={sessionPoints}
                            currentTrack={currentTrack}
                            onGoLive={handleGoLive}
                            onJoin={handleJoin}
                            onLeave={handleLeave}
                            onEndRoom={handleEndRoom}
                            onToggleMic={handleToggleMic}
                            onRaiseHand={handleRaiseHand}
                            onLogin={login}
                            onApproveRequest={handleApproveRequest}
                            onDenyRequest={handleDenyRequest}
                            onMutePeer={handleMutePeer}
                            onRemoveSpeaker={handleRemoveSpeaker}
                            onPlayTrack={handlePlayTrack}
                            onStopTrack={handleStopTrack}
                            showCaptions={showCaptions}
                            onSendReaction={handleSendReaction}
                            onMuteAll={async () => {
                                if (window.confirm("Are you sure you want to mute all speakers?")) {
                                    try {
                                        // Get all remote speakers
                                        const remoteSpeakers = peers.filter(p => !p.isLocal && p.roleName?.toLowerCase() === 'speaker');
                                        for (const speaker of remoteSpeakers) {
                                            if (speaker.audioTrack) {
                                                await hmsActions.setRemoteTrackEnabled(speaker.audioTrack, false);
                                            }
                                        }
                                    } catch (err) {
                                        console.error("Failed to mute all speakers", err);
                                    }
                                }
                            }}
                            isRecordingOn={!!isRecordingOn}
                            onToggleRecording={handleToggleRecording}
                            onToggleCaptions={async () => {
                                const nextState = !showCaptions;
                                setShowCaptions(nextState);

                                // Attempt to start transcription if Host enabling it
                                if (isHost && nextState) {
                                    try {
                                        // Use HMSTranscriptionMode enum
                                        await hmsActions.startTranscription({ mode: HMSTranscriptionMode.CAPTION });
                                        console.log("Transcription started by host");
                                    } catch (err) {
                                        console.error("Failed to start transcription", err);
                                        // Fallback if method differs in version
                                        try {
                                            // @ts-ignore
                                            if (hmsActions.startRealTimeTranscription) {
                                                // @ts-ignore
                                                await hmsActions.startRealTimeTranscription();
                                            }
                                        } catch (e) {
                                            console.error("Fallback transcription start failed", e);
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Captions Overlay */}
            <AnimatePresence>
                {showCaptions && <CaptionOverlay />}
            </AnimatePresence>

            {/* Join Notifications Snackbar */}
            {isHost && <div className="fixed bottom-4 right-4 z-50 flex flex-col justify-end gap-2 pointer-events-none">
                <AnimatePresence>
                    {notifications.map((notification) => (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-xl flex items-center gap-3 w-64 pointer-events-auto"
                        >
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                                {notification.avatarUrl ? (
                                    <img src={notification.avatarUrl} alt={notification.userName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 text-white text-xs font-bold">
                                        {notification.userName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white text-sm font-medium truncate">{notification.userName}</span>
                                <span className="text-white/50 text-xs">joined the space</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>}

            {/* Device Preview Modal */}
            <DevicePreviewModal
                isOpen={showPreviewModal}
                onClose={() => setShowPreviewModal(false)}
                onConfirm={handleConfirmPreview}
            />
        </>
    );
};

export default function LiveAudioRoom({ projectId }: { projectId: string }) {
    return (
        <HMSRoomProvider>
            <LiveAudioRoomInner projectId={projectId} />
        </HMSRoomProvider>
    );
}
