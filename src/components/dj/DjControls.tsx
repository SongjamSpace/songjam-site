"use client";

import React from "react";
import { Link, Shield, Key, Radio } from "lucide-react";
import { motion } from "framer-motion";

interface DjControlsProps {
  spaceUrl: string;
  setSpaceUrl: (val: string) => void;
  ct0: string;
  setCt0: (val: string) => void;
  authToken: string;
  setAuthToken: (val: string) => void;
  isJoined: boolean;
  onJoin: () => void;
}

export default function DjControls({
  spaceUrl,
  setSpaceUrl,
  ct0,
  setCt0,
  authToken,
  setAuthToken,
  isJoined,
  onJoin,
}: DjControlsProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-6 items-end bg-[#0a0a0f]/60 backdrop-blur-3xl border border-white/[0.08] p-7 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700" />

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {/* Space URL Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[9px] font-black text-blue-400/80 uppercase tracking-[0.2em] pl-3 flex items-center gap-2" style={{ fontFamily: "Orbitron, sans-serif" }}>
            <Link size={12} className="text-blue-500" /> Space Identification
          </label>
          <div className="relative group/input">
            <input
              type="text"
              placeholder="https://x.com/i/spaces/..."
              value={spaceUrl}
              onChange={(e) => setSpaceUrl(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-3.5 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all hover:bg-white/[0.06] hover:border-white/20"
            />
          </div>
        </div>

        {/* ct0 Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[9px] font-black text-blue-400/80 uppercase tracking-[0.2em] pl-3 flex items-center gap-2" style={{ fontFamily: "Orbitron, sans-serif" }}>
            <Shield size={12} className="text-cyan-500" /> Security Token (ct0)
          </label>
          <div className="relative group/input">
            <input
              type="password"
              placeholder="e.g. 5d2f2426..."
              value={ct0}
              onChange={(e) => setCt0(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-3.5 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all hover:bg-white/[0.06] hover:border-white/20"
            />
          </div>
        </div>

        {/* auth_token Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[9px] font-black text-blue-400/80 uppercase tracking-[0.2em] pl-3 flex items-center gap-2" style={{ fontFamily: "Orbitron, sans-serif" }}>
            <Key size={12} className="text-violet-500" /> Session Token
          </label>
          <div className="relative group/input">
            <input
              type="password"
              placeholder="Enter auth_token..."
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-3.5 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all hover:bg-white/[0.06] hover:border-white/20"
            />
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={onJoin}
        className={`whitespace-nowrap px-10 py-3.5 rounded-[1.2rem] font-black text-[10px] uppercase tracking-[0.2em] border transition-all duration-500 shadow-2xl relative overflow-hidden group/btn ${
          isJoined
            ? "border-red-500/50 text-white shadow-red-500/20"
            : "border-blue-500/40 text-white shadow-blue-600/20"
        }`}
      >
        {/* Button Background Gradient Overlay */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${isJoined ? 'bg-gradient-to-r from-red-600 to-orange-600 opacity-90' : 'bg-gradient-to-r from-blue-600 to-violet-600 opacity-90'}`} />
        <div className="absolute inset-0 bg-white/0 group-hover/btn:bg-white/10 transition-colors" />
        
        <div className="relative z-10 flex items-center gap-3">
          {isJoined ? (
            <>
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> 
              Stop Broadcast
            </>
          ) : (
            <>
              <Radio size={14} className="group-hover/btn:animate-pulse" /> 
              Establish Link
            </>
          )}
        </div>
      </motion.button>
    </div>
  );
}
