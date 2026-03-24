'use client';

import { useCallStateHooks, ParticipantView, SfuModels } from '@stream-io/video-react-sdk';

export const ScreenShareView = () => {
    const { useParticipants } = useCallStateHooks();
    const participants = useParticipants();

    const screenSharer = participants.find((p) =>
        p.publishedTracks.includes(SfuModels.TrackType.SCREEN_SHARE)
    );

    if (!screenSharer) return null;

    return (
        <div className="border-b border-border bg-card/30 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto p-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-sm text-blue-400 font-medium">
                        {screenSharer.name || 'Someone'} is sharing their screen
                    </span>
                </div>
                <div className="aspect-video rounded-xl overflow-hidden bg-black">
                    <ParticipantView
                        participant={screenSharer}
                        trackType="screenShareTrack"
                    />
                </div>
            </div>
        </div>
    );
};
