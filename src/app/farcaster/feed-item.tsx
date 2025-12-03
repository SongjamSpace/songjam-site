"use client";

import { FarcasterCast } from "./types";
import { motion } from "framer-motion";
import moment from "moment";

interface FeedItemProps {
    cast: FarcasterCast;
}

export function FeedItem({ cast }: FeedItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300"
        >
            {/* Author Info */}
            <div className="flex items-start gap-3 mb-4">
                <img
                    src={cast.author.pfp_url}
                    alt={cast.author.display_name}
                    className="w-12 h-12 rounded-full border-2 border-purple-500/30"
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white truncate">
                            {cast.author.display_name}
                        </h3>
                        <span className="text-gray-500 text-sm truncate">
                            @{cast.author.username}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400">
                        {moment(cast.timestamp).fromNow()}
                    </p>
                </div>
            </div>

            {/* Cast Content */}
            <p className="text-white/90 mb-4 leading-relaxed whitespace-pre-wrap">
                {cast.text}
            </p>

            {/* Channel Badge */}
            {cast.channel && (
                <div className="mb-4">
                    <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-3 py-1">
                        {cast.channel.image_url && (
                            <img
                                src={cast.channel.image_url}
                                alt={cast.channel.name}
                                className="w-4 h-4 rounded-full"
                            />
                        )}
                        <span className="text-xs text-purple-300">
                            /{cast.channel.name}
                        </span>
                    </div>
                </div>
            )}

            {/* Engagement Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-1.5 hover:text-pink-400 transition-colors">
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                    <span>{cast.reactions.likes_count}</span>
                </div>
                <div className="flex items-center gap-1.5 hover:text-green-400 transition-colors">
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                    <span>{cast.reactions.recasts_count}</span>
                </div>
                <div className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                    <span>{cast.replies.count}</span>
                </div>
            </div>
        </motion.div>
    );
}
