import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import axios from "axios";
import { NeynarAuthButton, useNeynarContext, SIWN_variant } from "@neynar/react";
import { neynarClient } from "@/services/neynar-client";

// Import from db or define compatible type
// To avoid circular dependency issues if any, defining here is safe if strict matches
// But better to import if it's a shared type.
import { PinnedItem, incrementUserBonusPoints } from "@/services/db/msRooms.db";

import { TwitterApiTweet } from "@/types/tweet";

interface LeaderboardTweet {
    engagementPoints?: number;
    bookmarkCount?: number;
    conversationId?: string;
    hashtags: string[];
    html?: string;
    id?: string;
    isEdited?: boolean;
    isQuoted?: boolean;
    isPin?: boolean;
    isReply?: boolean;
    isRetweet?: boolean;
    isSelfThread?: boolean;
    likes?: number;
    name?: string;
    mentions: any[];
    permanentUrl?: string;
    photos: { url: string }[];
    replies?: number;
    quotes?: number;
    retweets?: number;
    text?: string;
    thread: LeaderboardTweet[];
    timestamp?: number;
    urls: string[];
    userId?: string;
    username?: string;
    videos: { url: string; preview: string }[];
    views?: number;
    sensitiveContent?: boolean;
}

interface JumbotronProps {
    pinnedLinks: PinnedItem[];
    isHost?: boolean;
    onUnpin?: (url: string) => void;
    onPin?: (item: PinnedItem) => void;
    projectId?: string;
    twitterId?: string;
    twitterHandle?: string;
}


// Helper to parse text and highlight mentions/cashtags
const ParsedText = ({ text }: { text: string }) => {
    // Regex matches:
    // 1. URLs (http/https)
    // 2. Mentions (@username)
    // 3. Cashtags ($SYMBOL)
    // 4. Hashtags (#tag)
    // 5. Newlines for preservation
    const parts = text.split(/((?:https?:\/\/[^\s]+)|(?:\B@\w+)|(?:\B\$\w+)|(?:\B#\w+)|(?:\n))/g);

    return (
        <p className="text-white/90 text-[15px] leading-relaxed whitespace-pre-wrap font-sans break-words text-left">
            {parts.map((part, i) => {
                if (part.match(/^https?:\/\//)) {
                    return (
                        <a
                            key={i}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline break-all"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {part}
                        </a>
                    );
                }
                if (part.startsWith('@')) {
                    return <span key={i} className="text-blue-400 hover:underline cursor-pointer">{part}</span>;
                }
                if (part.startsWith('$')) {
                    return <span key={i} className="text-blue-400 hover:underline cursor-pointer">{part}</span>;
                }
                if (part.startsWith('#')) {
                    return <span key={i} className="text-blue-400 hover:underline cursor-pointer">{part}</span>;
                }
                return <span key={i}>{part}</span>;
            })}
        </p>
    );
};

const CustomCastCard = ({ item }: { item: PinnedItem }) => {
    const { user: neynarUser } = useNeynarContext();
    const [liked, setLiked] = React.useState(false);
    const [recasted, setRecasted] = React.useState(false);
    const [followed, setFollowed] = React.useState(false);
    const [isInteracting, setIsInteracting] = React.useState(false);

    React.useEffect(() => {
        if (typeof item === 'string') return;

        const checkFollowStatus = async () => {
            if (!neynarUser?.fid || !item.author?.fid) return;

            // Don't check if it's the user themselves
            if (neynarUser.fid === item.author.fid) return;

            try {
                const response = await axios.get('/api/neynar/user/bulk', {
                    params: {
                        fids: item.author.fid,
                        viewer_fid: neynarUser.fid
                    }
                });

                const users = response.data.users;
                if (users && users.length > 0) {
                    setFollowed(users[0].viewer_context?.following || false);
                }
            } catch (error) {
                console.error("Error checking follow status:", error);
            }
        };

        checkFollowStatus();
    }, [neynarUser?.fid, typeof item !== 'string' ? item.author?.fid : undefined]);

    // Helper to get safe values
    // If item is just a string, we can't do much.
    if (typeof item === 'string') return null;

    const likesCountLocal = item.engagement?.likes || 0;
    const recastsCountLocal = item.engagement?.recasts || 0;

    // Check if we have media
    const media = item.media || [];

    const handleLike = async () => {
        if (!neynarUser?.signer_uuid || !item.hash || isInteracting || liked) return;
        setIsInteracting(true);
        try {
            await neynarClient.publishLike(neynarUser.signer_uuid, item.hash);
            setLiked(true);
        } catch (e) {
            console.error("Like failed", e);
        } finally {
            setIsInteracting(false);
        }
    };

    const handleRecast = async () => {
        if (!neynarUser?.signer_uuid || !item.hash || isInteracting || recasted) return;
        setIsInteracting(true);
        try {
            await neynarClient.publishRecast(neynarUser.signer_uuid, item.hash);
            setRecasted(true);
        } catch (e) {
            console.error("Recast failed", e);
        } finally {
            setIsInteracting(false);
        }
    };

    const handleFollow = async () => {
        if (!neynarUser?.signer_uuid || !item.author?.fid || isInteracting || followed) return;

        // Prevent self-follow
        if (neynarUser.fid === item.author.fid) return;

        setIsInteracting(true);
        try {
            await neynarClient.publishFollow(neynarUser.signer_uuid, item.author.fid);
            setFollowed(true);
        } catch (e) {
            console.error("Follow failed", e);
        } finally {
            setIsInteracting(false);
        }
    };

    const isFarcaster = !!item.hash;
    return (
        <div className={`relative bg-[#151719] border rounded-xl overflow-hidden hover:border-white/20 transition-all p-4 flex flex-col gap-3 shadow-sm ${isFarcaster
            ? 'border-purple-500/30 hover:border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
            : 'border-white/10'
            }`}>
            {isFarcaster && (
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider rounded-full">
                    Farcaster
                </div>
            )}
            {/* Header: Author */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden shrink-0 border border-white/5">
                    {/* Use unavatar as fallback if pfp is missing */}
                    <img
                        src={isFarcaster && item.author?.pfp ? item.author.pfp : `https://unavatar.io/twitter/${item.author?.username}`}
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://unavatar.io/${item.author?.username}` }}
                        alt={item.author?.username}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex flex-col leading-tight">
                    <span className="text-white text-left font-bold text-sm truncate max-w-[200px]">
                        {item.author?.display_name || item.author?.username || 'Unknown'}
                    </span>
                    <span className="text-white/40 text-left text-xs truncate max-w-[200px]">
                        @{item.author?.username}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-3">
                {item.text ? (
                    <ParsedText text={item.text || ''} />
                ) : null}

                {/* Media Grid */}
                {media.length > 0 && (
                    <div className={`grid gap-2 ${media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} rounded-lg overflow-hidden mt-1`}>
                        {media.map((m, i) => (
                            <div key={i} className="relative aspect-video bg-black/50">
                                {m.type === 'video' ? (
                                    <video src={m.url} controls className="w-full h-full object-cover" poster={m.previewUrl} />
                                ) : (
                                    <img src={m.url} alt="media" className="w-full h-full object-cover" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 mt-1 border-t border-white/5 pt-3">
                <button
                    onClick={handleLike}
                    disabled={liked || !item.hash}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${liked ? 'text-pink-500' : 'text-white/40 hover:text-pink-500'}`}
                >
                    <svg className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {!isFarcaster && <span>{likesCountLocal + (liked ? 1 : 0)}</span>}
                </button>
                <button
                    onClick={handleRecast}
                    disabled={recasted || !item.hash}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${recasted ? 'text-green-500' : 'text-white/40 hover:text-green-500'}`}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {!isFarcaster && <span>{recastsCountLocal + (recasted ? 1 : 0)}</span>}
                </button>

                {/* Follow Button */}
                {isFarcaster && item.author?.fid && neynarUser && neynarUser.fid !== item.author.fid && (
                    <button
                        onClick={handleFollow}
                        disabled={followed}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${followed ? 'text-blue-500' : 'text-white/40 hover:text-blue-500'}`}
                    >
                        <svg className={`w-4 h-4 ${followed ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span>{followed ? 'Following' : 'Follow'}</span>
                    </button>
                )}
            </div>
        </div>
    );
};

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
        // If it's a string, treat as generic URL (legacy)
        if (typeof item === 'string') {
            const id = getTweetId(item);
            return { link: item, id, type: 'tweet', hash: undefined };
        }
        // If it has custom properties
        if (item.text) {
            return { link: item.url, ...item, type: 'custom-text' };
        }
        // Else check for url
        const url = item.url || '';
        const id = getTweetId(url);
        return { link: url, id, type: 'tweet', hash: undefined };
    }).filter(t => t.id || t.type === 'custom-text');

    const { user: neynarUser, isAuthenticated } = useNeynarContext();
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [isPinning, setIsPinning] = React.useState(false);
    const [isCasting, setIsCasting] = React.useState(false);
    const [availableTweets, setAvailableTweets] = React.useState<LeaderboardTweet[]>([]);
    const [showTweetSelector, setShowTweetSelector] = React.useState(false);
    const [isCollapsed, setIsCollapsed] = React.useState(true); // Collapse state
    const [hostTweetUrl, setHostTweetUrl] = React.useState('');
    const [participantTweetUrl, setParticipantTweetUrl] = React.useState('');
    const [isParticipantCasting, setIsParticipantCasting] = React.useState(false);

    const handleParticipantUrlCast = async () => {
        if (!neynarUser?.signer_uuid || !participantTweetUrl) return;
        setIsParticipantCasting(true);

        try {
            // Validate URL and get ID
            const tweetId = getTweetId(participantTweetUrl);
            if (!tweetId) {
                alert("Please enter a valid Twitter URL");
                setIsParticipantCasting(false);
                return;
            }

            // Fetch tweet details
            let tweetData: TwitterApiTweet;
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_SONGJAM_SERVER}/twitter-api/tweet?tweet_id=${tweetId}`);
                tweetData = res.data.tweet;

                if (!tweetData?.text) {
                    throw new Error("No text content in tweet");
                }
            } catch (fetchErr) {
                console.error("Failed to fetch tweet details", fetchErr);
                alert("Failed to fetch tweet content. Please check the URL and try again.");
                setParticipantTweetUrl('');
                setIsParticipantCasting(false);
                return;
            }

            // Verify Ownership: Check if tweet author ID matches connected twitterId
            if (twitterId && tweetData.author.id !== twitterId) {
                alert("You can only cast your own tweets! Please verify the tweet is from your account.");
                setParticipantTweetUrl('');
                setIsParticipantCasting(false);
                return;
            }

            // If twitterId prop is missing but user is authenticated, we might want to warn or just proceed if we can't verify 
            // BUT the requirement is strict: "check if the tweet.author.id is user's twitterId"
            if (!twitterId) {
                alert("Could not verify your Twitter identity. Please reconnect your account.");
                setParticipantTweetUrl('');
                setIsParticipantCasting(false);
                return;
            }

            const castText = (tweetData.text || '').replace(/&amp;/g, '&').trim().replace(/\s*https?:\/\/[^\s]+$/, '');
            const photoUrls = tweetData.extendedEntities?.media?.map(m => m.media_url_https) || [];
            const videoUrls = tweetData.extendedEntities?.media?.map(m => m.video_info?.variants[0]?.url as string).filter((url: string | undefined) => !!url) || [];

            // Post to Neynar
            const response = await neynarClient.postCast(neynarUser.signer_uuid, castText, [...photoUrls, ...videoUrls]);
            const castHash = response?.cast?.hash;

            if (!castHash) {
                throw new Error("Failed to retrieve cast hash");
            }

            // Auto-pin
            if (onPin) {
                const pinnedItem: PinnedItem = {
                    url: `https://farcaster.xyz/${neynarUser.username}/${castHash}`,
                    text: castText,
                    hash: castHash,
                    author: {
                        username: neynarUser.username || 'unknown',
                        display_name: neynarUser.display_name || 'Anonymous',
                        pfp: neynarUser.pfp_url || '',
                        fid: neynarUser.fid,
                    },
                    engagement: {
                        likes: 0,
                        recasts: 0
                    }
                };
                onPin(pinnedItem);
            }

            setParticipantTweetUrl('');
            alert("Successfully casted!");

        } catch (e) {
            console.error("Error casting participant tweet:", e);
            alert("Failed to cast. Please try again.");
        } finally {
            setIsParticipantCasting(false);
        }
    };


    const handleEarnPoints = async () => {
        if (!neynarUser?.signer_uuid) return;
        setIsProcessing(true);

        try {
            // 1. Fetch tweet/text + points from server
            const params: Record<string, any> = {};
            if (projectId) {
                params.projectId = projectId;
            }
            if (twitterId) {
                params.userId = twitterId;
            }
            // Assuming default values or that these will be passed if needed
            params.limit = 10; // Example default limit
            params.sortByPoints = false; // Example default sort

            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_SONGJAM_SERVER}/leaderboard/user-tweets`,
                { params }
            );
            const tweetData = res.data as { success: boolean, result: LeaderboardTweet[] };

            // API returns an array, or if it returns a single object update to array
            const tweets = tweetData.result;

            if (!tweets || tweets.length === 0) {
                alert("No tweets found at the moment, try again later!");
                setIsProcessing(false);
                return;
            }

            setAvailableTweets(tweets);
            setShowTweetSelector(true);
        } catch (error) {
            console.error("Error earning points:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCast = async (tweet: LeaderboardTweet) => {
        if (!neynarUser?.signer_uuid) return;
        setIsProcessing(true);

        try {
            const { text, html, photos, videos } = tweet;
            const cleanText = (text || '').replace(/&amp;/g, '&').trim().replace(/\s*https?:\/\/[^\s]+$/, '');

            const photoUrls = photos?.map(p => p.url) || [];
            const videoUrls = videos?.map(v => v.url) || [];

            // 2. Post to Neynar
            const response = await neynarClient.postCast(neynarUser.signer_uuid, cleanText, [...photoUrls, ...videoUrls]);
            // Assuming response looks like { success: true, cast: { hash: "0x...", author: {...} } } or similar
            // We need the hash to allow interactions. Use a fallback if response structure varies
            const castHash = response?.cast?.hash;

            if (!castHash) {
                throw new Error("Failed to retrieve cast hash");
            }

            // 3. Auto-pin 
            if (onPin) {
                const pinnedItem: PinnedItem = {
                    url: `https://farcaster.xyz/${neynarUser.username}/${castHash}`,
                    text: cleanText,
                    hash: castHash,
                    author: {
                        username: neynarUser.username || 'unknown',
                        display_name: neynarUser.display_name || 'Anonymous',
                        pfp: neynarUser.pfp_url || '',
                        fid: neynarUser.fid,
                    },
                    engagement: {
                        likes: 0,
                        recasts: 0
                    }
                };

                // We keep the Warpcast URL as the pinned URL because we are pinning the *Cast* we just made.
                onPin(pinnedItem);
            }

            // Close selector
            setShowTweetSelector(false);
            setAvailableTweets([]);
            alert(`Successfully casted!`);

        } catch (e) {
            console.error("Error casting:", e);
            alert("Failed to cast. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    }

    const handleHostCast = async () => {
        if (!neynarUser?.signer_uuid || !hostTweetUrl) return;
        setIsCasting(true);

        try {
            // validating tweet URL
            const tweetId = getTweetId(hostTweetUrl);
            if (!tweetId) {
                alert("Please enter a valid Twitter URL");
                setIsCasting(false);
                return;
            }

            let tweetData: TwitterApiTweet;

            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_SONGJAM_SERVER}/twitter-api/tweet?tweet_id=${tweetId}`);
                tweetData = res.data.tweet;

                if (!tweetData?.text) {
                    throw new Error("No text content in tweet");
                }
            } catch (fetchErr) {
                console.error("Failed to fetch tweet details", fetchErr);
                alert("Failed to fetch tweet content. Please check the URL and try again.");
                setIsCasting(false);
                return;
            }

            const castText = (tweetData.text || '').replace(/&amp;/g, '&').trim().replace(/\s*https?:\/\/[^\s]+$/, '');

            const photoUrls = tweetData.extendedEntities?.media?.map(m => m.media_url_https) || [];
            const videoUrls = tweetData.extendedEntities?.media?.map(m => m.video_info?.variants[0]?.url as string).filter((url: string | undefined) => !!url) || [];

            // Post to Neynar
            const response = await neynarClient.postCast(neynarUser.signer_uuid, castText, [...photoUrls, ...videoUrls]);
            const castHash = response?.cast?.hash;

            if (onPin && castHash) {
                const pinnedItem: PinnedItem = {
                    url: `https://farcaster.xyz/${neynarUser.username}/${castHash}`,
                    text: castText,
                    hash: castHash,
                    author: {
                        username: neynarUser.username || 'unknown',
                        display_name: neynarUser.display_name || 'Anonymous',
                        pfp: neynarUser.pfp_url || '',
                        fid: neynarUser.fid,
                    },
                    engagement: {
                        likes: 0,
                        recasts: 0
                    }
                };
                onPin(pinnedItem);
                setHostTweetUrl('');
            }
        } catch (e) {
            console.error("Error casting host tweet:", e);
            alert("Failed to cast. Please try again.");
        } finally {
            setIsCasting(false);
        }
    };

    const handlePinOnly = async () => {
        if (!onPin || !hostTweetUrl) return;
        setIsPinning(true);

        try {
            // Extract ID if it's a twitter URL
            const tweetId = getTweetId(hostTweetUrl);
            let pinnedItem: PinnedItem;

            if (tweetId) {
                // Fetch tweet data from server
                const res = await axios.get(`${process.env.NEXT_PUBLIC_SONGJAM_SERVER}/twitter-api/tweet?tweet_id=${tweetId}`);
                const tweetData: TwitterApiTweet = res.data.tweet;
                if (!tweetData) {
                    throw new Error('Tweet not found');
                }


                pinnedItem = {
                    url: hostTweetUrl || '',
                    text: tweetData.text || hostTweetUrl || '',
                    timestamp: tweetData.createdAt ? Date.parse(tweetData.createdAt) : Date.now(),
                    author: {
                        username: tweetData.author.userName || 'twitter_user',
                        display_name: tweetData.author.name || 'Twitter User',
                        pfp: tweetData.author.profilePicture || '',
                    },
                    hash: '',
                    engagement: {
                        likes: tweetData.likeCount || 0,
                        recasts: tweetData.retweetCount || 0
                    }
                };
            } else {
                // Fallback for plain text or non-tweet URLs
                pinnedItem = {
                    url: hostTweetUrl || '',
                    text: hostTweetUrl || '',
                    author: {
                        username: neynarUser?.username || 'host',
                        display_name: neynarUser?.display_name || 'Host',
                        pfp: neynarUser?.pfp_url || '',
                    },
                    engagement: {
                        likes: 0,
                        recasts: 0
                    }
                };

            }

            onPin(pinnedItem);
            setHostTweetUrl('');
        } catch (e) {
            console.error("Error pinning item:", e);
            alert("Unable to pin tweet. Please try again later.");
            setHostTweetUrl('');
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
                animate={{
                    opacity: 1,
                    x: isCollapsed ? "calc(100% - 40px)" : "0%" // On collapse keep a sliver visible or push mostly out
                }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ type: "tween", ease: "linear", duration: 0.3 }}
                className={`fixed top-0 right-0 h-full z-40 pointer-events-auto shadow-2xl transition-all duration-300 ${isCollapsed ? 'w-full sm:w-[400px]' : 'w-full sm:w-[400px]'}`}
            >
                <div className="w-full h-full bg-black/80 backdrop-blur-xl border-l border-white/10 flex flex-col relative">

                    {/* Collapse Toggle Button (Desktop: Hanging / Mobile: Only when collapsed) */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`absolute left-0 top-1/2 sm:-translate-x-full max-sm:translate-x-0 bg-black/80 border border-white/10 sm:border-r-0 max-sm:border-l-0 rounded-l-lg max-sm:rounded-r-lg max-sm:rounded-l-none p-3 text-white/60 hover:text-white transition-colors z-50 shadow-lg flex items-center gap-2`}
                        title={isCollapsed ? "Expand Jumbotron" : "Collapse Jumbotron"}
                    >
                        {isCollapsed ? (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                <span className="text-xs font-bold">Open</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                <span className="text-xs font-bold">Close</span>
                            </>
                        )}
                    </button>
                    {/* Header */}
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-500/10 to-transparent border-b border-white/5 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white/90 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" />
                                Jumbotron
                            </span>

                            {showTweetSelector && (
                                <button
                                    onClick={() => setShowTweetSelector(false)}
                                    className="text-white/40 hover:text-white text-xs ml-4"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex flex-col gap-6">

                        {/* MODE: Tweet Selector */}
                        {showTweetSelector ? (
                            <div className="flex flex-col gap-4">
                                <div className="text-white font-bold text-lg">
                                    Select a Tweet to Cast
                                </div>
                                <div className="text-white/60 text-sm mb-2">
                                    Choose one of the following tweets to share on farcaster.
                                </div>
                                {availableTweets.some(t => t.videos?.length > 0) && (
                                    <div className="mb-4 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-2 items-start">
                                        <span className="text-yellow-500 text-sm">⚠️</span>
                                        <p className="text-xs text-yellow-200/90 leading-relaxed">
                                            Videos/GIFs are not natively supported on Farcaster yet, so they will be previewed in a separate window.
                                        </p>
                                    </div>
                                )}
                                {availableTweets.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-60">
                                        <span className="text-3xl">🔍</span>
                                        <span className="text-sm font-medium text-white/80">No tweets found</span>
                                        <span className="text-xs text-white/50">Check back later for more!</span>
                                    </div>
                                ) : (
                                    availableTweets.map((t, idx) => (
                                        <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 group hover:border-blue-500/50 transition-colors">
                                            {/* Header with author for available info */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden shrink-0">
                                                    <img
                                                        src={`https://unavatar.io/twitter/${t.username}`}
                                                        alt={t.username}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex flex-col leading-tight">
                                                    <span className="text-white font-bold text-xs">
                                                        {t.name}
                                                    </span>
                                                    <span className="text-white/40 text-[10px]">
                                                        @{t.username}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col">
                                                <p className="text-sm text-white/90 font-mono bg-black/20 p-2 rounded whitespace-pre-wrap">
                                                    {t.text}
                                                </p>
                                                {/* Show Media Previews if any */}
                                                {(t.photos?.length > 0 || t.videos?.length > 0) && (
                                                    <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                                                        {t.photos?.map((p: any, i: number) => (
                                                            <img key={`p-${i}`} src={p.url} className="w-20 h-20 rounded object-cover border border-white/10" />
                                                        ))}
                                                        {t.videos?.map((v: any, i: number) => (
                                                            <div key={`v-${i}`} className="w-20 h-20 rounded bg-black flex items-center justify-center border border-white/10 relative">
                                                                <span className="text-xs text-white/50">Video</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                                                <button
                                                    onClick={() => handleCast(t)}
                                                    disabled={isProcessing}
                                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    {isProcessing ? 'Casting...' : 'Cast on Farcaster'}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            /* MODE: Pinned Tweets Display */
                            <>
                                {validTweets.length === 0 && (
                                    <div className="text-white/40 text-center text-sm italic mt-10">
                                        No pinned tweets yet.
                                    </div>
                                )}
                                {validTweets.map((item, idx) => (
                                    <div key={idx} className="relative group flex flex-col gap-2">
                                        {item.type === 'tweet' && item.id ? (
                                            /* Treat fetched tweets as custom cards now */
                                            <CustomCastCard item={item} />
                                        ) : (
                                            <CustomCastCard item={item} />
                                        )}
                                        {isHost && onUnpin && (
                                            <button
                                                onClick={() => onUnpin(item.link || item.hash || '')}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                                                title="Unpin"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Bottom Controls */}
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
                                    {isHost ? (
                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="text"
                                                value={hostTweetUrl}
                                                onChange={(e) => setHostTweetUrl(e.target.value)}
                                                placeholder="Paste tweet URL..."
                                                className="w-full bg-white/10 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-white/30"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handlePinOnly}
                                                    className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded transition-colors flex items-center justify-center"
                                                    disabled={isPinning || isCasting}
                                                >
                                                    {isPinning ? (
                                                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
                                                    ) : null}
                                                    Pin Only
                                                </button>
                                                <button
                                                    onClick={handleHostCast}
                                                    disabled={isCasting || isPinning || !hostTweetUrl}
                                                    className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                                                >
                                                    {isCasting ? (
                                                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm45.66-93.66a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32-11.32L148.69,136H88a8,8,0,0,1,0-16h60.69l-18.35-18.34a8,8,0,0,1,11.32-11.32Z"></path></svg>
                                                    )}
                                                    Cast on Farcaster
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        !showTweetSelector && (
                                            <div className="flex flex-col gap-3">
                                                {/* Manual URL Input for Participants */}
                                                <div className="flex gap-2 p-2 bg-white/5 rounded-lg border border-white/5">
                                                    <input
                                                        type="text"
                                                        value={participantTweetUrl}
                                                        onChange={(e) => setParticipantTweetUrl(e.target.value)}
                                                        placeholder="Enter your tweet URL..."
                                                        className="flex-1 bg-transparent text-xs text-white placeholder-white/30 focus:outline-none"
                                                    />
                                                    <button
                                                        onClick={handleParticipantUrlCast}
                                                        disabled={isParticipantCasting || !participantTweetUrl}
                                                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-[10px] font-bold rounded transition-colors flex items-center gap-1"
                                                    >
                                                        {isParticipantCasting ? (
                                                            <span className="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        ) : (
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                            </svg>
                                                        )}
                                                        Cast
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="h-[1px] flex-1 bg-white/10" />
                                                    <span className="text-[10px] text-white/30 font-medium">OR SELECT RECENT</span>
                                                    <div className="h-[1px] flex-1 bg-white/10" />
                                                </div>

                                                <button
                                                    onClick={handleEarnPoints}
                                                    disabled={isProcessing}
                                                    className="w-full px-4 py-1 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all flex items-center justify-center gap-2"
                                                >
                                                    {isProcessing ? (
                                                        <>
                                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="text-lg">📢</span> Choose Tweets
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
