"use client";

import React from "react";
import Image from "next/image";
import { LogOut, User } from "lucide-react";

export default function DjHeader() {
  return (
    <header className="flex items-center justify-between py-5 px-8 bg-[#0a0a0f]/60 backdrop-blur-2xl border border-white/[0.08] rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
      {/* Glow effect */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700" />
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="flex items-center space-x-3">
          <img src="/images/logo1.png" alt="Logo" className="h-9 w-9 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          <div className="flex flex-col">
            <span
              className="text-2xl font-black text-white tracking-[0.1em]"
              style={{
                fontFamily: "Audiowide, cursive",
                textShadow: "0 0 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.1)",
              }}
            >
              SONGJAM <span className="text-blue-500 text-shadow-none">DJ</span>
            </span>
            <span className="text-[10px] font-black tracking-[0.4em] text-white/30 uppercase ml-1">
              Professional Interface
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 relative z-10">
        <div className="hidden md:flex flex-col items-end">
           <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Operator</span>
           <span className="text-xs font-bold text-white tracking-wide">@logeshr24</span>
        </div>
        <div className="h-12 w-[1px] bg-white/10 mx-2 hidden md:block" />
        <div className="flex items-center gap-3 bg-white/[0.03] p-1.5 rounded-2xl border border-white/[0.08] hover:bg-white/[0.06] transition-all cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 p-[1px] shadow-lg shadow-blue-500/10">
            <div className="w-full h-full rounded-[11px] bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
               <User size={20} className="text-white/80" />
            </div>
          </div>
          <button className="p-2 text-white/20 hover:text-red-400 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
