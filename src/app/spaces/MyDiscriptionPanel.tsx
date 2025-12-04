'use client';

import { useCallStateHooks } from '@stream-io/video-react-sdk';
import { useState } from 'react';

export const MyDescriptionPanel = () => {
    const { useCallCustomData, useParticipants } = useCallStateHooks();
    const custom = useCallCustomData();
    const participants = useParticipants();
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="px-6 py-5">
            <div className="max-w-4xl mx-auto">
                {/* Title and Description */}
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        {custom?.title ?? 'Audio Room'}
                    </h2>
                    {custom?.description && (
                        <p className="text-sm text-muted-foreground">
                            {custom.description}
                        </p>
                    )}
                </div>

                {/* Stats and Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {/* Participant Count */}
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <span className="text-foreground font-medium">
                                {participants.length} {participants.length === 1 ? 'person' : 'people'}
                            </span>
                        </div>

                        {/* Live Indicator */}
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                            </div>
                            <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">
                                Live
                            </span>
                        </div>
                    </div>

                    {/* Share Button */}
                    <button
                        onClick={handleCopyLink}
                        className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                    >
                        {copied ? (
                            <>
                                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-green-400">Copied!</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                Share Link
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};