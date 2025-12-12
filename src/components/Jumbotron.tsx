import React from 'react';
import { Tweet } from 'react-tweet';
import { motion, AnimatePresence } from 'framer-motion';

import axios from "axios";
import { NeynarAuthButton, useNeynarContext, SIWN_variant } from "@neynar/react";
import { neynarClient } from "@/services/neynar-client";

// Import from db or define compatible type
// To avoid circular dependency issues if any, defining here is safe if strict matches
// But better to import if it's a shared type.
import { PinnedItem, incrementUserBonusPoints } from "@/services/db/msRooms.db";

interface JumbotronProps {
    pinnedLinks: PinnedItem[];
    isHost?: boolean;
    onUnpin?: (url: string) => void;
    onPin?: (item: PinnedItem) => void;
    projectId?: string;
    twitterId?: string;
    twitterHandle?: string;
}

export const Jumbotron = ({ pinnedLinks, isHost, onUnpin, onPin, projectId, twitterId, twitterHandle }: JumbotronProps) => {
    // Extract tweet ID from URL
    // URL format: https://twitter.com/username/status/123456789...
    // or https://x.com/username/status/123456789...
    const getTweetId = (url: string) => {
        try {
            const match = url.match(/status\/(\d+)/);
            return match ? match[1] : null;
        } catch (e) {
            return null;
        }
    };

    const validTweets = pinnedLinks.map(item => {
        const url = typeof item === 'string' ? item : item.url;
        const message = typeof item === 'string' ? undefined : item.message;
        const id = getTweetId(url);
        return { link: url, id, message };
    }).filter(t => t.id);

    const { user: neynarUser, isAuthenticated } = useNeynarContext();
    const [isPinning, setIsPinning] = React.useState(false);

    const handleEarnPoints = async () => {
        if (!neynarUser?.signer_uuid) return;
        setIsPinning(true);

        try {
            // 1. Fetch tweet/text + points from server
            const { data: tweetData } = await axios.get(
                `${process.env.NEXT_PUBLIC_SONGJAM_SERVER}/leaderboard/user-tweets`
            );

            const { text, engagementPoints, id: tweetId } = tweetData;
            if (!text) {
                alert("No tweet found, try again later");
                return;
            }

            // 2. Post to Neynar
            await neynarClient.postCast(neynarUser.signer_uuid, text);

            // 3. User Bonus Points
            // We require Twitter ID to index the bonus points
            if (twitterId && projectId) {
                await incrementUserBonusPoints(
                    twitterId,
                    engagementPoints || 20,
                    {
                        twitterHandle: twitterHandle || '',
                        projectId: projectId,
                        fid: neynarUser.fid ? neynarUser.fid.toString() : undefined,
                        farcasterHandle: neynarUser.username,
                        tweetId
                    }
                );
            } else if (neynarUser.fid) {
                // Fallback or log warning if strict twitter requirement is needed
                console.warn("Twitter ID or Project ID missing, cannot award bonus points to Twitter user doc.");
            }

            // 4. Auto-pin if URL is present in text
            if (onPin) {
                // Try to find a twitter/x url in the text
                const urlMatch = `https://twitter.com/username/status/${tweetId}`;
                if (urlMatch) {
                    onPin({
                        url: urlMatch,
                        message: `💰 ${neynarUser.display_name} just earned ${engagementPoints || 20} pts!`
                    });
                }
            }

        } catch (error) {
            console.error("Error earning points:", error);
            // Optionally set an error state here
        } finally {
            setIsPinning(false);
        }
    };

    return (
        <AnimatePresence>
            {/* Always render container if we want to show the bottom controls? 
                Original code only showed if validTweets.length > 0. 
                User says "place the neynar auth only at the bottom of the jumbotron".
                If Jumbotron is hidden, how do they auth?
                Presumably Jumbotron should be visible or have a toggle if it's for pinning.
                But usually Jumbotron is for *displaying* content.
                If empty, maybe it should be hidden? But then how to pin?
                The Host usually has controls to pin.
                In `MiniSpaceBanner`, there was a pin button?
                Yes, `showPinInput` in `MiniSpaceBanner`.
                User wants "place a textbox to enter tweet url... in the sidebar".
                So maybe Jumbotron should always be visible if IS HOST? 
                Or if Signed In with Neynar?
                Let's assume we keep existing behavior (hidden if empty) BUT we need to show it if user wants to pin?
                Actually, the user request says "once signed in place a textbox".
                If I can't sign in (because hidden), I can't start.
                Let's change condition: show if validTweets > 0 OR (isHost?? no user said Neynar auth).
                Actually, let's just make it visible if `pinnedLinks.length > 0` OR `isAuthenticated` (so they can pin more) OR `!isAuthenticated` (so they can sign in?).
                If I make it always visible z-index might block things.
                Let's add a "Toggle Jumbotron" or make it a small floating trigger if hidden?
                Or just assume it's always there for now?
                The previous code was `validTweets.length > 0 && (...)`.
                I will change it to `(validTweets.length > 0 || true) &&` for now to test, or better:
                Let's wrap the content in a way that if it's empty, maybe just the auth button floats?
                Let's stick to modifying the existing structure.
            */}
            <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 h-full w-[400px] z-40 pointer-events-auto shadow-2xl"
            >
                <div className="w-full h-full bg-black/80 backdrop-blur-xl border-l border-white/10 flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-500/10 to-transparent border-b border-white/5 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white/90 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" />
                                Jumbotron
                            </span>
                        </div>
                    </div>

                    {/* Tweet Content */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex flex-col gap-6">
                        {validTweets.length === 0 && (
                            <div className="text-white/40 text-center text-sm italic mt-10">
                                No pinned tweets yet.
                            </div>
                        )}
                        {validTweets.map((item, idx) => (
                            <div key={item.link + idx} className="relative group flex flex-col gap-2">
                                {item.message && (
                                    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-2 text-center">
                                        <p className="text-yellow-200 text-xs font-bold animate-pulse">
                                            {item.message}
                                        </p>
                                    </div>
                                )}
                                <div className="light" data-theme="dark">
                                    {item.id && <Tweet id={item.id} />}
                                </div>
                                {isHost && onUnpin && (
                                    <button
                                        onClick={() => onUnpin(item.link)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        title="Unpin"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-white/10 bg-black/40">
                        {!isAuthenticated ? (
                            <div className="flex justify-center">
                                <NeynarAuthButton variant={SIWN_variant.FARCASTER} />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20">
                                        {neynarUser?.pfp_url && <img src={neynarUser.pfp_url} alt="me" className="w-full h-full object-cover" />}
                                    </div>
                                    <span className="text-xs text-white/60">Signed in as <span className="text-white font-bold">{neynarUser?.display_name}</span></span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={handleEarnPoints}
                                        disabled={isPinning}
                                        className="w-full px-4 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all flex items-center justify-center gap-2"
                                    >
                                        {isPinning ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-lg">💰</span> Earn Bonus Points
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
