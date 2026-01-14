"use client";

import { motion } from "framer-motion";
import { Mic, MicOff, Crown } from "lucide-react";
import type { Participant } from "@/lib/songjam/mockData";

interface ActiveStageProps {
  participants: Participant[];
}

export const ActiveStage = ({ participants }: ActiveStageProps) => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Active Stage
        </h3>
        <span className="text-xs text-slate-500">
          {participants.length} participant{participants.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Participants grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {participants.map((participant, index) => (
          <motion.div
            key={participant.id}
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            {/* Avatar with speaking indicator */}
            <div className="relative">
              <motion.div
                className={`
                  relative w-14 h-14 rounded-full overflow-hidden
                  ${participant.isSpeaking 
                    ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-slate-900' 
                    : 'ring-1 ring-white/10'}
                `}
                animate={participant.isSpeaking ? {
                  boxShadow: [
                    '0 0 0 0 rgba(74, 222, 128, 0)',
                    '0 0 20px 4px rgba(74, 222, 128, 0.4)',
                    '0 0 0 0 rgba(74, 222, 128, 0)'
                  ]
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <img
                  src={participant.avatarUrl}
                  alt={participant.displayName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${participant.username}`;
                  }}
                />
              </motion.div>

              {/* Host badge */}
              {participant.isHost && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Speaking indicator */}
              {participant.isSpeaking && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((bar) => (
                      <motion.div
                        key={bar}
                        className="w-1 bg-green-400 rounded-full"
                        animate={{
                          height: [4, 12, 4],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: bar * 0.1
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Muted indicator */}
              {!participant.isSpeaking && !participant.isHost && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-800 rounded-full p-0.5">
                  <MicOff className="w-3 h-3 text-slate-500" />
                </div>
              )}
            </div>

            {/* Name */}
            <span className="text-xs text-slate-400 text-center truncate max-w-full">
              {participant.displayName.split(' ')[0]}
            </span>
          </motion.div>
        ))}

        {/* Empty state */}
        {participants.length === 0 && (
          <div className="col-span-full text-center py-8 text-slate-500">
            No participants yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveStage;
