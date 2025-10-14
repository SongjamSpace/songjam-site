"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useState, useCallback } from "react";

/**
 * NEW WALLET HOOKS:
 * - useSolanaWallet: For Solana-specific functionality (connect, hasMinimumBalance, signMessage)
 * - useBaseWallet: For Base/Ethereum-specific functionality (connect, callContractMethod)
 *
 * @deprecated Use useSolanaWallet or useBaseWallet instead for specific wallet functionality
 * This hook is kept for backward compatibility
 */
export function usePrivyWallet() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const [isSigning, setIsSigning] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  // Find Solana wallet
  const solanaWallet = wallets.find(
    (wallet) => wallet.walletClientType === "solana"
  );

  const connectWallet = useCallback(async () => {
    if (!ready) return;

    if (!authenticated) {
      await login();
    }
  }, [ready, authenticated, login]);

  const signMessage = useCallback(
    async (
      message: string = "Sign this message to participate in the Songjam Pre-Sale"
    ) => {
      if (!solanaWallet) {
        throw new Error("No Solana wallet connected");
      }

      setIsSigning(true);

      try {
        const _signature = await solanaWallet.sign("message");

        setSignature(_signature);
        setIsSigned(true);

        return _signature;
      } catch (error) {
        console.error("Failed to sign message:", error);
        throw error;
      } finally {
        setIsSigning(false);
      }
    },
    [solanaWallet]
  );

  const disconnectWallet = useCallback(async () => {
    await logout();
    setIsSigned(false);
    setSignature(null);
  }, [logout]);

  // Check if user has sufficient SOL balance (mock implementation)
  const hasMinimumBalance = useCallback(
    async (minimumSol: number = 0.1) => {
      if (!solanaWallet) return false;

      try {
        // For now, we'll assume they have enough if wallet is connected
        // In a real implementation, you would use Solana RPC to check balance
        // using the wallet's address: solanaWallet.address
        return true;
      } catch (error) {
        console.error("Failed to check balance:", error);
        return false;
      }
    },
    [solanaWallet]
  );

  return {
    // Auth state
    ready,
    authenticated,
    user,

    // Wallet state
    solanaWallet,
    hasSolanaWallet: !!solanaWallet,

    // Signing state
    isSigning,
    isSigned,
    signature,

    // Actions
    connectWallet,
    signMessage,
    disconnectWallet,
    hasMinimumBalance,
  };
}
