'use client';

import { useCallStateHooks, useCall, OwnCapability } from '@stream-io/video-react-sdk';
import { useState, useEffect } from 'react';

export const MyMicButton = () => {
    const { useMicrophoneState, useHasPermissions } = useCallStateHooks();
    const { microphone, isMute } = useMicrophoneState();
    const hasPermission = useHasPermissions(OwnCapability.SEND_AUDIO);
    const call = useCall();

    const [isRequesting, setIsRequesting] = useState(false);

    useEffect(() => {
        if (hasPermission) {
            setIsRequesting(false);
        }
    }, [hasPermission]);

    const handleClick = async () => {
        if (hasPermission) {
            if (isMute) {
                await microphone.enable();
            } else {
                await microphone.disable();
            }
        } else {
            if (isRequesting) {
                // Optional: Cancel request?
                return;
            }
            setIsRequesting(true);
            try {
                await call?.requestPermissions({ permissions: [OwnCapability.SEND_AUDIO] });
            } catch (err) {
                console.error('Failed to request permissions', err);
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
                    : isMute || !hasPermission
                        ? 'bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/30'
                        : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/20'
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        <span>Request to Speak</span>
                    </>
                )
            ) : isMute ? (
                <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                    <span>Unmute</span>
                </>
            ) : (
                <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span>Mute</span>
                </>
            )}
        </button>
    );
};