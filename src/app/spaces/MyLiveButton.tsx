'use client';

import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';

export const MyLiveButton = () => {
    const call = useCall();
    const { useIsCallLive } = useCallStateHooks();
    const isLive = useIsCallLive();

    return (
        <button
            onClick={async () => {
                if (isLive) {
                    await call?.stopLive();
                } else {
                    await call?.goLive();
                }
            }}
            className={`
                flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200
                ${isLive
                    ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30'
                    : 'bg-muted hover:bg-muted/80 text-foreground border border-border'
                }
            `}
        >
            {isLive ? (
                <>
                    <div className="relative flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                    </div>
                    <span>End Live</span>
                </>
            ) : (
                <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Go Live</span>
                </>
            )}
        </button>
    );
};