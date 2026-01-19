"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebase.service";

export interface ProcessFarcasterProfile {
  twitterId: string;
  twitterUsername: string;
  farcasterId: string;
  farcasterUsername: string;
  farcasterName: string;
  type: "follower" | "following";
  pfpUrl?: string;
}

interface ProcessMetadata {
  status: "queued" | "processing" | "completed" | "failed";
  createdAt?: number;
  updatedAt?: number;
}

interface SocialGraphProps {
  currentUser: {
    username: string;
    fid: number;
    pfp_url?: string;
    display_name?: string;
  } | null;
  twitterUsername?: string;
}

const PROCESS_FARCASTER_COLLECTION = "process_farcaster";

export function SocialGraph({ currentUser, twitterUsername }: SocialGraphProps) {
  const [data, setData] = useState<ProcessFarcasterProfile[]>([]);
  const [metadata, setMetadata] = useState<ProcessMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref for container constraints if needed
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!twitterUsername) return;

    if (twitterUsername === 'mock') {
        setMetadata({
            status: 'completed',
            updatedAt: Date.now(),
            createdAt: Date.now() - 3600000
        });
        
        // Generate mock profiles
        const mockProfiles: ProcessFarcasterProfile[] = Array.from({ length: 15 }).map((_, i) => ({
            twitterId: `mock-twitter-${i}`,
            twitterUsername: `user_${i}`,
            farcasterId: `fid-${i}`,
            farcasterUsername: `caster_${i}`,
            farcasterName: `Mock User ${i}`,
            type: i % 3 === 0 ? "following" : "follower",
            pfpUrl: `https://unavatar.io/twitter/user_${i}`
        }));
        
        setData(mockProfiles);
        return;
    }

    // Listen to metadata (parent document)
    const docRef = doc(db, PROCESS_FARCASTER_COLLECTION, twitterUsername);
    const unsubscribeDoc = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            setMetadata(docSnap.data() as ProcessMetadata);
        } else {
            setMetadata(null);
        }
    });

    return () => unsubscribeDoc();
  }, [twitterUsername]);

  useEffect(() => {
    if (!twitterUsername || twitterUsername === 'mock') {
        // If no twitterUsername provided or using mock, we don't attach listener.
        return;
    }

    setLoading(true);
    setError(null);

    // Points to the subcollection "profiles" inside the document "twitterUsername" inside collection "process_farcaster"
    // Path: process_farcaster/{twitterUsername}/profiles
    const collectionRef = collection(db, PROCESS_FARCASTER_COLLECTION, twitterUsername, "profiles");
    
    // Listen to realtime updates on the subcollection
    const unsubscribe = onSnapshot(collectionRef, (querySnapshot) => {
        setLoading(false);
        const profiles: ProcessFarcasterProfile[] = [];
        
        querySnapshot.forEach((doc) => {
            // Data validation could go here, but casting for now as per reliable source assumption
            profiles.push(doc.data() as ProcessFarcasterProfile);
        });

        if (profiles.length > 0) {
             // Sort/shuffle
             const shuffled = profiles.sort(() => 0.5 - Math.random());
             setData(shuffled.slice(0, 15));
        } else {
             // Empty subcollection
             setData([]); 
        }
    }, (err) => {
        console.error("Social graph listener error:", err);
        setError("Could not load social graph.");
        setLoading(false);
    });

    return () => unsubscribe();
  }, [twitterUsername]);

  if (!currentUser) return null;

  // Helper to generate random positions around a circle
  const getPosition = (index: number, total: number, radius: number) => {
    const angle = (index / total) * 2 * Math.PI;
    // Add some randomness to radius and angle for organic look
    const r = radius + (Math.random() * 40 - 20); 
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    return { x, y };
  };

  const formatDate = (timestamp?: number) => {
      if (!timestamp) return "";
      return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="w-full h-[600px] relative flex items-center justify-center overflow-hidden bg-slate-900/20 rounded-3xl border border-slate-800/50 backdrop-blur-sm my-8">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent opacity-50" />

      {/* Metadata / Status Display */}
      {metadata && (
          <div className="absolute top-4 left-6 z-30 font-mono text-xs space-y-1 bg-slate-900/40 p-3 rounded-lg border border-slate-700/50 backdrop-blur-md">
              <div className="flex items-center gap-2">
                  <span className="text-slate-400">Status:</span>
                  <span className={`font-bold capitalize ${
                      metadata.status === 'completed' ? 'text-green-400' :
                      metadata.status === 'processing' ? 'text-yellow-400 animate-pulse' :
                      metadata.status === 'failed' ? 'text-red-400' : 'text-slate-300'
                  }`}>
                      {metadata.status}
                  </span>
              </div>
              {metadata.updatedAt && (
                  <div className="text-slate-500">
                      Updated: {formatDate(metadata.updatedAt)}
                  </div>
              )}
          </div>
      )}

      {loading && !data.length && (
        <div className="absolute text-cyan-400 animate-pulse font-mono text-sm">
           {metadata?.status === 'processing' ? 'Indexing social graph...' : 'Scanning social network...'}
        </div>
      )}

      {error && (
        <div className="absolute text-red-400/70 text-sm">
          {error}
        </div>
      )}

      <div className="relative w-full h-full flex items-center justify-center" ref={containerRef}>
        <AnimatePresence>
          {!loading && (data.length > 0 || (metadata && metadata.status !== 'completed')) && (
            <>
              {/* Connection Lines (Optional) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <g transform="translate(50% 50%)"> 
                  {/* Lines could go here */}
                </g>
              </svg>

              {/* Central User Node */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.8, bounce: 0.5 }}
                className="z-20 relative flex flex-col items-center justify-center"
              >
                 {/* Pulse rings */}
                 <div className="absolute -inset-4 rounded-full border border-purple-500/30 animate-ping opacity-20" />
                 <div className="absolute -inset-8 rounded-full border border-cyan-500/20 animate-pulse opacity-10" />

                <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)] overflow-hidden relative z-10 group cursor-pointer">
                  {twitterUsername ? (
                     <img 
                        src={`https://unavatar.io/twitter/${twitterUsername}`} 
                        alt={twitterUsername} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fallback if unavatar fails
                            (e.target as HTMLImageElement).src = currentUser?.pfp_url || '';
                        }}
                     />
                  ) : currentUser?.pfp_url ? (
                    <img src={currentUser.pfp_url} alt={currentUser.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 text-2xl font-bold text-white">
                      {currentUser.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-medium text-white">View</span>
                  </div>
                </div>
                <motion.div
                   className="mt-4 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700 text-xs text-purple-300 font-mono"
                   initial={{ opacity: 0, y: -10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.5 }}
                >
                    @{twitterUsername || currentUser.username}
                </motion.div>
              </motion.div>

              {/* Network Nodes */}
              {data.map((user, i) => {
                const { x, y } = getPosition(i, data.length, 180); // 180px radius
                
                return (
                  <motion.div
                    key={`${user.farcasterId}-${i}`}
                    className="absolute z-10"
                    initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                    animate={{ 
                      x, 
                      y, 
                      scale: 1, 
                      opacity: 1,
                      transition: { 
                        type: "spring",
                        damping: 12,
                        stiffness: 100,
                        delay: i * 0.05 
                      }
                    }}
                    style={{
                       // Center the node
                       left: 'calc(50% - 24px)', 
                       top: 'calc(50% - 24px)',
                    }}
                  >
                     {/* Floating animation */}
                     <motion.div
                        animate={{
                            y: [0, -8, 0],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: Math.random() * 2
                        }}
                        className="group relative"
                     >
                        <div className={`
                            w-12 h-12 rounded-full border-2 overflow-hidden shadow-lg transition-all duration-300
                            border-pink-500 shadow-pink-500/20
                            group-hover:scale-125 group-hover:border-white group-hover:z-50
                            bg-slate-900
                        `}>
                             {user.pfpUrl ? (
                                <img src={user.pfpUrl} alt={user.farcasterUsername} className="w-full h-full object-cover" />
                             ) : (
                                <div className={`w-full h-full flex items-center justify-center text-[10px] font-bold text-white
                                    bg-gradient-to-br from-pink-700 to-rose-800
                                `}>
                                    {user.farcasterUsername.slice(0, 2).toUpperCase()}
                                </div>
                             )}
                        </div>

                        {/* Tooltip */}
                        <div className="absolute top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            <div className="bg-slate-900/90 text-white text-xs px-2 py-1 rounded border border-slate-700 shadow-xl flex flex-col items-center">
                                <span className="font-bold">@{user.farcasterUsername}</span>
                                <span className="text-[10px] text-pink-400">
                                    {user.type}
                                </span>
                            </div>
                        </div>
                     </motion.div>
                  </motion.div>
                );
              })}
            </>
          )}
        </AnimatePresence>
        
        {!loading && data.length === 0 && !error && (
            <div className="text-slate-500 text-sm">
                {twitterUsername ? "No social graph connections found." : "Twitter username required for graph."}
            </div>
        )}
      </div>

       {/* Legend - Only showing Follower as per instruction removal of following */}
       <div className="absolute bottom-4 right-6 flex gap-4 text-xs font-mono bg-slate-900/50 p-2 rounded-lg backdrop-blur-sm border border-slate-800/50">
          <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.6)]" />
              <span className="text-slate-300">Follower</span>
          </div>
       </div>
    </div>
  );
}

