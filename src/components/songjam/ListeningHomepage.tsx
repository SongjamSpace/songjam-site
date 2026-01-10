"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConversation } from "@elevenlabs/react";
import { Mic, MicOff } from "lucide-react";
import VoiceOrb from "./VoiceOrb";

interface ListeningHomepageProps {
  onStartSpace: () => Promise<{ success: boolean }>;
}

type AgentState = 'disconnected' | 'connecting' | 'connected' | 'disconnecting' | null;

export const ListeningHomepage = ({ onStartSpace }: ListeningHomepageProps) => {
  const [agentState, setAgentState] = useState<AgentState>('disconnected');
  const [orbState, setOrbState] = useState<'idle' | 'listening' | 'speaking' | 'transitioning'>('idle');
  const [inputVolume, setInputVolume] = useState(0);
  const [outputVolume, setOutputVolume] = useState(0);
  const [statusText, setStatusText] = useState('Tap to Talk');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const animationFrameRef = useRef<number | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log("ElevenLabs Connected");
      setAgentState('connected');
      setOrbState('listening');
      setStatusText('Listening...');
    },
    onDisconnect: () => {
      console.log("ElevenLabs Disconnected");
      setAgentState('disconnected');
      setOrbState('idle');
      setStatusText('Tap to Talk');
    },
    onMessage: (message) => console.log("Message:", message),
    onError: (error) => {
      console.error("ElevenLabs Error:", error);
      setAgentState('disconnected');
      setOrbState('idle');
      setStatusText('Tap to Talk');
    },
    clientTools: {
      start_space: async () => {
        console.log("Client tool start_space triggered!");
        setOrbState('transitioning');
        setStatusText('Creating Space...');
        
        const result = await onStartSpace();
        if (!result.success) {
          setOrbState('listening');
          setStatusText('Listening...');
        }
        return result.success ? "Space created successfully" : "Failed to create space";
      }
    }
  });

  // Volume monitoring loop
  useEffect(() => {
    if (agentState !== 'connected') {
      setInputVolume(0);
      setOutputVolume(0);
      return;
    }

    const updateVolumes = () => {
      const rawInput = conversation.getInputVolume?.() ?? 0;
      const rawOutput = conversation.getOutputVolume?.() ?? 0;
      
      const normalizedInput = Math.min(1.0, Math.pow(rawInput, 0.5) * 2.5);
      const normalizedOutput = Math.min(1.0, Math.pow(rawOutput, 0.5) * 2.5);

      setInputVolume(normalizedInput);
      setOutputVolume(normalizedOutput);

      // Update orb state based on which is louder
      if (normalizedOutput > normalizedInput && normalizedOutput > 0.05) {
        setOrbState('speaking');
        setStatusText('Speaking...');
      } else if (normalizedInput > 0.05) {
        setOrbState('listening');
        setStatusText('Listening...');
      } else if (agentState === 'connected') {
        setOrbState('listening');
        setStatusText('Listening...');
      }

      animationFrameRef.current = requestAnimationFrame(updateVolumes);
    };

    updateVolumes();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [agentState, conversation]);

  const startConversation = useCallback(async () => {
    try {
      setErrorMessage(null);
      setAgentState('connecting');
      setStatusText('Connecting...');
      
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ADAM_AGENT!,
        connectionType: 'webrtc',
        onStatusChange: (status) => {
          setAgentState(status.status);
        }
      });
    } catch (error) {
      console.error("Error starting conversation:", error);
      setAgentState('disconnected');
      setOrbState('idle');
      setStatusText('Tap to Talk');
      
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setErrorMessage('Please enable microphone permissions');
      }
    }
  }, [conversation]);

  const handleOrbClick = useCallback(() => {
    if (orbState === 'transitioning') return;

    if (agentState === 'disconnected' || agentState === null) {
      startConversation();
    } else if (agentState === 'connected') {
      conversation.endSession();
    }
  }, [agentState, orbState, conversation, startConversation]);

  return (
    <div className="relative min-h-screen w-full bg-slate-950 overflow-hidden flex flex-col items-center justify-center">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-slate-950 to-purple-950/30" />
      
      {/* Animated grid background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Radial glow behind orb */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-gradient-radial from-purple-500/20 via-transparent to-transparent blur-3xl"
        animate={{
          scale: orbState === 'idle' ? [1, 1.1, 1] : 1.2,
          opacity: orbState === 'idle' ? [0.3, 0.5, 0.3] : 0.6
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main content */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Logo / Title */}
        <motion.div
          className="text-center mb-8"
          animate={{
            opacity: orbState === 'transitioning' ? 0 : 1,
            scale: orbState === 'transitioning' ? 0.8 : 1
          }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Songjam
          </h1>
          <p className="text-slate-400 text-lg">Voice-first social space</p>
        </motion.div>

        {/* Voice Orb */}
        <motion.div
          animate={{
            scale: orbState === 'transitioning' ? 2 : 1
          }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <VoiceOrb
            state={orbState}
            inputVolume={inputVolume}
            outputVolume={outputVolume}
            onClick={handleOrbClick}
            className="w-48 h-48 md:w-64 md:h-64"
          />
        </motion.div>

        {/* Status text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={statusText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-slate-300"
          >
            {agentState === 'connected' ? (
              <Mic className="w-4 h-4 text-cyan-400" />
            ) : (
              <MicOff className="w-4 h-4 text-slate-500" />
            )}
            <span className="text-lg font-medium">{statusText}</span>
          </motion.div>
        </AnimatePresence>

        {/* Error message */}
        <AnimatePresence>
          {errorMessage && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-red-400 text-sm"
            >
              {errorMessage}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Instruction text */}
        <motion.p
          className="text-slate-500 text-sm max-w-md text-center mt-4"
          animate={{
            opacity: orbState === 'transitioning' ? 0 : 1
          }}
        >
          Say &quot;Start a space&quot; to create an AI-powered social room
        </motion.p>
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-purple-400/30"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, -20, null],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ListeningHomepage;
