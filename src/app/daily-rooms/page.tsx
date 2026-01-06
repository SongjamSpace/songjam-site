
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers';
import { createDailyRoom, DailyRoom } from '@/services/db/dailyRooms.db'; 
import DailyIframe from '@daily-co/daily-js';
import { DailyProvider } from '@daily-co/daily-react';
import { DailyAudioRoom } from '@/components/DailyAudioRoom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'; 
import { db } from '@/services/firebase.service';

export default function DailyRoomsPage() {
    const router = useRouter();
    const [rooms, setRooms] = useState<DailyRoom[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { user, authenticated, twitterObj } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    
    // Active Room State
    const [activeRoom, setActiveRoom] = useState<DailyRoom | null>(null);
    const [dailyCallObject, setDailyCallObject] = useState<any>(null);
    const hasJoinedDaily = useRef(false);

    // Fetch Rooms
    useEffect(() => {
        const q = query(
            collection(db, 'daily_rooms'),
            where('state', '==', 'Live'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as DailyRoom[];
            setRooms(data);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleCreateRoom = async (title: string, description: string) => {
         if (!twitterObj || !authenticated) {
            alert('Please login to create a room');
            return;
        }

        try {
            // 1. Create Daily Room via API
            const res = await fetch('/api/daily/room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    properties: {
                        enable_chat: true,
                        start_audio_off: false,
                    }
                })
            });

            if (!res.ok) {
                throw new Error('Failed to create Daily room');
            }

            const dailyData = await res.json();
            const dailyRoomUrl = dailyData.url;

            // 2. Create Firestore Entry
            const room = await createDailyRoom({
                title,
                description,
                hostId: twitterObj.twitterId || '',
                hostName: twitterObj.name || 'Unknown',
                hostUsername: twitterObj.username || 'unknown',
                dailyRoomUrl: dailyRoomUrl,
            });

            // Join Immediately
            handleJoinRoom(room);
            setShowCreateModal(false);
        } catch (err) {
            console.error(err);
            alert('Failed to create room');
        }
    };
    
    const handleJoinRoom = async (room: DailyRoom) => {
        try {
            if (!room.dailyRoomUrl) {
                alert("Invalid room URL");
                return;
            }
            
            // Cleanup existing if any (host shouldn't join two)
            if (dailyCallObject) {
                 await dailyCallObject.leave();
                 dailyCallObject.destroy();
                 hasJoinedDaily.current = false;
            }

            // Initialize Daily
            const co = DailyIframe.createCallObject({
                url: room.dailyRoomUrl,
                audioSource: true,
                videoSource: false, 
            });
            
            setDailyCallObject(co);
            setActiveRoom(room);
            
            // Join logic
            if (!hasJoinedDaily.current && twitterObj) {
                 const userName = twitterObj.name || twitterObj.username || 'User';
                 const userData = { twitterId: twitterObj.twitterId, avatarUrl: '' }; 
                 
                 await co.join({ userName, userData });
                 hasJoinedDaily.current = true;
            } else if (!hasJoinedDaily.current && !authenticated) {
                 await co.join({ userName: 'Guest' });
                 hasJoinedDaily.current = true;
            }
        } catch(e) {
            console.error("Failed to join room", e);
            alert("Failed to join room");
            setActiveRoom(null);
        }
    };
    
    const handleLeaveRoom = async () => {
        if (dailyCallObject) {
            await dailyCallObject.leave();
            dailyCallObject.destroy();
        }
        setDailyCallObject(null);
        setActiveRoom(null);
        hasJoinedDaily.current = false;
    };


    // If Active Room, specific UI
    if (activeRoom && dailyCallObject) {
        return (
             <DailyProvider callObject={dailyCallObject}>
                <DailyAudioRoom room={activeRoom} onLeave={handleLeaveRoom} />
            </DailyProvider>
        );
    }


    // Listing UI
    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Daily Audio Rooms</h1>
                        <p className="text-gray-400">Experimental High-Fidelity Audio Spaces</p>
                    </div>
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold"
                    >
                        + Create Room
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center py-20 text-gray-500">Loading spaces...</div>
                ) : rooms.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900 rounded-xl border border-gray-800">
                        <h3 className="text-xl font-bold text-gray-300 mb-2">No Active Rooms</h3>
                        <p className="text-gray-500">Be the first to start a conversation!</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {rooms.map(room => (
                            <div key={room.id} className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-colors flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">{room.title}</h3>
                                    <p className="text-gray-400 text-sm mb-3">{room.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="bg-gray-800 px-2 py-1 rounded">Host: {room.hostName}</span>
                                        <span className="bg-gray-800 px-2 py-1 rounded">{room.participantCount} Participants</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleJoinRoom(room)}
                                    className="px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200"
                                >
                                    Join
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Simple Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md border border-gray-800">
                        <h2 className="text-2xl font-bold mb-6">Start a Room</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleCreateRoom(formData.get('title') as string, formData.get('description') as string);
                        }}>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Title</label>
                                <input name="title" required className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-purple-500" placeholder="What's this space about?" />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-bold mb-2">Description</label>
                                <textarea name="description" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-purple-500" rows={3} placeholder="Add some details..." />
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg font-bold">Go Live</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
