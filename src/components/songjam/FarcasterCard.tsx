"use client";

import { motion } from "framer-motion";
import { Heart, Repeat2 } from "lucide-react";
import type { FarcasterCast } from "@/lib/songjam/mockData";

interface FarcasterCardProps {
  cast: FarcasterCast;
  isProcessing?: boolean;
  onCollect?: () => void;
  style?: React.CSSProperties;
}

export const FarcasterCard = ({ 
  cast, 
  isProcessing = false, 
  onCollect,
  style 
}: FarcasterCardProps) => {
  return (
    <motion.div
      className="absolute w-64 cursor-pointer"
      style={style}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: isProcessing ? [0, -5, 0] : 0
      }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{ 
        duration: 0.4,
        y: isProcessing ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {}
      }}
      whileHover={{ scale: 1.05, zIndex: 50 }}
      onClick={onCollect}
    >
      {/* Glassmorphism card */}
      <div className="relative rounded-xl overflow-hidden backdrop-blur-xl bg-slate-900/60 border border-white/10 shadow-2xl">
        {/* Neon border glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/20 via-transparent to-cyan-500/20 pointer-events-none" />
        
        {/* Processing shimmer effect */}
        {isProcessing && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        )}

        <div className="relative p-4">
          {/* Header: Avatar + Username */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <img
                src={cast.avatarUrl}
                alt={cast.displayName}
                className="w-10 h-10 rounded-full border-2 border-purple-500/50"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${cast.username}`;
                }}
              />
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">{cast.displayName}</p>
              <p className="text-slate-400 text-xs truncate">@{cast.username}</p>
            </div>
          </div>

          {/* Cast text */}
          <p className="text-slate-200 text-sm leading-relaxed mb-3 line-clamp-3">
            {cast.text}
          </p>

          {/* Footer: Engagement stats */}
          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <div className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              <span>{cast.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <Repeat2 className="w-3.5 h-3.5" />
              <span>{cast.recasts}</span>
            </div>
          </div>
        </div>

        {/* Processing label */}
        {isProcessing && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Scanning...
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FarcasterCard;
