"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { useState } from "react";
import { base } from "viem/chains";
// import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "your-privy-app-id"}
      config={{
        // Configure supported chains including Solana
        supportedChains: [base],
        // Configure login methods
        loginMethods: ["wallet"],
        // externalWallets: {
        //   solana: {
        //     // connectors: toSolanaWalletConnectors(),
        //   },
        // },
        // Appearance configuration
        appearance: {
          walletChainType: "ethereum-and-solana",
          theme: "dark",
          accentColor: "#8B5CF6",
          logo: "https://your-logo-url.com/logo.png",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </PrivyProvider>
  );
}
