'use client';

import { MyControlsPanel } from "./MyControlsPanel";
import { MyDescriptionPanel } from "./MyDiscriptionPanel";
import { MyParticipantsPanel } from "./MyParticipantsPanel";

export const MyUILayout = () => {
    return (
        <div className="flex flex-col h-full bg-background">
            {/* Description Panel - Top */}
            <div className="border-b border-border bg-card/30 backdrop-blur-sm">
                <MyDescriptionPanel />
            </div>

            {/* Participants Panel - Center (Scrollable) */}
            <div className="flex-1 overflow-y-auto">
                <MyParticipantsPanel />
            </div>

            {/* Controls Panel - Bottom (Fixed) */}
            <div className="border-t border-border bg-card/50 backdrop-blur-xl">
                <MyControlsPanel />
            </div>
        </div>
    );
};