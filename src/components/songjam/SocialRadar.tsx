"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FarcasterCard from "./FarcasterCard";
import type { FarcasterCast } from "@/lib/songjam/mockData";

interface SocialRadarProps {
  casts: FarcasterCast[];
  onCollectCast?: (castId: string) => void;
}

interface BlipPosition {
  castId: string;
  angle: number;
  radius: number;
  createdAt: number;
}

export const SocialRadar = ({ casts, onCollectCast }: SocialRadarProps) => {
  const [scannerAngle, setScannerAngle] = useState(0);
  const [blips, setBlips] = useState<BlipPosition[]>([]);
  const [expandedCastId, setExpandedCastId] = useState<string | null>(null);

  // Rotate scanner continuously
  useEffect(() => {
    const interval = setInterval(() => {
      setScannerAngle(prev => (prev + 2) % 360);
    }, 50); // ~20fps rotation

    return () => clearInterval(interval);
  }, []);

  // Add blips for new casts
  useEffect(() => {
    const existingIds = blips.map(b => b.castId);
    const newCasts = casts.filter(c => !existingIds.includes(c.id));

    if (newCasts.length > 0) {
      const newBlips: BlipPosition[] = newCasts.map(cast => ({
        castId: cast.id,
        angle: Math.random() * 360,
        radius: 0.3 + Math.random() * 0.5, // 30-80% from center
        createdAt: Date.now()
      }));

      setBlips(prev => [...prev, ...newBlips]);
    }

    // Remove blips for collected casts
    const currentIds = casts.map(c => c.id);
    setBlips(prev => prev.filter(b => currentIds.includes(b.castId)));
  }, [casts]);

  // Calculate blip positions
  const blipElements = useMemo(() => {
    return blips.map(blip => {
      const cast = casts.find(c => c.id === blip.castId);
      if (!cast) return null;

      // Convert polar to cartesian (center is 50%, 50%)
      const x = 50 + blip.radius * 40 * Math.cos((blip.angle * Math.PI) / 180);
      const y = 50 + blip.radius * 40 * Math.sin((blip.angle * Math.PI) / 180);

      const isExpanded = expandedCastId === cast.id;
      const age = Date.now() - blip.createdAt;
      const isNew = age < 2000; // New for 2 seconds

      return {
        ...blip,
        cast,
        x,
        y,
        isExpanded,
        isNew
      };
    }).filter(Boolean);
  }, [blips, casts, expandedCastId]);

  return (
    <div className="relative w-full aspect-square max-w-2xl mx-auto">
      {/* Radar background container */}
      <div className="absolute inset-0 rounded-full bg-slate-900/50 backdrop-blur-sm border border-white/5 overflow-hidden">
        
        {/* Concentric circles */}
        {[1, 2, 3, 4].map((ring) => (
          <div
            key={ring}
            className="absolute rounded-full border border-cyan-500/20"
            style={{
              inset: `${ring * 10}%`,
            }}
          />
        ))}

        {/* Cross lines */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-px bg-gradient-to-b from-transparent via-purple-500/30 to-transparent" />
        </div>

        {/* Rotating scanner gradient */}
        <motion.div
          className="absolute inset-0 origin-center"
          style={{ rotate: scannerAngle }}
        >
          <div 
            className="absolute top-1/2 left-1/2 w-1/2 h-1 origin-left"
            style={{
              background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.8), rgba(168, 85, 247, 0.4), transparent)',
              transform: 'translateY(-50%)',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)'
            }}
          />
          {/* Scanner sweep cone */}
          <div
            className="absolute inset-0"
            style={{
              background: `conic-gradient(
                from ${scannerAngle}deg,
                rgba(6, 182, 212, 0.15) 0deg,
                rgba(6, 182, 212, 0.05) 30deg,
                transparent 60deg,
                transparent 360deg
              )`
            }}
          />
        </motion.div>

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.8)]">
            <motion.div
              className="absolute inset-0 rounded-full bg-cyan-400"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>

        {/* Blips */}
        <AnimatePresence>
          {blipElements.map((blip) => blip && (
            <motion.div
              key={blip.castId}
              className="absolute cursor-pointer"
              style={{
                left: `${blip.x}%`,
                top: `${blip.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setExpandedCastId(
                expandedCastId === blip.castId ? null : blip.castId
              )}
            >
              {/* Blip dot */}
              {!blip.isExpanded && (
                <div className="relative">
                  <motion.div
                    className="w-3 h-3 rounded-full bg-purple-400"
                    animate={{
                      boxShadow: blip.isNew
                        ? ['0 0 10px rgba(168, 85, 247, 0.8)', '0 0 20px rgba(168, 85, 247, 1)', '0 0 10px rgba(168, 85, 247, 0.8)']
                        : '0 0 10px rgba(168, 85, 247, 0.6)'
                    }}
                    transition={{ duration: 1, repeat: blip.isNew ? Infinity : 0 }}
                  />
                  {/* Pulse effect for new blips */}
                  {blip.isNew && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-purple-400"
                      animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Expanded cards (outside radar for proper z-index) */}
      <AnimatePresence>
        {blipElements.map((blip) => blip?.isExpanded && (
          <FarcasterCard
            key={`card-${blip.castId}`}
            cast={blip.cast}
            isProcessing={blip.isNew}
            onCollect={() => {
              setExpandedCastId(null);
              onCollectCast?.(blip.castId);
            }}
            style={{
              left: `${Math.min(Math.max(blip.x, 20), 60)}%`,
              top: `${Math.min(Math.max(blip.y, 10), 70)}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 40
            }}
          />
        ))}
      </AnimatePresence>

      {/* Radar label */}
      <div className="absolute -top-8 left-0 right-0 text-center">
        <span className="text-xs font-mono text-cyan-400/70 uppercase tracking-wider">
          Social Radar • Live Scanning
        </span>
      </div>
    </div>
  );
};

export default SocialRadar;
