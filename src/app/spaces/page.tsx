"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import VoiceOrb from "@/components/songjam/VoiceOrb";
import { useConversation } from "@elevenlabs/react";
import { NeynarAuthButton, useNeynarContext, SIWN_variant } from "@neynar/react";
import { subscribeToActiveRoom, MSRoom } from "@/services/db/msRooms.db";
import { useSongjamSpace, autoDeployToken } from "@/hooks/useSongjamSpace";
import { getEmpireBuilder } from "@/services/db/empireBuilder.db";
import { useEthWallet } from "@/lib/hooks/useEthWallet";

type AgentState = 'disconnected' | 'connecting' | 'connected' | 'disconnecting' | null;

export default function SpacesPage() {
  const router = useRouter();
  const { user: neynarUser, isAuthenticated } = useNeynarContext();
  const { startSpace } = useSongjamSpace();
  const { walletAddress, isConnected, isSigning, connectWallet, signMessage } = useEthWallet();

  // Get the host's fid for token check
  const hostFid = neynarUser?.fid?.toString();

  // Voice agent state
  const [agentState, setAgentState] = useState<AgentState>('disconnected');
  const [orbState, setOrbState] = useState<'idle' | 'listening' | 'speaking' | 'transitioning'>('idle');
  const [inputVolume, setInputVolume] = useState(0);
  const [outputVolume, setOutputVolume] = useState(0);
  const [statusText, setStatusText] = useState('Tap to Talk');
  const [activeSpaces, setActiveSpaces] = useState<MSRoom[]>([]);
  const [isTokenDeployed, setIsTokenDeployed] = useState<boolean>(false);
  const [isDeploying, setIsDeploying] = useState(false);
  
  const animationFrameRef = useRef<number | null>(null);
  const conversationRef = useRef<ReturnType<typeof useConversation> | null>(null);

  console.log({
      isFarcasterConnected: isConnected,
      isTokenDeployed: !!isTokenDeployed,
      hostName: neynarUser?.display_name || neynarUser?.username || '',
  })

  // ElevenLabs conversation setup
  const conversation = useConversation({
    dynamicVariables: {
      isFarcasterConnected: isConnected,
      isTokenDeployed: !!isTokenDeployed,
      hostName: neynarUser?.display_name || neynarUser?.username || '',
    },
    onConnect: () => {
      setAgentState('connected');
      setOrbState('listening');
      setStatusText('Listening...');
    },
    onDisconnect: () => {
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
  });

  conversationRef.current = conversation;

  // Subscribe to active spaces
  useEffect(() => {
    const unsubscribe = subscribeToActiveRoom("songjam_space", (room) => {
      if (room) {
        setActiveSpaces([room]);
      } else {
        setActiveSpaces([]);
      }
    });
    return unsubscribe;
  }, []);

  // Check if token is already deployed
  useEffect(() => {
    const checkTokenDeployment = async () => {
      if (!hostFid) {
        setIsTokenDeployed(false);
        return;
      }
      try {
        const empireBuilder = await getEmpireBuilder(hostFid);
        setIsTokenDeployed(empireBuilder?.deploymentStatus === 'deployed');
      } catch (error) {
        console.error('Error checking token deployment:', error);
        setIsTokenDeployed(false);
      }
    };
    checkTokenDeployment();
  }, [hostFid]);

  // Volume monitoring loop
  useEffect(() => {
    if (agentState !== 'connected') {
      setInputVolume(0);
      setOutputVolume(0);
      return;
    }

    const updateVolumes = () => {
      const conv = conversationRef.current;
      const rawInput = conv?.getInputVolume?.() ?? 0;
      const rawOutput = conv?.getOutputVolume?.() ?? 0;

      const normalizedInput = Math.min(1.0, Math.pow(rawInput, 0.5) * 2.5);
      const normalizedOutput = Math.min(1.0, Math.pow(rawOutput, 0.5) * 2.5);

      setInputVolume(normalizedInput);
      setOutputVolume(normalizedOutput);

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
  }, [agentState]);

  const startConversation = useCallback(async () => {
    try {
      setAgentState('connecting');
      setStatusText('Connecting...');

      await navigator.mediaDevices.getUserMedia({ audio: true });

      await conversation.startSession({
        agentId: 'agent_3201kes1g6w6fhbrna2t2yv26rkv',
        connectionType: 'websocket',
        clientTools: {
          start_space: async () => {
            setOrbState('transitioning');
            setStatusText('Creating Space...');
            
            // Build hostInfo for auto-deployment
            const hostInfo = hostFid ? {
              twitterId: hostFid,
              username: neynarUser?.username || `host_${hostFid.slice(0, 8)}`,
              displayName: neynarUser?.display_name || undefined,
              fid: neynarUser?.fid?.toString()
            } : undefined;
            
            const result = await startSpace(hostFid, hostInfo);
            
            if (!result.success) {
              setOrbState('listening');
              
              if (result.error === 'NOT_AUTHENTICATED') {
                setStatusText('Please login');
                return 'You need to be logged in to start a space';
              }
              
              if (result.error === 'DEPLOYMENT_FAILED') {
                setStatusText('Deployment failed');
                return result.message || 'Failed to deploy token';
              }
              
              setStatusText('Failed');
              return result.message || 'Failed to create space';
            }
            
            // Redirect to the host's dedicated space page
            if (result.redirectTo) {
              router.push(result.redirectTo);
            }
            
            return 'Space created successfully';
          }
        }
      });
    } catch (error) {
      console.error("Error starting conversation:", error);
      setAgentState('disconnected');
      setOrbState('idle');
      setStatusText('Tap to Talk');
    }
  }, [conversation, hostFid, router, startSpace, neynarUser]);

  const handleOrbClick = useCallback(() => {
    if (orbState === 'transitioning') return;

    if (agentState === 'disconnected' || agentState === null) {
      startConversation();
    } else if (agentState === 'connected') {
      conversation.endSession();
    }
  }, [agentState, orbState, conversation, startConversation]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col max-w-[1200px] mx-auto">
      <header className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Songjam
            </h1>
            <p className="text-sm text-slate-400">Voice-first social space</p>
          </div>
          
          {isAuthenticated && neynarUser ? (
            <div className="flex flex-col items-end">
              <span className="px-3 py-1.5 text-sm font-medium bg-slate-800/80 text-cyan-400 rounded-full border border-slate-700/50">
                @{neynarUser.username}
              </span>
              <span className="text-xs text-slate-500 mt-1">
                {walletAddress 
                  ? `${walletAddress.slice(0, 2)}...${walletAddress.slice(-4)}`
                  : 'wallet not connected'}
              </span>
            </div>
          ) : (
            <NeynarAuthButton variant={SIWN_variant.FARCASTER} />
          )}
        </div>
      </header>

      {/* Deploy Empire Builder Token Section - Only show if not deployed */}
      {isTokenDeployed === false && (
      <section className="px-6 mb-6">
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900/40 to-cyan-900/40 border border-purple-500/30 hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🚀</span>
                <h2 className="text-lg font-semibold text-white">Empire Builder Token</h2>
              </div>
              <p className="text-sm text-slate-400">
                {!isConnected 
                  ? 'Connect your wallet to deploy your token'
                  : 'Deploy your token to power your space economy'}
              </p>
            </div>
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <span>Connect Wallet</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                  {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                </span>
                <button
                  onClick={async () => {
                    if (!hostFid || !walletAddress) return;
                    setIsDeploying(true);
                    try {
                      // Sign message before deployment
                      const deployMessage = `Authorize token deployment for ${neynarUser?.username || hostFid}`;
                      const signResult = await signMessage(deployMessage);
                      
                      if (!signResult) {
                        console.error('Signing cancelled or failed');
                        return;
                      }

                      const result = await autoDeployToken({
                        twitterId: hostFid,
                        username: neynarUser?.username || `host_${hostFid.slice(0, 8)}`,
                        displayName: neynarUser?.display_name || undefined,
                        fid: neynarUser?.fid?.toString(),
                        creatorAddress: walletAddress,
                        ownerAddress: walletAddress,
                        signature: signResult.signature,
                        message: signResult.message,
                      });
                      if (result.success) {
                        setIsTokenDeployed(true);
                      }
                    } catch (error) {
                      console.error('Deployment failed:', error);
                    } finally {
                      setIsDeploying(false);
                    }
                  }}
                  disabled={isDeploying || isSigning}
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{isSigning ? 'Signing...' : isDeploying ? 'Deploying...' : 'Deploy'}</span>
                  {!isDeploying && !isSigning && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      )}

      {/* Live Spaces Section */}
      <main className="flex-1 px-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-lg font-semibold text-white">Live Spaces</h2>
            <span className="px-2 py-0.5 text-xs font-medium bg-cyan-500/20 text-cyan-400 rounded-full">
              {activeSpaces.length}
            </span>
          </div>

          {activeSpaces.length > 0 ? (
            <div className="space-y-3">
              {activeSpaces.map((space) => (
                <motion.div
                  key={space.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-purple-500/40 transition-colors cursor-pointer"
                  onClick={() => router.push(`/spaces/${neynarUser?.username}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">
                        {space.hostName}&apos;s Space
                      </h3>
                      <p className="text-sm text-slate-500">
                        @{space.hostName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-cyan-400 text-sm">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      Live
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">No active spaces</p>
              <p className="text-sm text-slate-600 mt-1">
                Tap the orb below to create one
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Orb Section */}
      <footer className="p-8 pb-12">
        <div className="flex flex-col items-center gap-4">
          <VoiceOrb
            state={orbState}
            inputVolume={inputVolume}
            outputVolume={outputVolume}
            onClick={handleOrbClick}
            className="w-20 h-20"
          />
          
          <AnimatePresence mode="wait">
            <motion.span
              key={statusText}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-sm text-slate-400"
            >
              {statusText}
            </motion.span>
          </AnimatePresence>
        </div>
      </footer>
    </div>
  );
}
