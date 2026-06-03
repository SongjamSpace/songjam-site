"use client";

import React from "react";
import { Activity, Radio, MessageSquare, Flame, UserPlus, Music2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LogEntry {
  id: number;
  type: string;
  iconType?: string;
  user: string;
  message: string;
  time: string;
}

interface DjActivityLogProps {
  logs: LogEntry[];
}

export default function DjActivityLog({ logs }: DjActivityLogProps) {
  const getIcon = (type: string, iconType?: string) => {
    const activeType = iconType || type;
    switch (activeType) {
      case "join": return <UserPlus size={12} className="text-blue-500" />;
      case "song": return <Music2 size={12} className="text-purple-500" />;
      case "reaction": return <Flame size={12} className="text-orange-500" />;
      case "success": return <div className="w-2 h-2 rounded-full bg-green-500" />;
      case "error": return <div className="w-2 h-2 rounded-full bg-red-500" />;
      default: return <Radio size={12} className="text-white/40" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]/60 backdrop-blur-3xl border border-white/[0.08] rounded-[2.5rem] shadow-2xl relative overflow-hidden group/log">
      
      {/* Background flares */}
      <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-blue-500/5 blur-3xl pointer-events-none group-hover/log:bg-blue-600/10 transition-all duration-700" />
      <div className="absolute bottom-[-10%] left-[-10%] w-40 h-40 bg-purple-500/5 blur-3xl pointer-events-none group-hover/log:bg-purple-600/10 transition-all duration-700" />

      {/* Header */}
      <div className="p-8 flex items-center justify-between border-b border-white/[0.05] relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/30 group-hover/log:text-white transition-all duration-500">
            <Activity size={24} className="group-hover/log:animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white" style={{ fontFamily: "Orbitron, sans-serif" }}>Live Data Stream</h2>
            <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] mt-1">Real-time room events</p>
          </div>
        </div>
        <div className="flex gap-2 items-center bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
           <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Sync Active</span>
        </div>
      </div>

      {/* Logs Container */}
      <div className="flex-1 p-8 flex flex-col gap-5 overflow-y-auto max-h-[700px] scrollbar-none relative z-10">
        <AnimatePresence mode="popLayout">
          {logs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start gap-5 p-5 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all hover:translate-x-1 group/item"
            >
              <div className="mt-1 w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center group-hover/item:border-white/30 transition-all flex-shrink-0">
                {getIcon(log.type, log.iconType)}
              </div>
              
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                 <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.1em] truncate group-hover/item:text-blue-400 transition-colors capitalize">
                      {log.user}
                    </span>
                    <span className="text-[9px] font-bold text-white/10 uppercase tracking-widest shrink-0">
                      {log.time}
                    </span>
                 </div>
                 <p className="text-[13px] font-medium text-white/70 leading-relaxed group-hover/item:text-white transition-colors">
                    {log.message}
                 </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-white/10 gap-6">
             <div className="w-16 h-16 rounded-full border border-dashed border-white/10 flex items-center justify-center">
                <MessageSquare size={32} className="opacity-20" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting signal intercept...</p>
          </div>
        )}
      </div>

      {/* Decorative footer */}
      <div className="p-6 flex items-center justify-center border-t border-white/[0.03] bg-white/[0.01] relative z-10">
        <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.6em] text-center">
          SYSTEM_DECK_LOG // REVISION 2.0.4
        </p>
      </div>

    </div>
  );
}
