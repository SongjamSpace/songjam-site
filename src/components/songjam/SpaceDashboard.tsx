"use client";

import { motion } from "framer-motion";
import { LogOut, Users, Radio } from "lucide-react";
import SocialRadar from "./SocialRadar";
import ActiveStage from "./ActiveStage";
import IntelligencePanel from "./IntelligencePanel";
import type { 
  FarcasterCast, 
  Participant, 
  InviteTarget, 
  TranscriptMessage 
} from "@/lib/songjam/mockData";

interface SpaceDashboardProps {
  roomUrl: string | null;
  radarCasts: FarcasterCast[];
  participants: Participant[];
  inviteTargets: InviteTarget[];
  inviteProgress: { current: number; total: number };
  transcript: TranscriptMessage[];
  onCollectCast: (castId: string) => void;
  onEndSpace: () => void;
}

export const SpaceDashboard = ({
  roomUrl,
  radarCasts,
  participants,
  inviteTargets,
  inviteProgress,
  transcript,
  onCollectCast,
  onEndSpace
}: SpaceDashboardProps) => {
  return (
    <div className="min-h-screen w-full bg-slate-950 overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-950/30 via-slate-950 to-purple-950/20 pointer-events-none" />
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Top bar */}
        <motion.header
          className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            {/* Live indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30">
              <motion.div
                className="w-2 h-2 rounded-full bg-red-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Live</span>
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Songjam Space
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Participant count */}
            <div className="flex items-center gap-2 text-slate-400">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{participants.length}</span>
            </div>

            {/* End space button */}
            <button
              onClick={onEndSpace}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">End Space</span>
            </button>
          </div>
        </motion.header>

        {/* Main grid layout */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 p-6">
          {/* Left/Main content area - 70% */}
          <motion.div
            className="flex flex-col gap-6 min-h-0"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Social Radar - Hero Section */}
            <div className="flex-shrink-0 rounded-2xl p-6 backdrop-blur-xl bg-slate-900/40 border border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Social Radar
                </span>
              </div>
              <SocialRadar casts={radarCasts} onCollectCast={onCollectCast} />
            </div>

            {/* Active Stage - Bottom Section */}
            <div className="flex-shrink-0 rounded-2xl p-6 backdrop-blur-xl bg-slate-900/40 border border-white/5">
              <ActiveStage participants={participants} />
            </div>
          </motion.div>

          {/* Right sidebar - 30% */}
          <div className="hidden lg:block min-h-0">
            <IntelligencePanel
              inviteTargets={inviteTargets}
              inviteProgress={inviteProgress}
              transcript={transcript}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceDashboard;
