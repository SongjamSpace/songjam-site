'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers';
import { HostRoomModal } from './HostRoomModal';
import { RoomList } from './RoomList';
import { createRoom, Room } from '@/services/db/rooms.db';
import { generateCallId } from '@/utils/stream.utils';



export default function Page() {
    const router = useRouter();
    const [showHostModal, setShowHostModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { ready, user, authenticated, twitterObj, login } = useAuth();

    const handleCreateRoom = async (title: string, description: string) => {
        if (!twitterObj || !authenticated) {
            throw new Error('You must be logged in to create a room');
        }

        try {
            setError(null);
            const streamCallId = generateCallId();

            const room = await createRoom({
                title,
                description,
                hostId: twitterObj.twitterId || '',
                hostName: twitterObj.name || 'Unknown',
                hostUsername: twitterObj.username || 'unknown',
                streamCallId,
            });

            // Redirect to the new room page
            router.push(`/spaces/${room.id}`);
        } catch (err) {
            console.error('Error creating room:', err);
            throw err;
        }
    };

    const handleJoinRoom = (room: Room) => {
        router.push(`/spaces/${room.id}`);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                <span className="text-xl">🎙️</span>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                    Songjam Voice
                                </h1>
                                <p className="text-muted-foreground text-sm mt-1">
                                    Connect, create, and collaborate in real-time audio spaces
                                </p>
                            </div>
                        </div>

                        {/* Sign in button in top right */}
                        {!authenticated ? (
                            <button
                                onClick={login}
                                className="px-6 py-2.5 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-500/20"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                </svg>
                                Sign in
                            </button>
                        ) : (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-semibold">
                                        {twitterObj?.name?.[0] || '?'}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-foreground">
                                            {twitterObj?.name || 'Unknown User'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            @{twitterObj?.username || 'unknown'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm mb-8">
                        {error}
                    </div>
                )}

                {/* Room List - Always visible */}
                <RoomList
                    onJoinRoom={handleJoinRoom}
                    currentUserId={twitterObj?.twitterId}
                    authenticated={authenticated}
                    onHostRoom={() => setShowHostModal(true)}
                />
            </div>

            {/* Host Room Modal */}
            <HostRoomModal
                isOpen={showHostModal}
                onClose={() => setShowHostModal(false)}
                onCreateRoom={handleCreateRoom}
            />
        </div>
    );
}