"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User2, MessageCircle } from "lucide-react";
import type { TranscriptMessage } from "@/lib/songjam/mockData";

interface LiveTranscriptProps {
  messages: TranscriptMessage[];
}

export const LiveTranscript = ({ messages }: LiveTranscriptProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <MessageCircle className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Live Transcript
        </h3>
      </div>

      {/* Messages container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
      >
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="group"
            >
              <div className="flex gap-2">
                {/* Avatar placeholder */}
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500/50 to-cyan-500/50 flex items-center justify-center">
                  <User2 className="w-3 h-3 text-white/70" />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Speaker name + time */}
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-xs font-medium text-purple-300 truncate">
                      {message.speaker}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>

                  {/* Message text */}
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {message.text}
                  </p>
                </div>
              </div>

              {/* Subtle separator */}
              {index < messages.length - 1 && (
                <div className="mt-3 border-t border-white/5" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            Waiting for conversation...
          </div>
        )}
      </div>

      {/* Live indicator */}
      <div className="mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-green-400"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-xs text-slate-500">Live captioning active</span>
        </div>
      </div>
    </div>
  );
};

export default LiveTranscript;
