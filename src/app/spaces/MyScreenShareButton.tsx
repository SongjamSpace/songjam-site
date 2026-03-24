'use client';

import { useCallStateHooks, useCall, OwnCapability } from '@stream-io/video-react-sdk';
import { useState, useEffect } from 'react';

export const MyScreenShareButton = () => {
    const { useScreenShareState, useHasPermissions } = useCallStateHooks();
    const { screenShare, isMute: isScreenShareOff } = useScreenShareState();
    const hasPermission = useHasPermissions(OwnCapability.SCREENSHARE);
    const call = useCall();

    const [isRequesting, setIsRequesting] = useState(false);

    useEffect(() => {
        if (hasPermission) {
            setIsRequesting(false);
        }
    }, [hasPermission]);

    const handleClick = async () => {
        if (hasPermission) {
            try {
                await screenShare.toggle();
            } catch (err) {
                console.error('Screen share failed', err);
            }
        } else {
            if (isRequesting) return;
            setIsRequesting(true);
            try {
                await call?.requestPermissions({ permissions: [OwnCapability.SCREENSHARE] });
            } catch (err) {
                console.error('Failed to request screen share permission', err);
                setIsRequesting(false);
            }
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isRequesting && !hasPermission}
            className={`
                flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200
                ${!hasPermission && isRequesting
                    ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 cursor-wait'
                    : !isScreenShareOff
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-muted hover:bg-muted/80 text-foreground border border-border'
                }
            `}
        >
            {!hasPermission ? (
                isRequesting ? (
                    <>
                        <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Requesting...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Request Share</span>
                    </>
                )
            ) : !isScreenShareOff ? (
                <>
                    <div className="relative flex items-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                    <span>Stop Sharing</span>
                </>
            ) : (
                <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Share Screen</span>
                </>
            )}
        </button>
    );
};
