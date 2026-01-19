"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { SocialGraph } from "@/components/SocialGraph";

import { NeynarAuthButton, useNeynarContext, SIWN_variant } from "@neynar/react";

export default function SocialPage() {
  const searchParams = useSearchParams();
  const twitterUsername = searchParams.get("twitterUsername") || undefined;
  // @ts-ignore - verified_accounts is not in standard types yet
  const { user: neynarUser, isAuthenticated } = useNeynarContext();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
         <h1 className="text-2xl text-white font-bold">Social Graph</h1>
         {isAuthenticated && neynarUser ? (
             <div className="flex items-center gap-3">
                 <div className="bg-slate-800 px-3 py-1 rounded-full text-xs text-slate-400 border border-slate-700">
                     Connected as @{neynarUser.username}
                 </div>
             </div>
         ) : (
             <NeynarAuthButton variant={SIWN_variant.FARCASTER} />
         )}
      </div>

      <div className="w-full max-w-4xl">
          {twitterUsername && <p className="text-slate-400 mb-2">Viewing graph for: <span className="text-cyan-400">@{twitterUsername}</span></p>}
          <SocialGraph currentUser={neynarUser} twitterUsername={twitterUsername} />
      </div>
    </div>
  );
}
