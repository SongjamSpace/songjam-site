"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Check, Loader2, UserPlus, Users } from "lucide-react";
import type { InviteTarget } from "@/lib/songjam/mockData";

interface InviteTrackerProps {
  targets: InviteTarget[];
  progress: { current: number; total: number };
}

const statusConfig = {
  searching: {
    icon: Search,
    label: 'Searching...',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
    borderColor: 'border-slate-500/30'
  },
  found: {
    icon: Check,
    label: 'Found',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/30'
  },
  inviting: {
    icon: Loader2,
    label: 'Inviting',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30'
  },
  joined: {
    icon: Users,
    label: 'Joined',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30'
  }
};

export const InviteTracker = ({ targets, progress }: InviteTrackerProps) => {
  const progressPercent = (progress.current / progress.total) * 100;

  return (
    <div className="flex flex-col h-full">
      {/* Header with progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Invite Tracker
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {progress.current}/{progress.total}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Targets list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {targets.map((target, index) => {
            const config = statusConfig[target.status];
            const StatusIcon = config.icon;

            return (
              <motion.div
                key={target.id}
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 20, height: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50 border border-white/5">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={target.avatarUrl}
                      alt={target.displayName}
                      className="w-8 h-8 rounded-full border border-white/10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${target.username}`;
                      }}
                    />
                    {target.status === 'joined' && (
                      <motion.div
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-900"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {target.displayName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      @{target.username}
                    </p>
                  </div>

                  {/* Status badge */}
                  <div className={`
                    flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium
                    ${config.bgColor} ${config.color} border ${config.borderColor}
                  `}>
                    <StatusIcon className={`w-3 h-3 ${target.status === 'inviting' ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">{config.label}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty state */}
        {targets.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Searching for targets...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteTracker;
