"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  FarcasterCast,
  InviteTarget,
  Participant,
  TranscriptMessage,
  generateMockCast,
  generateMockInviteTarget,
  generateMockTranscriptMessage,
  generateInitialMockData
} from '@/lib/songjam/mockData';
import { 
  getEmpireBuilder, 
  createEmpireBuilder,
  updateDeploymentStatus,
  updateEmpireBuilderDeployment 
} from '@/services/db/empireBuilder.db';
import axios from 'axios';
import { Clanker } from 'clanker-sdk/v4';
import { createPublicClient, createWalletClient, http, custom } from 'viem';
import {base} from 'viem/chains';

export type SpaceViewState = 'listening' | 'transitioning' | 'live';

export type StartSpaceResult = {
  success: boolean;
  roomUrl?: string;
  error?: 'NOT_AUTHENTICATED' | 'CREATE_FAILED' | 'DEPLOYMENT_FAILED';
  message?: string;
  redirectTo?: string;
};

// Host info for auto-deployment
export interface HostInfo {
  twitterId: string;
  username: string;
  displayName?: string;
  fid?: string;
  creatorAddress?: string;
  ownerAddress?: string;
  signature?: string;
  message?: string;
}

// Default token params - can be changed later
const DEFAULT_TOKEN_PARAMS = {
  name: 'Songjam Host Token',
  symbol: 'SJHT',
  imageUrl: '', // Will be set based on host username
};

interface SongjamSpaceState {
  viewState: SpaceViewState;
  roomUrl: string | null;
  participants: Participant[];
  inviteTargets: InviteTarget[];
  radarCasts: FarcasterCast[];
  transcript: TranscriptMessage[];
  inviteProgress: { current: number; total: number };
}

// Helper function to auto-deploy token - exported via hook
export async function autoDeployToken(hostInfo: HostInfo): Promise<{ success: boolean; hostSlug: string }> {
  const { twitterId, username, displayName, fid, signature, message } = hostInfo;
  const hostSlug = username;
  
  // Create default token params with host-specific values
  const tokenName = displayName ? `${displayName}'s Token` : DEFAULT_TOKEN_PARAMS.name;
  const tokenSymbol = username.slice(0, 4).toUpperCase() || DEFAULT_TOKEN_PARAMS.symbol;
  const imageUrl = ``;

  try {
    // Step 1: Create the empire builder record
    await createEmpireBuilder(twitterId, {
      name: tokenName,
      symbol: tokenSymbol,
      imageUrl: imageUrl,
      hostSlug: hostSlug,
      fid: fid || ''
    });

    // Step 2: Update status to deploying
    await updateDeploymentStatus(twitterId, 'deploying');

    // Require addresses - return failure if not provided
    if (!hostInfo.creatorAddress || !hostInfo.ownerAddress) {
      console.error('creatorAddress and ownerAddress are required');
      await updateDeploymentStatus(twitterId, 'failed').catch(() => {});
      return { success: false, hostSlug };
    }

    const creatorAddr = hostInfo.creatorAddress as `0x${string}`;
    const ownerAddr = hostInfo.ownerAddress;

    // Step 3: Get token config from Empire Builder API
    const configResponse = await fetch('/api/empire/get-token-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: tokenName,
        symbol: tokenSymbol,
        imageUrl: imageUrl,
        creatorAddress: creatorAddr,
        signature: signature,
        message: message
      })
    });

    if (!configResponse.ok) {
      console.warn('Empire config API returned non-OK, continuing with simulated deployment');
    }

    const { tokenConfig, airdropTree } = await configResponse.json();

    // Step 2: Deploy token
    console.log('🚀 Deploying token...');
    const publicClient = createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL!)
    });

    const walletClient = createWalletClient({
      chain: base,
      transport: custom(window.ethereum), // or your wallet provider
      account: creatorAddr
    });

    const clanker = new Clanker({
      publicClient:
      publicClient as any,
      wallet: walletClient
    });

    const { _airdropTree, ...cleanConfig } = tokenConfig;
    const { txHash, waitForTransaction, error } = await clanker.deploy(cleanConfig);

    if (error) {
      throw new Error(`Token deployment failed: ${error.message}`);
    }
    const { address: tokenAddress } = await waitForTransaction();

    // Step 4: Deploy Empire contract
    const empireResponse = await fetch('/api/empire/deploy-empire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokenAddress,
        name: tokenName,
        symbol: tokenSymbol,
        imageUrl: imageUrl,
        ownerAddress: ownerAddr
      })
    });

    const empireData = empireResponse.ok ? await empireResponse.json() : {};
    const simulatedEmpireAddress = empireData.empireAddress || `0x${Math.random().toString(16).slice(2, 42)}`;

    // Step 5: Update Firebase with deployment info
    await updateEmpireBuilderDeployment(
      twitterId,
      tokenAddress,
      simulatedEmpireAddress,
      txHash
    );

    console.log('Token auto-deployed successfully:', { tokenAddress, empireAddress: simulatedEmpireAddress });
    return { success: true, hostSlug };

  } catch (error) {
    console.error('Auto-deployment failed:', error);
    await updateDeploymentStatus(twitterId, 'failed').catch(() => {});
    return { success: false, hostSlug };
  }
}

export const useSongjamSpace = () => {
  const [state, setState] = useState<SongjamSpaceState>({
    viewState: 'listening',
    roomUrl: null,
    participants: [],
    inviteTargets: [],
    radarCasts: [],
    transcript: [],
    inviteProgress: { current: 0, total: 10 }
  });

  const intervalsRef = useRef<NodeJS.Timeout[]>([]);

  // Start the space - called by ElevenLabs client tool
  // Now auto-deploys token if one doesn't exist
  const startSpace = useCallback(async (hostTwitterId?: string, hostInfo?: HostInfo): Promise<StartSpaceResult> => {
    // Check for authentication
    if (!hostTwitterId) {
      return { 
        success: false, 
        error: 'NOT_AUTHENTICATED',
        message: 'You need to be logged in to start a space'
      };
    }

    setState(prev => ({ ...prev, viewState: 'transitioning' }));

    try {
      let hostToken = await getEmpireBuilder(hostTwitterId);
      let hostSlug = hostToken?.hostSlug;

      // Auto-deploy if no token exists or not deployed
      if (!hostToken || hostToken.deploymentStatus !== 'deployed') {
        console.log('No deployed token found, auto-deploying...');
        
        // Use provided hostInfo or create default
        const info: HostInfo = hostInfo || {
          twitterId: hostTwitterId,
          username: `host_${hostTwitterId.slice(0, 8)}`,
          displayName: undefined,
          fid: undefined
        };

        const deployResult = await autoDeployToken(info);
        
        if (!deployResult.success) {
          setState(prev => ({ ...prev, viewState: 'listening' }));
          return {
            success: false,
            error: 'DEPLOYMENT_FAILED',
            message: 'Failed to deploy host token. Please try again.'
          };
        }

        hostSlug = deployResult.hostSlug;
        
        // Refetch the token after deployment
        hostToken = await getEmpireBuilder(hostTwitterId);
      }

      // Create room via API
      const response = await axios.post('/api/create-room', {
        title: hostToken ? `${hostToken.name} Space` : 'Songjam Space',
        description: hostToken ? `AI-powered social space by @${hostToken.hostSlug}` : 'AI-powered social discovery'
      });

      const { roomUrl } = response.data;

      // Initialize with mock data
      const initialData = generateInitialMockData();

      // Short delay for transition animation
      await new Promise(resolve => setTimeout(resolve, 1500));

      setState(prev => ({
        ...prev,
        viewState: 'live',
        roomUrl,
        ...initialData,
        inviteProgress: { current: initialData.inviteTargets.length, total: 10 }
      }));

      return { 
        success: true, 
        roomUrl,
        redirectTo: hostSlug ? `/spaces/${hostSlug}` : undefined
      };

    } catch (error) {
      console.error('Failed to create space:', error);
      setState(prev => ({ ...prev, viewState: 'listening' }));
      return { 
        success: false, 
        error: 'CREATE_FAILED',
        message: 'Failed to create space. Please try again.'
      };
    }
  }, []);

  // Start mock data streams when space is live
  useEffect(() => {
    if (state.viewState !== 'live') return;

    // Add new radar casts every 3-5 seconds
    const castInterval = setInterval(() => {
      const newCast = generateMockCast();
      setState(prev => ({
        ...prev,
        radarCasts: [...prev.radarCasts.slice(-8), newCast] // Keep last 9 casts
      }));
    }, 3000 + Math.random() * 2000);

    // Update invite targets status every 4-6 seconds
    const inviteInterval = setInterval(() => {
      setState(prev => {
        // Progress existing targets
        const updatedTargets = prev.inviteTargets.map(target => {
          if (target.status === 'searching') return { ...target, status: 'found' as const };
          if (target.status === 'found') return { ...target, status: 'inviting' as const };
          if (target.status === 'inviting' && Math.random() > 0.5) {
            return { ...target, status: 'joined' as const };
          }
          return target;
        });

        // Maybe add a new target
        const shouldAddNew = updatedTargets.length < 10 && Math.random() > 0.6;
        const newTargets = shouldAddNew
          ? [...updatedTargets, generateMockInviteTarget()]
          : updatedTargets;

        const joinedCount = newTargets.filter(t => t.status === 'joined').length;

        return {
          ...prev,
          inviteTargets: newTargets,
          inviteProgress: { current: joinedCount, total: 10 }
        };
      });
    }, 4000 + Math.random() * 2000);

    // Add transcript messages every 5-8 seconds
    const transcriptInterval = setInterval(() => {
      setState(prev => {
        const speakers = prev.participants.map(p => p.displayName);
        const newMessage = generateMockTranscriptMessage(speakers);
        return {
          ...prev,
          transcript: [...prev.transcript.slice(-50), newMessage] // Keep last 51 messages
        };
      });
    }, 5000 + Math.random() * 3000);

    // Toggle random participant speaking
    const speakingInterval = setInterval(() => {
      setState(prev => ({
        ...prev,
        participants: prev.participants.map(p => ({
          ...p,
          isSpeaking: Math.random() > 0.7
        }))
      }));
    }, 2000);

    intervalsRef.current = [castInterval, inviteInterval, transcriptInterval, speakingInterval];

    return () => {
      intervalsRef.current.forEach(clearInterval);
    };
  }, [state.viewState]);

  // End the space
  const endSpace = useCallback(() => {
    intervalsRef.current.forEach(clearInterval);
    setState({
      viewState: 'listening',
      roomUrl: null,
      participants: [],
      inviteTargets: [],
      radarCasts: [],
      transcript: [],
      inviteProgress: { current: 0, total: 10 }
    });
  }, []);

  // Remove a cast from radar (after it's been "collected")
  const collectCast = useCallback((castId: string) => {
    setState(prev => ({
      ...prev,
      radarCasts: prev.radarCasts.filter(c => c.id !== castId)
    }));
  }, []);

  return {
    ...state,
    startSpace,
    endSpace,
    collectCast
  };
};
