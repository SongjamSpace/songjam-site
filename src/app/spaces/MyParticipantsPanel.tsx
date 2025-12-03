'use client';

import { Avatar, hasAudio, ParticipantsAudio, useCallStateHooks } from '@stream-io/video-react-sdk';
import { MyParticipant } from './MyParticipant';
import { MyPermissionRequestsPanel } from './MyPermissionRequestsPanel';

export const MyParticipantsPanel = () => {
    const { useParticipants } = useCallStateHooks();
    const participants = useParticipants();
    const speakers = participants.filter((p) => hasAudio(p));
    const listeners = participants.filter((p) => !hasAudio(p));

    return (
        <div className="px-6 py-6">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Permission Requests */}
                <MyPermissionRequestsPanel />

                {/* Audio Component - Hidden but necessary for audio playback */}
                <ParticipantsAudio participants={participants} />

                {/* Speakers Section */}
                {speakers.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-foreground">
                                Speakers ({speakers.length})
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {speakers.map((p) => (
                                <MyParticipant participant={p} key={p.sessionId} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Listeners Section */}
                {listeners.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-foreground">
                                Listeners ({listeners.length})
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {listeners.map((p) => (
                                <MyParticipant participant={p} key={p.sessionId} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {participants.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                            <span className="text-3xl">👥</span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            No participants yet
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Share the room link to invite others
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};