'use client';

import { Avatar, type StreamVideoParticipant } from '@stream-io/video-react-sdk';

export const MyParticipant = ({ participant }: { participant: StreamVideoParticipant }) => {
    const { isSpeaking } = participant;

    return (
        <div className="flex flex-col items-center gap-2 group">
            {/* Avatar with Speaking Indicator */}
            <div className="relative">
                <div className={`
                    w-16 h-16 rounded-full overflow-hidden transition-all duration-300
                    ${isSpeaking
                        ? 'ring-4 ring-purple-500 ring-offset-2 ring-offset-background scale-110'
                        : 'ring-2 ring-border'
                    }
                `}>
                    <Avatar
                        imageSrc={participant.image}
                        className="w-full h-full"
                    />
                </div>

                {/* Speaking Indicator */}
                {isSpeaking && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Name */}
            <div className="text-center">
                <div className={`
                    text-sm font-medium truncate max-w-[80px] transition-colors
                    ${isSpeaking ? 'text-purple-400' : 'text-foreground'}
                `}>
                    {participant.name}
                </div>
            </div>
        </div>
    );
};