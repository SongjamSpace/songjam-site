"use client";

import React, { useState } from "react";
import { Mic, Send, Volume2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface DjSpeakTextProps {
  text: string;
  setText: (val: string) => void;
  onSpeak: () => void;
}

export default function DjSpeakText({ text, setText, onSpeak }: DjSpeakTextProps) {

  return (
    <div className="bg-[#0a0a10]/60 backdrop-blur-3xl border border-white/[0.08] p-8 rounded-[2.5rem] flex flex-col gap-6 shadow-2xl relative overflow-hidden group/tts">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl pointer-events-none group-hover/tts:bg-purple-600/10 transition-all duration-700" />
      
      {/* Container header */}
      <div className="flex items-center gap-3 border-b border-white/[0.05] pb-4 mb-2 relative z-10">
        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50" style={{ fontFamily: "Orbitron, sans-serif" }}>
          Neural Audio Uplink
        </h3>
      </div>

      <div className="flex flex-col gap-5 relative z-10">
        <textarea
          rows={2}
          placeholder="Enter transmission payload..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all hover:bg-white/[0.06] hover:border-white/20 resize-none min-h-[100px]"
        />
        
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSpeak}
          className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-2xl shadow-orange-600/20 flex items-center justify-center gap-3 relative overflow-hidden group/btn"
        >
          <div className="absolute inset-0 bg-white/0 group-hover/btn:bg-white/10 transition-colors" />
          <Sparkles size={16} className="animate-pulse" /> 
          Initiate TTS
        </motion.button>
      </div>

      {/* Decorative text */}
      <div className="mt-2 flex items-center justify-center gap-4 text-[9px] font-black text-white/10 uppercase tracking-[0.4em] italic relative z-10">
        <div className="h-[1px] bg-white/5 flex-1" />
        PRO ENGINE ACTIVE
        <div className="h-[1px] bg-white/5 flex-1" />
      </div>
    </div>
  );
}
