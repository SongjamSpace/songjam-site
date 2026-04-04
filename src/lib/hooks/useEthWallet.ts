"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useState, useCallback } from "react";

/**
 * Hook for ETH wallet operations via Privy
 * Provides wallet connection and message signing for Base chain
 */
export function useEthWallet() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const [isSigning, setIsSigning] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [signedMessage, setSignedMessage] = useState<string | null>(null);

  // Find the first ETH-compatible wallet (embedded or external)
  const ethWallet = wallets.find(
    (wallet) => wallet.walletClientType !== "solana"
  );

  const walletAddress = ethWallet?.address || null;
  const isConnected = !!ethWallet && authenticated;

  const connectWallet = useCallback(async () => {
    if (!ready) return;

    if (!authenticated) {
      await login();
    } else {
      await logout();
    }
  }, [ready, authenticated, login]);

  const signMessage = useCallback(
    async (message: string): Promise<{ signature: string; message: string } | null> => {
      if (!ethWallet) {
        throw new Error("No ETH wallet connected");
      }

      setIsSigning(true);

      try {
        // Get the provider from the wallet
        const provider = await ethWallet.getEthereumProvider();
        
        // Sign the message using personal_sign
        const sig = await provider.request({
          method: "personal_sign",
          params: [message, ethWallet.address],
        });

        setSignature(sig as string);
        setSignedMessage(message);

        return { signature: sig as string, message };
      } catch (error) {
        console.error("Failed to sign message:", error);
        throw error;
      } finally {
        setIsSigning(false);
      }
    },
    [ethWallet]
  );

  const disconnectWallet = useCallback(async () => {
    await logout();
    setSignature(null);
    setSignedMessage(null);
  }, [logout]);

  return {
    // Auth state
    ready,
    authenticated,
    user,

    // Wallet state
    ethWallet,
    walletAddress,
    isConnected,

    // Signing state
    isSigning,
    signature,
    signedMessage,

    // Actions
    connectWallet,
    signMessage,
    disconnectWallet,
  };
}
