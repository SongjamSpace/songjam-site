"use client";

import { motion } from "framer-motion";
import { User, TrendingUp, MessageSquare, ArrowRight } from "lucide-react";

export type SuggestionType = "profile" | "content" | "analysis";

export interface SuggestionData {
    id: string;
    type: SuggestionType;
    title: string;
    description: string;
    imageUrl?: string;
    stats?: { label: string; value: string }[];
    actionLabel?: string;
    onAction?: () => void;
}

interface SuggestionCardProps {
    data: SuggestionData;
}

const icons = {
    profile: User,
    content: MessageSquare,
    analysis: TrendingUp,
};

const colors = {
    profile: "from-purple-500 to-indigo-500",
    content: "from-pink-500 to-rose-500",
    analysis: "from-emerald-500 to-teal-500",
};

export function SuggestionCard({ data }: SuggestionCardProps) {
    const Icon = icons[data.type];
    const gradient = colors[data.type];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl"
        >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-white/50">
                    {data.type} Suggestion
                </span>
            </div>

            {/* Content */}
            <div className="relative space-y-3">
                {data.imageUrl && (
                    <div className="w-full h-32 rounded-lg overflow-hidden mb-3">
                        <img
                            src={data.imageUrl}
                            alt={data.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <h3 className="text-xl font-bold text-white leading-tight">
                    {data.title}
                </h3>

                <p className="text-sm text-gray-300 leading-relaxed">
                    {data.description}
                </p>

                {/* Stats Grid */}
                {data.stats && data.stats.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {data.stats.map((stat, i) => (
                            <div key={i} className="bg-white/5 rounded-lg p-2 border border-white/5">
                                <div className="text-xs text-gray-400">{stat.label}</div>
                                <div className="text-sm font-semibold text-white">{stat.value}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Action Button */}
                <button
                    onClick={data.onAction}
                    className={`mt-4 w-full group flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r ${gradient} text-white font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200`}
                >
                    {data.actionLabel || "View Details"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
}
