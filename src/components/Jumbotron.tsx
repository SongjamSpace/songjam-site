import React from 'react';
import { Tweet } from 'react-tweet';
import { motion, AnimatePresence } from 'framer-motion';

interface JumbotronProps {
    pinnedLinks: string[];
    isHost?: boolean;
    onUnpin?: (url: string) => void;
}

export const Jumbotron = ({ pinnedLinks, isHost, onUnpin }: JumbotronProps) => {
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

    const validTweets = pinnedLinks.map(link => ({ link, id: getTweetId(link) })).filter(t => t.id);

    return (
        <AnimatePresence>
            {validTweets.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed top-0 right-0 h-full w-[400px] z-40 pointer-events-auto"
                >
                    <div className="w-full h-full bg-black/60 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col">
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
                            {validTweets.map((item, idx) => (
                                <div key={item.link + idx} className="relative group">
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
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
