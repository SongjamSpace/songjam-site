"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import {
  useWallets,
  type UiWallet,
  type UiWalletAccount,
} from "@wallet-standard/react";
import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  address,
} from "@solana/kit";
import { StandardConnect } from "@wallet-standard/core";

// Create RPC connection
const RPC_ENDPOINT = "https://api.mainnet.solana.com";
const WS_ENDPOINT = "wss://api.mainnet.solana.com";
const chain = "solana:mainnet";
const rpc = createSolanaRpc(RPC_ENDPOINT);
const ws = createSolanaRpcSubscriptions(WS_ENDPOINT);

interface SolanaContextState {
  // RPC
  rpc: ReturnType<typeof createSolanaRpc>;
  ws: ReturnType<typeof createSolanaRpcSubscriptions>;
  chain: typeof chain;

  // Wallet State
  wallets: UiWallet[];
  selectedWallet: UiWallet | null;
  selectedAccount: UiWalletAccount | null;
  isConnected: boolean;

  // Wallet Actions
  setWalletAndAccount: (
    wallet: UiWallet | null,
    account: UiWalletAccount | null
  ) => void;

  // Compatibility layer for hybrid-target
  authenticated: boolean;
  solanaWallet: UiWalletAccount | null;
  hasSolanaWallet: boolean;
  isSigning: boolean;
  isSigned: boolean;
  signature: string | null;
  connectWallet: () => Promise<void>;
  signMessage: (message: string) => Promise<void>;
  hasMinimumBalance: (minBalance: number) => Promise<boolean>;
}

const SolanaContext = createContext<SolanaContextState | undefined>(undefined);

export function useSolana() {
  const context = useContext(SolanaContext);
  if (!context) {
    throw new Error("useSolana must be used within a SolanaProvider");
  }
  return context;
}

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  const allWallets = useWallets();

  // Filter for Solana wallets only that support signAndSendTransaction
  const wallets = useMemo(() => {
    return allWallets.filter(
      (wallet) =>
        wallet.chains?.some((c) => c.startsWith("solana:")) &&
        wallet.features.includes(StandardConnect) &&
        wallet.features.includes("solana:signAndSendTransaction")
    );
  }, [allWallets]);

  // State management
  const [selectedWallet, setSelectedWallet] = useState<UiWallet | null>(null);
  const [selectedAccount, setSelectedAccount] =
    useState<UiWalletAccount | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  // Check if connected (account must exist in the wallet's accounts)
  const isConnected = useMemo(() => {
    if (!selectedAccount || !selectedWallet) return false;

    // Find the wallet and check if it still has this account
    const currentWallet = wallets.find((w) => w.name === selectedWallet.name);
    return !!(
      currentWallet &&
      currentWallet.accounts.some(
        (acc) => acc.address === selectedAccount.address
      )
    );
  }, [selectedAccount, selectedWallet, wallets]);

  const setWalletAndAccount = (
    wallet: UiWallet | null,
    account: UiWalletAccount | null
  ) => {
    setSelectedWallet(wallet);
    setSelectedAccount(account);
  };

  // Connect wallet function
  const connectWallet = async () => {
    debugger;
    if (wallets.length === 0) {
      throw new Error("No Solana wallets detected");
    }

    // For now, connect to the first available wallet
    // In a real app, you might want to show a wallet selector
    const wallet = wallets[0];

    if (!wallet.features.includes(StandardConnect)) {
      throw new Error("Wallet does not support StandardConnect");
    }

    try {
      // Access the StandardConnect feature using the wallet-standard pattern
      const features = wallet.features as Record<string, any>;
      const connectFeature = features[StandardConnect];

      if (!connectFeature || typeof connectFeature.connect !== "function") {
        throw new Error("Invalid StandardConnect feature");
      }

      const accounts = await connectFeature.connect();

      if (accounts && accounts.length > 0) {
        setSelectedWallet(wallet);
        setSelectedAccount(accounts[0]);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  };

  // Sign message function
  const signMessage = async (message: string) => {
    if (!selectedWallet || !selectedAccount) {
      throw new Error("No wallet connected");
    }

    if (!selectedWallet.features.includes("solana:signMessage")) {
      throw new Error("Wallet does not support message signing");
    }

    setIsSigning(true);
    try {
      const signMessageFeature = (selectedWallet.features as any)[
        "solana:signMessage"
      ];
      const encoder = new TextEncoder();
      const messageBytes = encoder.encode(message);

      const result = await signMessageFeature.signMessage({
        account: selectedAccount,
        message: messageBytes,
      });

      if (result && result[0]) {
        const sig = result[0].signature;
        // Convert signature bytes to base58 string
        const sigString = Array.from(sig as Uint8Array)
          .map((b: number) => b.toString(16).padStart(2, "0"))
          .join("");

        setSignature(sigString);
        setIsSigned(true);
      }
    } catch (error) {
      console.error("Failed to sign message:", error);
      throw error;
    } finally {
      setIsSigning(false);
    }
  };

  // Check minimum balance function
  const hasMinimumBalance = async (minBalance: number): Promise<boolean> => {
    if (!selectedAccount) {
      return false;
    }

    try {
      const accountAddress = address(selectedAccount.address);
      const balance = await rpc.getBalance(accountAddress).send();

      // Convert lamports to SOL (1 SOL = 1e9 lamports)
      const balanceInSol = Number(balance) / 1e9;

      return balanceInSol >= minBalance;
    } catch (error) {
      console.error("Failed to check balance:", error);
      return false;
    }
  };

  // Create context value
  const contextValue = useMemo<SolanaContextState>(
    () => ({
      // Static RPC values
      rpc,
      ws,
      chain,

      // Dynamic wallet values
      wallets,
      selectedWallet,
      selectedAccount,
      isConnected,
      setWalletAndAccount,

      // Compatibility layer for hybrid-target
      authenticated: isConnected,
      solanaWallet: selectedAccount,
      hasSolanaWallet: !!selectedAccount,
      isSigning,
      isSigned,
      signature,
      connectWallet,
      signMessage,
      hasMinimumBalance,
    }),
    [
      wallets,
      selectedWallet,
      selectedAccount,
      isConnected,
      isSigning,
      isSigned,
      signature,
    ]
  );

  return (
    <SolanaContext.Provider value={contextValue}>
      {children}
    </SolanaContext.Provider>
  );
}
