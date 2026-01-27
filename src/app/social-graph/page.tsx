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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center p-4">
      <div className="w-full max-w-[1200px] flex items-center justify-between mb-8 pt-2">
         <div className="flex items-center space-x-2">
              <img src="/images/logo1.png" alt="Logo" className="h-8 w-8" />
              <span
                className="text-xl font-black text-white"
                style={{
                  fontFamily: "Audiowide, cursive",
                  textShadow: "0 0 20px rgba(255, 255, 255, 0.4), 0 0 40px rgba(255, 255, 255, 0.2)",
                  letterSpacing: "0.1em",
                  fontWeight: 400,
                }}
              >
                SONGJAM
              </span>
         </div>
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
