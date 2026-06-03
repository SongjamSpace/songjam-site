"use client";

import React from "react";
import { SmilePlus, Grid } from "lucide-react";
import { motion } from "framer-motion";

interface DjReactionsProps {
  onReact: (emoji: string) => void;
}

export default function DjReactions({ onReact }: DjReactionsProps) {
  const reactions = [
    { emoji: "🎉", label: "Party" },
    { emoji: "🔥", label: "Fire" },
    { emoji: "😂", label: "Laugh" },
    { emoji: "🥁", label: "Drum" },
    { emoji: "👏", label: "Clap" },
    { emoji: "🎧", label: "Music" },
    { emoji: "🎵", label: "Note" },
    { emoji: "🎸", label: "Guitar" },
    { emoji: "🎹", label: "Keys" },
    { emoji: "🎺", label: "Trumpet" },
  ];

  return (
    <div className="bg-[#0a0a10]/60 backdrop-blur-3xl border border-white/[0.08] p-8 rounded-[2.5rem] flex flex-col gap-6 shadow-2xl relative overflow-hidden group/reactions">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none" />
      
      {/* Container header */}
      <div className="flex items-center gap-3 border-b border-white/[0.05] pb-4 mb-2 relative z-10">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50" style={{ fontFamily: "Orbitron, sans-serif" }}>
          Signal Reactions
        </h3>
      </div>

      <div className="grid grid-cols-5 gap-3 relative z-10">
        {reactions.map((reaction, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.15, rotate: 5, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onReact(reaction.emoji)}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-gradient-to-br hover:from-blue-600/20 hover:to-violet-600/20 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/20 transition-all text-xl"
            title={reaction.label}
          >
            {reaction.emoji}
          </motion.button>
        ))}
        <motion.button
          whileHover={{ scale: 1.15, rotate: 5, y: -2 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.01] border border-dashed border-white/20 hover:bg-white/5 hover:border-white/40 transition-all text-white/40"
        >
          <SmilePlus size={20} />
        </motion.button>
      </div>

      {/* Decorative text */}
      <div className="mt-2 text-[9px] font-black text-center text-white/10 uppercase tracking-[0.4em] italic relative z-10">
        Broadcast to Space
      </div>
    </div>
  );
}
