'use client';

import { useEffect, useState } from 'react';
import { Room, subscribeToLiveRooms } from '@/services/db/rooms.db';

interface RoomListProps {
    onJoinRoom: (room: Room) => void;
    currentUserId?: string;
    authenticated: boolean;
}

export function RoomList({ onJoinRoom, currentUserId, authenticated, onHostRoom }: RoomListProps & { onHostRoom?: () => void }) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToLiveRooms((liveRooms) => {
            setRooms(liveRooms);
            setLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-foreground">Live Rooms</h2>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="bg-card/50 border border-border rounded-2xl p-6 animate-pulse"
                        >
                            <div className="h-6 bg-muted rounded-lg w-3/4 mb-3" />
                            <div className="h-4 bg-muted rounded-lg w-full mb-2" />
                            <div className="h-4 bg-muted rounded-lg w-2/3" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (rooms.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-foreground">Live Rooms</h2>
                        <span className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground font-medium">
                            0 live
                        </span>
                    </div>
                    {authenticated && onHostRoom && (
                        <button
                            onClick={onHostRoom}
                            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/20 flex items-center gap-2"
                        >
                            <span>+</span>
                            Host Room
                        </button>
                    )}
                </div>
                <div className="bg-card/30 border border-dashed border-border rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                        <span className="text-3xl">🎙️</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No live rooms yet</h3>
                    <p className="text-sm text-muted-foreground">
                        Be the first to start a conversation
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-foreground">Live Rooms</h2>
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/20 rounded-full text-sm text-purple-300 font-medium">
                        {rooms.length} live
                    </span>
                </div>
                {authenticated && onHostRoom && (
                    <button
                        onClick={onHostRoom}
                        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/20 flex items-center gap-2"
                    >
                        <span>+</span>
                        Host Room
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map((room) => (
                    <RoomCard
                        key={room.id}
                        room={room}
                        onJoin={() => onJoinRoom(room)}
                        isOwnRoom={room.hostId === currentUserId}
                    />
                ))}
            </div>
        </div>
    );
}

interface RoomCardProps {
    room: Room;
    onJoin: () => void;
    isOwnRoom: boolean;
}

function RoomCard({ room, onJoin, isOwnRoom }: RoomCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="group bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onJoin}
        >
            {/* Live Indicator */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                    </div>
                    <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">
                        Live
                    </span>
                </div>
                {isOwnRoom && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-md">
                        Your Room
                    </span>
                )}
            </div>

            {/* Room Info */}
            <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                    {room.title}
                </h3>
                {room.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {room.description}
                    </p>
                )}
            </div>

            {/* Host Info */}
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-semibold">
                    {room.hostName[0]}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                        {room.hostName}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                        @{room.hostUsername}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{room.participantCount}</span>
                    </div>
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-semibold transition-all ${isHovered
                    ? 'text-purple-400'
                    : 'text-muted-foreground'
                    }`}>
                    <span>{isOwnRoom ? 'Rejoin' : 'Join'}</span>
                    <svg
                        className={`w-4 h-4 transition-transform ${isHovered ? 'translate-x-1' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
