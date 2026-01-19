"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { SocialGraph } from "@/components/SocialGraph";

export default function SocialPage() {
  const searchParams = useSearchParams();
  const twitterUsername = searchParams.get("twitterUsername") || undefined;

  // Mock current user for SocialGraph props requirements (we'll make it optional in SocialGraph refactor)
  // or just pass minimal info if needed.
  // The goal is to test the graph for 'twitterUsername'.
  const mockUser = {
    username: "guest",
    fid: 0,
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl text-white font-bold mb-4">Social Graph</h1>
      {twitterUsername ? (
        <div className="w-full max-w-4xl">
          <p className="text-slate-400 mb-2">Viewing graph for: <span className="text-cyan-400">@{twitterUsername}</span></p>
          <SocialGraph currentUser={mockUser} twitterUsername={twitterUsername} />
        </div>
      ) : (
        <div className="text-slate-500">
            Please provide a twitterUsername in the URL: <br/>
            <code>/social?twitterUsername=Jack</code>
        </div>
      )}
    </div>
  );
}
