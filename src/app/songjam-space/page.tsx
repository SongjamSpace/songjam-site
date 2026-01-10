"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSongjamSpace } from "@/hooks/useSongjamSpace";
import { ListeningHomepage } from "@/components/songjam/ListeningHomepage";
import { SpaceDashboard } from "@/components/songjam/SpaceDashboard";

export default function SongjamSpacePage() {
  const {
    viewState,
    roomUrl,
    radarCasts,
    participants,
    inviteTargets,
    inviteProgress,
    transcript,
    startSpace,
    endSpace,
    collectCast
  } = useSongjamSpace();

  return (
    <AnimatePresence mode="wait">
      {viewState === 'listening' && (
        <motion.div
          key="listening"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <ListeningHomepage onStartSpace={startSpace} />
        </motion.div>
      )}

      {viewState === 'transitioning' && (
        <motion.div
          key="transitioning"
          className="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 50] }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Expanding orb effect */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 via-violet-500 to-cyan-500 blur-2xl" />
          </motion.div>
          
          <motion.p
            className="absolute text-white text-lg font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5 }}
          >
            Creating Space...
          </motion.p>
        </motion.div>
      )}

      {viewState === 'live' && (
        <motion.div
          key="live"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SpaceDashboard
            roomUrl={roomUrl}
            radarCasts={radarCasts}
            participants={participants}
            inviteTargets={inviteTargets}
            inviteProgress={inviteProgress}
            transcript={transcript}
            onCollectCast={collectCast}
            onEndSpace={endSpace}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
