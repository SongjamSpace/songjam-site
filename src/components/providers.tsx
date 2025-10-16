"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { SolanaProvider } from "./solana-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SolanaProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SolanaProvider>
  );
}
