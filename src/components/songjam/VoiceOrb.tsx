"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VoiceOrbProps {
  state: 'idle' | 'listening' | 'speaking' | 'transitioning';
  inputVolume?: number;
  outputVolume?: number;
  onClick?: () => void;
  className?: string;
}

export const VoiceOrb = ({
  state,
  inputVolume = 0,
  outputVolume = 0,
  onClick,
  className
}: VoiceOrbProps) => {
  const activeVolume = Math.max(inputVolume, outputVolume);
  const pulseScale = 1 + activeVolume * 0.3;

  // Ring animation variants
  const ringVariants = {
    idle: {
      scale: [1, 1.05, 1],
      opacity: [0.3, 0.5, 0.3],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    listening: {
      scale: [1, 1.1 + inputVolume * 0.2, 1],
      opacity: [0.4, 0.8, 0.4],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        ease: "easeOut"
      }
    },
    speaking: {
      scale: [1, 1.15 + outputVolume * 0.3, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 0.3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    transitioning: {
      scale: [1, 2, 3],
      opacity: [1, 0.5, 0],
      transition: {
        duration: 1.5,
        ease: "easeOut"
      }
    }
  };

  // Core orb animation
  const orbVariants = {
    idle: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    listening: {
      scale: pulseScale,
      transition: {
        duration: 0.1,
        ease: "easeOut"
      }
    },
    speaking: {
      scale: pulseScale,
      transition: {
        duration: 0.1,
        ease: "easeOut"
      }
    },
    transitioning: {
      scale: [1, 0.8, 50],
      opacity: [1, 1, 0],
      transition: {
        duration: 1.5,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const getGradientColors = () => {
    switch (state) {
      case 'listening':
        return 'from-cyan-500 via-blue-500 to-purple-600';
      case 'speaking':
        return 'from-purple-500 via-pink-500 to-orange-500';
      case 'transitioning':
        return 'from-purple-600 via-cyan-400 to-purple-600';
      default:
        return 'from-purple-600 via-violet-500 to-cyan-500';
    }
  };

  const getGlowColor = () => {
    switch (state) {
      case 'listening':
        return 'shadow-[0_0_60px_rgba(6,182,212,0.6),0_0_120px_rgba(59,130,246,0.4)]';
      case 'speaking':
        return 'shadow-[0_0_60px_rgba(168,85,247,0.6),0_0_120px_rgba(236,72,153,0.4)]';
      case 'transitioning':
        return 'shadow-[0_0_100px_rgba(168,85,247,0.8),0_0_200px_rgba(6,182,212,0.6)]';
      default:
        return 'shadow-[0_0_40px_rgba(168,85,247,0.4),0_0_80px_rgba(139,92,246,0.3)]';
    }
  };

  return (
    <button
      type="button"
      className={cn(
        "relative flex items-center justify-center cursor-pointer border-none bg-transparent",
        className
      )}
      onClick={onClick}
    >
      {/* Outer rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn(
            "absolute rounded-full border pointer-events-none",
            state === 'listening' ? 'border-cyan-500/30' : 'border-purple-500/30'
          )}
          style={{
            width: `${100 + i * 40}%`,
            height: `${100 + i * 40}%`,
          }}
          variants={ringVariants}
          animate={state}
          custom={i}
        />
      ))}

      {/* Glow layer */}
      <motion.div
        className={cn(
          "absolute w-full h-full rounded-full blur-2xl pointer-events-none",
          `bg-gradient-to-br ${getGradientColors()}`
        )}
        animate={{
          opacity: state === 'idle' ? 0.4 : 0.6 + activeVolume * 0.4,
          scale: pulseScale * 1.2
        }}
        transition={{ duration: 0.1 }}
      />

      {/* Main orb */}
      <motion.div
        className={cn(
          "relative w-full h-full rounded-full pointer-events-none",
          `bg-gradient-to-br ${getGradientColors()}`,
          getGlowColor(),
          "transition-shadow duration-300"
        )}
        variants={orbVariants}
        animate={state}
      >
        {/* Inner highlight */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
        
        {/* Center glow */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            opacity: state === 'listening' || state === 'speaking' ? 0.8 : 0.5
          }}
        >
          <div className="w-1/3 h-1/3 rounded-full bg-white/30 blur-md" />
        </motion.div>

        {/* Rotating scanner line (when listening) */}
        {state === 'listening' && (
          <motion.div
            className="absolute inset-0 rounded-full overflow-hidden"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute top-0 left-1/2 w-px h-1/2 bg-gradient-to-b from-cyan-400 to-transparent" />
          </motion.div>
        )}
      </motion.div>

      {/* Particle effects around orb */}
      {(state === 'listening' || state === 'speaking') && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400"
              initial={{
                x: 0,
                y: 0,
                opacity: 0
              }}
              animate={{
                x: Math.cos((i / 6) * Math.PI * 2) * (60 + activeVolume * 30),
                y: Math.sin((i / 6) * Math.PI * 2) * (60 + activeVolume * 30),
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeOut"
              }}
            />
          ))}
        </>
      )}
    </button>
  );
};

export default VoiceOrb;
