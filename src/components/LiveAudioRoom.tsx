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
    MSRoom,
    SpeakerRequest,
    RoomParticipant,
    addPinnedLink,
    removePinnedLink,
    PinnedItem,
} from '@/services/db/msRooms.db';
import { getMusicUploadsByUserId } from '@/services/storage/dj.storage';
import MiniSpaceBanner from './MiniSpaceBanner';
import { Jumbotron } from './Jumbotron';
import { motion, AnimatePresence } from 'framer-motion';

const getStableSpeakerPosition = (userId: string) => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Distribute speakers on the sides or top, avoiding the center card area
    // Center card is roughly 30% - 70% width, 20% - 80% height depending on screen
    // We will place speakers in:
    // Zone 1 (Left): X = 5-25%
    // Zone 2 (Right): X = 75-95%
    // Zone 3 (Top): X = 25-75%, Y = 5-20%

    const zone = Math.abs(hash) % 3;
    let x, y;

    if (zone === 0) {
        // Left
        x = 5 + (Math.abs(hash >> 2) % 20); // 5% - 25%
        y = 15 + (Math.abs(hash >> 4) % 60); // 15% - 75%
    } else if (zone === 1) {
        // Right
        x = 75 + (Math.abs(hash >> 2) % 20); // 75% - 95%
        y = 15 + (Math.abs(hash >> 4) % 60); // 15% - 75%
    } else {
        // Top
        x = 25 + (Math.abs(hash >> 2) % 50); // 25% - 75%
        y = 5 + (Math.abs(hash >> 4) % 15); // 5% - 20%
    }

    return { x, y };
};

const ParticipantBubble = ({
    participant,
    isHost,
    isSpeaker,
    isActiveSpeaker,
    isSpeaking,
    targetPosition
}: {
    participant: RoomParticipant;
    isHost: boolean;
    isSpeaker: boolean;
    isActiveSpeaker: boolean;
    isSpeaking?: boolean;
    targetPosition?: { x: number; y: number };
}) => {
    // Memoize random values with a "safe zone" logic for listeners
    const randomValues = useMemo(() => {
        // Generate a random angle and distance for "orbiting"
        const angle = Math.random() * Math.PI * 2;
        // Minimum distance of 15% from center, max 40%
        const distance = 15 + Math.random() * 25;

        // Calculate offset in %
        const xOffset = Math.cos(angle) * distance * 1.5; // Stretch X for landscape aspect ratio
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
            className="absolute flex flex-col items-center justify-center pointer-events-auto cursor-pointer"
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

            {/* Name Label */}
            {!isHost && !isSpeaker ? null : (
                <div className={`mt-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white font-semibold tracking-wide shadow-xl 
                    ${isHost ? 'mt-4 text-sm' : 'text-xs'}
                 `}>
                    {participant.userName}
                </div>
            )}

            {/* Speaking Indicator */}
            {isSpeaking && (isHost || isSpeaker) && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 bg-emerald-500/90 rounded-full text-white text-[10px] font-bold tracking-wider uppercase shadow-lg whitespace-nowrap z-50">
                    Speaking...
                </div>
            )}
        </motion.div>
    );
};

const LiveAudioRoomInner = ({ projectId }: { projectId: string }) => {
    const hmsActions = useHMSActions();
    const isConnected = useHMSStore(selectIsConnectedToRoom);
    const peers = useHMSStore(selectPeers);
    const localPeer = useHMSStore(selectLocalPeer);
    const isAudioEnabled = useHMSStore(selectIsPeerAudioEnabled(localPeer?.id || ''));
    const dominantSpeaker = useHMSStore(selectDominantSpeaker);
    const { user, authenticated, login, twitterObj } = useAuth();
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

    // Role Update Sync Logic
    useEffect(() => {
        if (!firestoreRoomId || !isConnected || !localPeer?.roleName) return;

        const userId = twitterObj?.twitterId || user?.uid;
        if (!userId) return;

        let role: 'host' | 'speaker' | 'listener' = 'listener';
        if (isHostUser) role = 'host';
        else if (localPeer.roleName.toLowerCase() === 'speaker') role = 'speaker';

        // Update role in Firestore without leaving the room
        updateParticipantRole(firestoreRoomId, userId, role);

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
            if (isHost && (twitterObj?.twitterId || user?.uid)) {
                try {
                    const tracks = await getMusicUploadsByUserId(twitterObj?.twitterId || user?.uid || '');
                    setPlaylist(tracks);
                } catch (error) {
                    console.error('Failed to fetch playlist', error);
                }
            }
        };
        fetchPlaylist();
    }, [isHost, twitterObj?.twitterId, user?.uid]);

    // Cleanup audio on unmount or leave
    useEffect(() => {
        return () => {
            if (audioElement) {
                audioElement.pause();
                audioElement.src = '';
            }
        };
    }, [audioElement]);

    const handleGoLive = async () => {
        if (!authenticated) {
            login();
            return;
        }
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
        // if (projectId !== userName.toLowerCase()) {
        //     alert(`Mindshare space can only be hosted by the creator: @${projectId}`);
        //     return;
        // }
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
            const userId = twitterObj?.twitterId || user?.uid;

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

            if (token) {
                await hmsActions.join({
                    userName: twitterObj?.name || twitterObj?.username || user?.displayName || 'Listener',
                    authToken: token,
                });
            }
        } catch (error) {
            console.error('Failed to join room', error);
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
            // Otherwise, add a new request
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
            }
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
                    await hmsActions.leave();
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
        }
    };

    const handlePinTweet = async (item: PinnedItem) => {
        if (!firestoreRoomId || !isHost) return;
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
            {activeRoom?.pinnedLinks?.length && <Jumbotron
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
                            />
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Main UI Layer */}
            <div className="relative z-10 pointer-events-auto flex justify-center p-4">
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
                            onPinTweet={handlePinTweet}
                            pinnedLink={activeRoom?.pinnedLink}
                        />
                    </div>
                </div>
            </div>

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
