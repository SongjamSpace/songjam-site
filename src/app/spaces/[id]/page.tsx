'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StreamCall, StreamVideo, StreamVideoClient, type User, type Call } from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { MyUILayout } from '../MyUILayout';
import { useAuth } from '@/components/providers';
import { getRoomById, updateRoomStatus, incrementParticipantCount, Room } from '@/services/db/rooms.db';
import { createStreamUser, cleanupStreamClient } from '@/utils/stream.utils';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || '';

// Generate user token via server-side API
const generateUserToken = async (userId: string): Promise<string> => {
    try {
        const response = await fetch('/api/stream-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate token');
        }

        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error('Error generating token:', error);
        throw new Error('Failed to generate authentication token');
    }
};

export default function RoomPage() {
    const params = useParams();
    const router = useRouter();
    const roomId = params.id as string;

    const [client, setClient] = useState<StreamVideoClient | null>(null);
    const [call, setCall] = useState<Call | null>(null);
    const [room, setRoom] = useState<Room | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const { user, authenticated, twitterObj } = useAuth();

    useEffect(() => {
        const initRoom = async () => {
            try {
                setLoading(true);

                // 1. Fetch room details
                const roomData = await getRoomById(roomId);
                if (!roomData) {
                    throw new Error('Room not found');
                }
                setRoom(roomData);

                if (roomData.state === 'Ended') {
                    throw new Error('This room has ended');
                }

                // 2. Create stream user
                let streamUser: User;
                if (twitterObj && authenticated) {
                    streamUser = createStreamUser(twitterObj);
                } else {
                    // Create guest user
                    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    streamUser = {
                        id: guestId,
                        name: 'Guest Listener',
                        type: 'guest',
                    };
                }
                if (!streamUser.id) {
                    return alert('Failed to create stream user');
                }

                // 3. Initialize client
                const token = await generateUserToken(streamUser.id);
                const newClient = new StreamVideoClient({ apiKey, user: streamUser, token });
                const newCall = newClient.call('audio_room', roomData.streamCallId);

                // 4. Join call
                const isHost = authenticated && twitterObj?.twitterId === roomData.hostId;
                if (isHost) {
                    await newCall.join({
                        create: true,
                        data: {
                            members: [],
                            custom: {
                                title: roomData.title,
                                description: roomData.description,
                            },
                        },
                    });
                } else {
                    await newCall.join();
                    await incrementParticipantCount(roomId);
                }

                setClient(newClient);
                setCall(newCall);
            } catch (err) {
                console.error('Error initializing room:', err);
                setError(err instanceof Error ? err.message : 'Failed to join room');
            } finally {
                setLoading(false);
            }
        };

        if (roomId) {
            initRoom();
        }

        return () => {
            if (call) {
                call.leave().catch(console.error);
            }
            if (client) {
                cleanupStreamClient(client);
            }
        };
    }, [roomId, authenticated, twitterObj]); // Re-run if auth state changes? Maybe better to just run once on mount/roomId change. 
    // Actually, if user logs in while on the page, we might want to upgrade them. 
    // For now let's keep it simple: if they are already logged in, use that, else guest.

    const handleLeave = async () => {
        if (call) {
            await call.leave();
        }
        if (client) {
            await cleanupStreamClient(client);
        }

        // If host, end the room? Or just leave?
        // The requirement says "routes to that page... so even those not logged in can listen"
        // Usually host ending the room should be an explicit action or when they leave.
        // In the previous page.tsx, handleLeaveRoom did:
        // if (currentRoom && twitterObj && currentRoom.hostId === twitterObj.twitterId) { await updateRoomStatus(currentRoom.id, 'Ended'); }

        if (room && twitterObj && room.hostId === twitterObj.twitterId) {
            await updateRoomStatus(room.id, 'Ended');
        }

        router.push('/spaces');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-foreground">Loading room...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <div className="text-destructive text-xl">{error}</div>
                <button
                    onClick={() => router.push('/spaces')}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                    Back to Spaces
                </button>
            </div>
        );
    }

    if (!client || !call || !room) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="border-b border-border bg-card/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-foreground mb-1">{room.title}</h1>
                        {room.description && (
                            <p className="text-sm text-muted-foreground">{room.description}</p>
                        )}
                    </div>
                    <button
                        onClick={handleLeave}
                        className="px-6 py-2.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg font-medium transition-all duration-200 border border-destructive/20"
                    >
                        {room.hostId === twitterObj?.twitterId ? 'End Room' : 'Leave'}
                    </button>
                </div>
            </div>
            <div className="flex-1">
                <StreamVideo client={client}>
                    <StreamCall call={call}>
                        <MyUILayout />
                    </StreamCall>
                </StreamVideo>
            </div>
        </div>
    );
}
