"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface AudioReactiveBackgroundProps {
  inputVolume: number;
  outputVolume: number;
  isConnected: boolean;
  reactToUserInput?: boolean;
}

const LISTENING_COLORS = {
  primary: "#3b82f6", // blue-500
  secondary: "#06b6d4", // cyan-500
  accent: "#8b5cf6", // violet-500
};

const SPEAKING_COLORS = {
  primary: "#f97316", // orange-500
  secondary: "#ef4444", // red-500
  accent: "#ec4899", // pink-500
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

export default function AudioReactiveBackground({
  inputVolume,
  outputVolume,
  isConnected,
  reactToUserInput = false,
}: AudioReactiveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const [currentMode, setCurrentMode] = useState<
    "idle" | "listening" | "speaking"
  >("idle");
  const [gradientRotation, setGradientRotation] = useState(0);
  const smoothedVolumeRef = useRef(0);

  const VOLUME_THRESHOLD = 0.05;
  const PARTICLE_COUNT = 80;

  // Determine current mode
  useEffect(() => {
    if (!isConnected) {
      setCurrentMode("idle");
      return;
    }

    const isListening = reactToUserInput && inputVolume > VOLUME_THRESHOLD;
    const isSpeaking = outputVolume > VOLUME_THRESHOLD;

    if (isSpeaking) {
      setCurrentMode("speaking");
    } else if (isListening) {
      setCurrentMode("listening");
    } else {
      setCurrentMode("idle");
    }
  }, [inputVolume, outputVolume, isConnected, reactToUserInput]);

  // Initialize particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.2,
          color:
            currentMode === "speaking"
              ? SPEAKING_COLORS.primary
              : LISTENING_COLORS.primary,
          life: Math.random(),
          maxLife: 1,
        });
      }
    };

    initParticles();
  }, []);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let time = 0;
    let lastGradientUpdate = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;

      // Update gradient rotation (throttled)
      if (time - lastGradientUpdate > 0.05) {
        setGradientRotation((prev) => prev + 0.5);
        lastGradientUpdate = time;
      }

      // Get active volume
      const activeVolume =
        currentMode === "speaking"
          ? outputVolume
          : currentMode === "listening"
          ? inputVolume
          : 0;

      // Smooth volume
      smoothedVolumeRef.current =
        smoothedVolumeRef.current * 0.8 + activeVolume * 0.2;
      const smoothedVol = smoothedVolumeRef.current;

      const colors =
        currentMode === "speaking" ? SPEAKING_COLORS : LISTENING_COLORS;
      const intensity = Math.min(1, smoothedVol * 4);

      // Update and draw particles
      const particles = particlesRef.current;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      particles.forEach((particle) => {
        // Update particle position with flow field
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Create swirling flow
        const flowStrength = 0.0003 + intensity * 0.0005;
        const swirl = Math.sin(time * 0.5 + dist * 0.01) * flowStrength;

        particle.vx += Math.cos(angle + Math.PI / 2) * swirl * dist;
        particle.vy += Math.sin(angle + Math.PI / 2) * swirl * dist;

        // Add audio-reactive push/pull
        if (intensity > 0.1) {
          const pushStrength = intensity * 0.02;
          particle.vx += (dx / (dist + 1)) * pushStrength * Math.sin(time * 2);
          particle.vy += (dy / (dist + 1)) * pushStrength * Math.sin(time * 2);
        }

        // Damping
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Update life and opacity
        particle.life += 0.01;
        if (particle.life > particle.maxLife) {
          particle.life = 0;
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
        }

        // Dynamic opacity based on audio
        const baseOpacity = particle.opacity;
        const audioBoost = intensity * 0.3;
        const pulse = Math.sin(time * 2 + dist * 0.02) * 0.1;
        const finalOpacity = Math.min(1, baseOpacity + audioBoost + pulse);

        // Draw particle with glow
        ctx.save();
        ctx.globalAlpha = finalOpacity;

        // Outer glow
        const glowGradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 4
        );
        glowGradient.addColorStop(0, colors.primary + "80");
        glowGradient.addColorStop(0.5, colors.secondary + "40");
        glowGradient.addColorStop(1, colors.accent + "00");

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core particle
        ctx.fillStyle = colors.primary;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // Draw connections between nearby particles
      if (isConnected && currentMode !== "idle") {
        ctx.strokeStyle = colors.secondary;
        ctx.lineWidth = 0.5;

        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 150) {
              const opacity = (1 - dist / 150) * 0.3 * (0.5 + intensity * 0.5);
              ctx.globalAlpha = opacity;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
        ctx.globalAlpha = 1;
      }

      // Draw central pulsing orb
      if (isConnected && currentMode !== "idle") {
        const orbSize =
          Math.min(canvas.width, canvas.height) * (0.2 + intensity * 0.3);
        const pulse = Math.sin(time * 3) * 0.1 + 1;
        const finalSize = orbSize * pulse;

        // Outer glow
        const outerGradient = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          finalSize * 2
        );
        outerGradient.addColorStop(
          0,
          colors.primary +
            Math.floor(0.4 * intensity * 255)
              .toString(16)
              .padStart(2, "0")
        );
        outerGradient.addColorStop(
          0.5,
          colors.secondary +
            Math.floor(0.2 * intensity * 255)
              .toString(16)
              .padStart(2, "0")
        );
        outerGradient.addColorStop(1, colors.accent + "00");

        ctx.fillStyle = outerGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, finalSize * 2, 0, Math.PI * 2);
        ctx.fill();

        // Inner orb
        const innerGradient = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          finalSize
        );
        innerGradient.addColorStop(
          0,
          colors.primary +
            Math.floor(0.6 * intensity * 255)
              .toString(16)
              .padStart(2, "0")
        );
        innerGradient.addColorStop(
          0.7,
          colors.secondary +
            Math.floor(0.3 * intensity * 255)
              .toString(16)
              .padStart(2, "0")
        );
        innerGradient.addColorStop(1, colors.accent + "00");

        ctx.fillStyle = innerGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, finalSize, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentMode, isConnected, inputVolume, outputVolume, reactToUserInput]);

  const colors =
    currentMode === "speaking" ? SPEAKING_COLORS : LISTENING_COLORS;

  return (
    <motion.div
      className="fixed inset-0 -z-10 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: isConnected ? 1 : 0.3 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {/* Base gradient layer */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background:
            isConnected && currentMode !== "idle"
              ? `radial-gradient(ellipse 80% 50% at 50% 50%, ${colors.primary}15 0%, ${colors.secondary}08 40%, transparent 70%)`
              : "transparent",
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      {/* Rotating gradient overlay */}
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: isConnected && currentMode !== "idle" ? 0.4 : 0,
          background: `conic-gradient(from ${gradientRotation}deg at 50% 50%, ${colors.primary}10, ${colors.secondary}08, ${colors.accent}10, ${colors.primary}10)`,
        }}
        transition={{ duration: 0.1 }}
      />

      {/* Canvas for particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: "transparent" }}
      />

      {/* Animated mesh overlay */}
      {isConnected && currentMode !== "idle" && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, ${colors.primary}20 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, ${colors.secondary}20 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, ${colors.accent}15 0%, transparent 60%)
            `,
            backgroundSize: "200% 200%",
            animation: "meshMove 20s ease-in-out infinite",
          }}
        />
      )}

      <style jsx>{`
        @keyframes meshMove {
          0%,
          100% {
            background-position: 0% 0%, 100% 100%, 50% 50%;
          }
          50% {
            background-position: 100% 100%, 0% 0%, 50% 50%;
          }
        }
      `}</style>
    </motion.div>
  );
}
