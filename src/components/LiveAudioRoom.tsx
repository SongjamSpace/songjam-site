'use client';

import React, { useEffect, useState } from 'react';
import {
    HMSRoomProvider,
    useHMSActions,
    useHMSStore,
    selectIsConnectedToRoom,
    selectPeers,
    selectIsPeerAudioEnabled,
    selectLocalPeer,
    selectRoomState,
    HMSRoomState,
} from '@100mslive/react-sdk';
import { useAuth } from '@/components/providers';
import {
    subscribeToActiveRoom,
    createMSRoom,
    endMSRoom,
    addSpeakerRequest,
    subscribeToSpeakerRequests,
    updateSpeakerRequestStatus,
    deleteSpeakerRequest,
    updateSpeakerRequestPeerId,
    MSRoom,
    SpeakerRequest,
} from '@/services/db/msRooms.db';
import { getMusicUploadsByUserId } from '@/services/storage/dj.storage';
import MiniSpaceBanner from './MiniSpaceBanner';

const LiveAudioRoomInner = () => {
    const hmsActions = useHMSActions();
    const isConnected = useHMSStore(selectIsConnectedToRoom);
    const peers = useHMSStore(selectPeers);
    const localPeer = useHMSStore(selectLocalPeer);
    const isAudioEnabled = useHMSStore(selectIsPeerAudioEnabled(localPeer?.id || ''));
    const { user, authenticated, login, twitterObj } = useAuth();

    const [activeRoom, setActiveRoom] = useState<MSRoom | null>(null);
    const [speakerRequests, setSpeakerRequests] = useState<SpeakerRequest[]>([]);
    const [myRequestId, setMyRequestId] = useState<string | null>(null);
    const [firestoreRoomId, setFirestoreRoomId] = useState<string | null>(null);

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

    // Subscribe to active room from Firestore
    useEffect(() => {
        const unsubscribe = subscribeToActiveRoom((room) => {
            setActiveRoom(room);
            if (room) {
                setFirestoreRoomId(room.id);
            } else {
                setFirestoreRoomId(null);
            }
        });

        return unsubscribe;
    }, []);

    // Subscribe to speaker requests if host
    useEffect(() => {
        if (!firestoreRoomId || !isHost) return;

        const unsubscribe = subscribeToSpeakerRequests(firestoreRoomId, (requests) => {
            setSpeakerRequests(requests);
        });

        return unsubscribe;
    }, [firestoreRoomId, isHost]);

    // Sync peer ID if I have a pending request and just joined/rejoined
    useEffect(() => {
        const syncPeerId = async () => {
            if (isConnected && activeRoom && localPeer && user) {
                // We don't know if we have a pending request easily without querying,
                // but we can blindly try to update it. It's cheap.
                await updateSpeakerRequestPeerId(
                    activeRoom.id,
                    twitterObj?.twitterId || user.uid || 'anonymous',
                    localPeer.id
                );

                // Also check if we have a request to set local state
                // This is a bit tricky since we don't subscribe to ALL requests as listener
                // But we can infer it if we want, or just rely on the button state which might be reset on refresh
                // For now, let's just ensure the backend is in sync.
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

        try {
            // 1. Get token for host role
            const userId = twitterObj?.twitterId || `host-${Math.random().toString(36).substring(2, 15)}`;

            const response = await fetch('/api/100ms/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'host', userId }),
            });

            const { token } = await response.json();

            if (!token) throw new Error('Failed to get token');

            // 2. Join 100ms room
            await hmsActions.join({
                userName: twitterObj?.name || twitterObj?.username || 'Host',
                authToken: token,
            });

            // 3. Create Firestore room record (only if not re-joining)
            // If we are re-joining, the room already exists in Firestore
            if (!activeRoom) {
                const msRoom = await createMSRoom(
                    userId,
                    twitterObj?.name || twitterObj?.username || 'Host',
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

        // If I am the host user re-joining, join as host
        if (isHostUser) {
            await handleGoLive();
            return;
        }

        try {
            const userId = twitterObj?.twitterId || `listener-${Math.random().toString(36).substring(2, 15)}`;

            const response = await fetch('/api/100ms/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'listener', userId }),
            });

            const { token } = await response.json();

            if (token) {
                await hmsActions.join({
                    userName: twitterObj?.name || twitterObj?.username || 'Listener',
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
                await deleteSpeakerRequest(myRequestId);
                setMyRequestId(null);
            } catch (error) {
                console.error('Failed to cancel request', error);
            }
        } else {
            // Otherwise, add a new request
            try {
                const request = await addSpeakerRequest(
                    activeRoom.id,
                    twitterObj?.twitterId || localPeer.customerUserId || 'anonymous',
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
        try {
            console.log('Approving request for peer:', request.peerId);
            // Promote peer to speaker role in 100ms
            // force=true to change role immediately without asking user
            await hmsActions.changeRole(request.peerId, 'speaker', true);

            // Update request status in Firestore
            await updateSpeakerRequestStatus(request.id, 'approved');

            // Delete the request
            await deleteSpeakerRequest(request.id);
        } catch (error) {
            console.error('Failed to approve request:', error);
            // If error is "Peer not present", it means peerId is stale or user left
            // We should probably delete the request anyway or mark as failed
            if (error instanceof Error && error.message.includes('Peer not present')) {
                await deleteSpeakerRequest(request.id);
            }
        }
    };

    const handleDenyRequest = async (request: SpeakerRequest) => {
        try {
            await deleteSpeakerRequest(request.id);
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
        try {
            await hmsActions.changeRole(peerId, 'listener', true);
        } catch (error) {
            console.error('Failed to remove speaker', error);
        }
    };

    return (
        <MiniSpaceBanner
            isHost={isHost}
            isSpeaker={isSpeaker}
            isConnected={!!isConnected}
            participantCount={peers.length}
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
        />
    );
};

export default function LiveAudioRoom() {
    return (
        <HMSRoomProvider>
            <LiveAudioRoomInner />
        </HMSRoomProvider>
    );
}
