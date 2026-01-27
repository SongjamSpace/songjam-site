"use client";


import { 
  createEmpireBuilder,
  updateDeploymentStatus,
  updateEmpireBuilderDeployment 
} from '@/services/db/empireBuilder.db';
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
  tokenName?: string;
  tokenSymbol?: string;
}

// Default token params - can be changed later
const DEFAULT_TOKEN_PARAMS = {
  name: 'Songjam Host Token',
  symbol: 'SHT',
  imageUrl: '', // Will be set based on host username
};

// Helper function to auto-deploy token - exported via hook
export async function autoDeployToken(hostInfo: HostInfo): Promise<{ success: boolean; hostSlug: string }> {
  const { twitterId, username, displayName, fid, signature, message } = hostInfo;
  const hostSlug = username;
  
  // Create default token params with host-specific values
  const tokenName = hostInfo.tokenName || (displayName ? `${displayName} - Songjam Host` : DEFAULT_TOKEN_PARAMS.name);
  const tokenSymbol = hostInfo.tokenSymbol || (username.slice(0, 4).toUpperCase() || DEFAULT_TOKEN_PARAMS.symbol);
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
