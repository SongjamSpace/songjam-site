
'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
    useDaily,
    useDailyEvent,
    useParticipantIds,
    useLocalParticipant,
    useParticipantProperty,
    DailyAudio,
} from '@daily-co/daily-react';
import { useAuth } from '@/components/providers';
import {
    addSpeakerRequest,
    subscribeToSpeakerRequests,
    updateSpeakerRequestStatus,
    SpeakerRequest,
    DailyRoom,
    updateDailyRoomStatus,
} from '@/services/db/dailyRooms.db'; 
import { useSpacePoints } from '@/hooks/useSpacePoints';
import { useRouter } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';

interface DailyAudioRoomProps {
    room: DailyRoom;
    onLeave: () => void;
}

export const DailyAudioRoom = ({ room, onLeave }: DailyAudioRoomProps) => {
    const daily = useDaily();
    const { user, authenticated, twitterObj } = useAuth();
    const router = useRouter();
    
    const localParticipant = useLocalParticipant();
    const participantIds = useParticipantIds();
    
    const [speakerRequests, setSpeakerRequests] = useState<SpeakerRequest[]>([]);
    const [myRequest, setMyRequest] = useState<SpeakerRequest | null>(null);
    const [isMicEnabled, setIsMicEnabled] = useState(false);
    
    // Identify Role
    // Host is defined by the room document
    const isHost = (twitterObj?.twitterId || user?.uid) === room.hostId;
    
    // Speaker is Host OR someone approved
    // We check if we are approved by looking at myRequest status
    const isApprovedSpeaker = myRequest?.status === 'approved';
    const canSpeak = isHost || isApprovedSpeaker;

    // Daily Events
    useDailyEvent('left-meeting', () => {
        onLeave();
    });

    // Handle Join - Set User Data
    useEffect(() => {
        if (!daily || !localParticipant) return;
        // Optional: Update user data if needed
    }, [daily, localParticipant]);

    // Firestore: Speaker Requests (Host Side)
    useEffect(() => {
        if (!isHost || !room.id) return;
        
        const unsubscribe = subscribeToSpeakerRequests(room.id, (requests) => {
            setSpeakerRequests(requests);
        });
        
        return unsubscribe;
    }, [isHost, room.id]);

    // Firestore: Check My Request Status (Listener Side)
    useEffect(() => {
        if (isHost || !room.id || !user?.uid) return;
        
        const userId = twitterObj?.twitterId || user.uid;
        
    }, [isHost, room.id, user?.uid]);
    

    // Handlers
    const handleToggleMic = () => {
        if (!daily) return;
        const newState = !isMicEnabled;
        daily.setLocalAudio(newState);
        setIsMicEnabled(newState);
    };

    const handleRaiseHand = async () => {
        if (!user || !room.id) return;
        try {
            const userId = twitterObj?.twitterId || user.uid;
            const userName = twitterObj?.name || user.displayName || 'User';
            const avatar = twitterObj?.username ? `https://unavatar.io/x/${twitterObj.username}` : user.photoURL;
            
            const req = await addSpeakerRequest(room.id, userId, userName, avatar || undefined);
            setMyRequest(req);
        } catch(e) {
            console.error("Failed to raise hand", e);
        }
    };
    
    const handleApprove = async (reqId: string) => {
        await updateSpeakerRequestStatus(room.id, reqId, 'approved');
        // Notify user? In a real app, we'd use a signal or the user would see their status change.
    };

    const handleLeave = () => {
        daily?.leave();
        onLeave();
    };
    
    const handleEndRoom = async () => {
         if (confirm("End room for everyone?")) {
             await updateDailyRoomStatus(room.id, 'Ended');
             daily?.leave();
             onLeave();
         }
    };

    // Render Participants
    
    return (
        <div className="flex flex-col h-screen bg-gray-950 text-white p-4">
             <DailyAudio />
             
             {/* Header */}
             <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        {room.title}
                    </h1>
                    <p className="text-gray-400 text-sm">{room.description}</p>
                </div>
                <div className="flex gap-2">
                    {canSpeak && (
                        <button 
                            onClick={handleToggleMic}
                            className={`px-4 py-2 rounded-full font-bold ${isMicEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                        >
                            {isMicEnabled ? 'Mute' : 'Unmute'}
                        </button>
                    )}
                    
                    {!canSpeak && !myRequest && (
                        <button 
                            onClick={handleRaiseHand}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-full font-bold"
                        >
                            ✋ Raise Hand
                        </button>
                    )}
                    
                    {!canSpeak && myRequest && (
                        <div className="px-4 py-2 bg-gray-700 rounded-full text-sm">
                            Request Pending...
                        </div>
                    )}
                    
                    <button 
                        onClick={isHost ? handleEndRoom : handleLeave}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-600"
                    >
                        {isHost ? 'End Space' : 'Leave'}
                    </button>
                </div>
             </div>
             
             {/* Main Content */}
             <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Visualizer / Active Speakers */}
                <div className="md:col-span-3 bg-gray-900/50 rounded-2xl p-6 relative overflow-hidden border border-gray-800 flex flex-wrap gap-4 content-start">
                    {participantIds.map(id => (
                        <ParticipantBubble key={id} id={id} isHost={false} />
                    ))}
                    {participantIds.length === 0 && (
                        <div className="text-gray-500 w-full text-center mt-20">Waiting for participants...</div>
                    )}
                </div>
                
                {/* Sidebar */}
                <div className="hidden md:flex flex-col gap-4">
                    {/* Speaker Requests */}
                    {isHost && speakerRequests.length > 0 && (
                        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                             <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Requests ({speakerRequests.length})</h3>
                             <div className="space-y-2">
                                {speakerRequests.map(req => (
                                    <div key={req.id} className="flex items-center justify-between bg-gray-800 p-2 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs">
                                                {req.userName[0]}
                                            </div>
                                            <span className="text-sm font-medium">{req.userName}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleApprove(req.id)}
                                            className="ml-2 p-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-md text-xs font-bold"
                                        >
                                            Accept
                                        </button>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                    
                    {/* Room Stats */}
                    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                        <h3 className="text-sm font-bold text-gray-400 mb-2">Room Info</h3>
                        <div className="text-2xl font-bold">{participantIds.length} <span className="text-sm font-normal text-gray-500">Listening</span></div>
                    </div>
                </div>
             </div>
        </div>
    );
};

// Helper Component for Participant
const ParticipantBubble = ({ id, isHost }: { id: string, isHost: boolean }) => {
     const audioLevel = 0; // useAudioLevel(id) if available in daily-react
     const username = useParticipantProperty(id, 'user_name');
     // const isSpeaking = audioLevel > 0.05;
     
     return (
        <div className="relative group">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${/* isSpeaking ? 'border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.4)]' : */ 'border-gray-700 bg-gray-800'}`}>
                <span className="text-xl font-bold text-gray-300">{username ? username[0].toUpperCase() : '?'}</span>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap bg-black/50 px-2 py-0.5 rounded-full">
                {username || 'Guest'}
            </div>
        </div>
     );
};

export default DailyAudioRoom;
