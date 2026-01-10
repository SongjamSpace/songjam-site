"use client";

import { motion } from "framer-motion";
import InviteTracker from "./InviteTracker";
import LiveTranscript from "./LiveTranscript";
import type { InviteTarget, TranscriptMessage } from "@/lib/songjam/mockData";

interface IntelligencePanelProps {
  inviteTargets: InviteTarget[];
  inviteProgress: { current: number; total: number };
  transcript: TranscriptMessage[];
}

export const IntelligencePanel = ({
  inviteTargets,
  inviteProgress,
  transcript
}: IntelligencePanelProps) => {
  return (
    <motion.div
      className="h-full flex flex-col gap-4"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Panel Header */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">
          Intelligence
        </h2>
      </div>

      {/* Invite Tracker - Top Half */}
      <div className="flex-1 min-h-0 rounded-2xl p-4 backdrop-blur-xl bg-slate-900/60 border border-white/10 shadow-xl">
        <InviteTracker targets={inviteTargets} progress={inviteProgress} />
      </div>

      {/* Live Transcript - Bottom Half */}
      <div className="flex-1 min-h-0 rounded-2xl p-4 backdrop-blur-xl bg-slate-900/60 border border-white/10 shadow-xl">
        <LiveTranscript messages={transcript} />
      </div>
    </motion.div>
  );
};

export default IntelligencePanel;
