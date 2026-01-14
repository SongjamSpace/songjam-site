"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NeynarContextProvider, Theme } from "@neynar/react";
import { createContext, useContext, useEffect, useState } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { base } from "viem/chains";

import { auth } from "@/services/firebase.service";
import { onAuthStateChanged, TwitterAuthProvider, signInWithPopup, User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  ready: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  twitterObj: {
    twitterId: string | undefined;
    name: string | null | undefined;
    username: any;
  } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleTwitterLogin = async () => {
    const provider = new TwitterAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Successfully logged in
    } catch (error) {
      console.error("Error signing in with Twitter:", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const extractTwitterProps = () => {
    if (!user) return null;
    const twitterInfo = user.providerData.find(
      (p) => p.providerId === "twitter.com"
    );
    const twitterId = twitterInfo?.uid;
    const name = twitterInfo?.displayName;
    const username = (user as any)?.reloadUserInfo?.screenName || "";
    return { twitterId, name, username };
  };

  const value: AuthContextType = {
    user,
    loading,
    authenticated: !!user,
    ready: !loading,
    login: handleTwitterLogin,
    logout: handleLogout,
    twitterObj: extractTwitterProps(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#7c3aed",
        },
        supportedChains: [base],
        defaultChain: base,
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      <NeynarContextProvider
        settings={{
          clientId: process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID || "",
          defaultTheme: Theme.Dark,
          eventsCallbacks: {
            onAuthSuccess: (params) => {
              console.log("Neynar auth success", params);
            },
            onSignout: () => {
              console.log("Neynar signout");
            },
          },
        }}
      >
        <AuthProvider>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </AuthProvider>
      </NeynarContextProvider>
    </PrivyProvider>
  );
}

