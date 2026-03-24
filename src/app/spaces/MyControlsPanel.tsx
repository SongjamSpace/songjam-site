'use client';

import { MyLiveButton } from "./MyLiveButton";
import { MyMicButton } from "./MyMicButton";
import { MyScreenShareButton } from "./MyScreenShareButton";

export const MyControlsPanel = () => {
    return (
        <div className="px-6 py-5">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-4">
                    <MyMicButton />
                    <MyScreenShareButton />
                    <MyLiveButton />
                </div>
            </div>
        </div>
    );
};