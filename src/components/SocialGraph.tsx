"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebase.service";
import { useNeynarContext } from "@neynar/react";
import { neynarClient } from "@/services/neynar-client";
import axios from "axios";

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
    verified_accounts?: Array<{
      platform: 'x' | 'instagram' | 'tiktok' | string;
      username: string;
    }>;
  } | null;
  twitterUsername?: string;
}

const PROCESS_FARCASTER_COLLECTION = "process_farcaster";

export function SocialGraph({ currentUser, twitterUsername }: SocialGraphProps) {
  const [internalTwitterUsername, setInternalTwitterUsername] = useState<string | undefined>(twitterUsername);
  const [data, setData] = useState<ProcessFarcasterProfile[]>([]);
  const [metadata, setMetadata] = useState<ProcessMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followingState, setFollowingState] = useState<Record<string, boolean>>({}); // fid -> isFollowing/Loading
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Get signer for follow actions
  // @ts-ignore - explicitly accessing signerUuid which might be hidden in types
  const { user: neynarUser, signerUuid } = useNeynarContext();
  
  // Ref for container constraints if needed
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If props change, update state, but only if state wasn't successfully set by user interaction?
    // Actually, usually props sync is good, but here we want to allow override.
    // Let's rely on internal state mostly.
    if (twitterUsername) {
        setInternalTwitterUsername(twitterUsername);
    }
  }, [twitterUsername]);

  useEffect(() => {
    if (!internalTwitterUsername) return;

    if (internalTwitterUsername === 'mock') {
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
    const docRef = doc(db, PROCESS_FARCASTER_COLLECTION, internalTwitterUsername);
    const unsubscribeDoc = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            setMetadata(docSnap.data() as ProcessMetadata);
        } else {
            setMetadata(null);
        }
    });

    return () => unsubscribeDoc();
  }, [internalTwitterUsername]);

  useEffect(() => {
    if (!internalTwitterUsername || internalTwitterUsername === 'mock') {
        // If no twitterUsername provided or using mock, we don't attach listener.
        return;
    }

    setLoading(true);
    setError(null);

    // Points to the subcollection "profiles" inside the document "twitterUsername" inside collection "process_farcaster"
    // Path: process_farcaster/{twitterUsername}/profiles
    const collectionRef = collection(db, PROCESS_FARCASTER_COLLECTION, internalTwitterUsername, "profiles");
    
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
  }, [internalTwitterUsername]);

  // if (!currentUser) return null;

   const [isMobile, setIsMobile] = useState(false);

   useEffect(() => {
     const checkMobile = () => setIsMobile(window.innerWidth < 768);
     checkMobile();
     window.addEventListener('resize', checkMobile);
     return () => window.removeEventListener('resize', checkMobile);
   }, []);

  // Helper to generate random positions around a circle
  const getPosition = (index: number, total: number, radius: number) => {
    const angle = (index / total) * 2 * Math.PI;
    // Add some randomness to radius and angle for organic look
    const r = radius + (Math.random() * 40 - 20); 
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    return { x, y };
  };

  const handleFollow = async (fid: string) => {
      if (!signerUuid && internalTwitterUsername !== 'mock') {
          alert("Please sign in with Farcaster to follow users.");
          return;
      }
      
      setFollowLoading(prev => ({ ...prev, [fid]: true }));

      try {
          if (internalTwitterUsername === 'mock') {
              // Mock success
              await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
             await neynarClient.publishFollow(signerUuid, parseInt(fid));
          }
          setFollowingState(prev => ({ ...prev, [fid]: true }));
      } catch (err) {
          console.error("Follow failed", err);
          alert("Failed to follow user.");
      } finally {
          setFollowLoading(prev => ({ ...prev, [fid]: false }));
      }
  };

  const handleGenerateGraph = async (twitterUsername: string) => {
      if (!twitterUsername) return;
      
      setIsGenerating(true);
      try {
          // Trigger the generation process
          await axios.post(`${process.env.NEXT_PUBLIC_SONGJAM_SERVER}/social-graph/process-farcaster`, {
              twitterUsername
          });
          
          // Once the request is successful, we set the internal state which triggers the firebase listeners
          setInternalTwitterUsername(twitterUsername);
      } catch (err) {
          console.error("Failed to generate graph:", err);
          alert("Failed to start social graph generation. Please try again.");
      } finally {
          setIsGenerating(false);
      }
  };

  const formatDate = (timestamp?: number) => {
      if (!timestamp) return "";
      return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="w-full h-auto md:h-[600px] relative flex flex-col md:flex-row overflow-hidden bg-slate-900/20 rounded-3xl border border-slate-800/50 backdrop-blur-sm my-8">
      {/* Left Side: Graph Visualization */}
      <div className="relative w-full h-[400px] md:h-full md:flex-1 flex items-center justify-center bg-slate-900/10" ref={containerRef}>
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

          <div className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence>
              {/* Central User Node */}
              <motion.div
                key="central-node"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.8, bounce: 0.5 }}
                className="z-20 relative flex flex-col items-center justify-center"
              >
                 {/* Pulse rings */}
                 <div className="absolute -inset-4 rounded-full border border-purple-500/30 animate-ping opacity-20" />
                 <div className="absolute -inset-8 rounded-full border border-cyan-500/20 animate-pulse opacity-10" />

                <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)] overflow-hidden relative z-10 group cursor-pointer">
                   {internalTwitterUsername ? (
                      <img 
                         src={`https://unavatar.io/twitter/${internalTwitterUsername}`} 
                         alt={internalTwitterUsername} 
                         className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fallback if unavatar fails
                            (e.target as HTMLImageElement).src = currentUser?.pfp_url || '';
                        }}
                     />
                  ) : currentUser?.pfp_url ? (
                    <img src={currentUser?.pfp_url} alt={currentUser?.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 text-2xl font-bold text-white">
                      {currentUser?.username?.slice(0, 2).toUpperCase() || "?"}
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-medium text-white">View</span>
                  </div>
                </div>
                {(internalTwitterUsername || currentUser?.username) &&  <motion.div
                   className="mt-4 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700 text-xs text-purple-300 font-mono"
                   initial={{ opacity: 0, y: -10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.5 }}
                >
                    @{internalTwitterUsername || currentUser?.username}
                </motion.div>}
              </motion.div>

              {!loading && (data.length > 0 || (metadata && metadata.status !== 'completed')) && (
                <>
                  {/* Connection Lines (Optional) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                    <g transform="translate(50% 50%)"> 
                      {/* Lines could go here */}
                    </g>
                  </svg>



                  {/* Network Nodes */}
                  {data.map((user, i) => {
                    // Adjusted radius for layout constraint
                    const { x, y } = getPosition(i, data.length, isMobile ? 100 : 160); 
                    
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
                <div className="absolute flex flex-col items-center justify-center p-6 text-center z-20 mt-80">
                    {internalTwitterUsername ? (
                         <div className="text-slate-500 text-sm">No social graph connections found.</div>
                    ) : !currentUser ? (
                         <div className="flex flex-col items-center gap-3">
                            <div className="text-slate-500 text-sm max-w-[200px] text-center">
                                Sign in with Farcaster to generate your social graph.
                            </div>
                         </div>
                    ) : (
                        currentUser?.verified_accounts?.find(acc => acc.platform === 'x') ? (
                            <button 
                                onClick={() => {
                                    const xAccount = currentUser.verified_accounts?.find(acc => acc.platform === 'x');
                                    if (xAccount) {
                                        handleGenerateGraph(xAccount.username);
                                    }
                                }}
                                disabled={isGenerating}
                                className={`px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-bold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all flex items-center gap-2 group ${isGenerating ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {isGenerating ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span className="text-xl">🕸️</span>
                                )}
                                <div>
                                    <div className="text-sm">Generate Social Graph</div>
                                    <div className="text-[10px] font-normal text-purple-200">
                                        using @{currentUser.verified_accounts.find(acc => acc.platform === 'x')?.username}
                                    </div>
                                </div>
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <div className="text-slate-500 text-sm max-w-[200px] text-center">
                                    Connect your X (Twitter) account to generate your social graph.
                                </div>
                                <a 
                                    href="https://warpcast.com/~/settings/verified-addresses"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium border border-slate-700 transition-colors flex items-center gap-2"
                                >
                                    <span>Link on Warpcast</span>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        )
                    )}
                </div>
            )}
          </div>

          {/* Legend */}
          {/* <div className="absolute bottom-4 right-6 flex gap-4 text-xs font-mono bg-slate-900/50 p-2 rounded-lg backdrop-blur-sm border border-slate-800/50">
             <div className="flex items-center gap-1.5">
                 <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.6)]" />
                 <span className="text-slate-300">Follower</span>
             </div>
          </div> */}
      </div>

      {/* Right Side: Quick Follow List */}
      <div className="w-full md:w-80 h-[300px] md:h-full border-t md:border-t-0 md:border-l border-slate-800/50 bg-slate-950/30 backdrop-blur-md flex flex-col">
          <div className="p-4 border-b border-slate-800/50 bg-slate-900/40">
              <h3 className="text-white font-semibold flex items-center gap-2 text-sm uppercase tracking-wide">
                  <span className="text-yellow-400">⚡</span> Quick Follow
              </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
               {!data.length && loading && (
                   <div className="text-center py-8 text-slate-500 text-xs animate-pulse">Loading suggestions...</div>
               )}

               {!data.length && !loading && (
                   <div className="text-center py-8 text-slate-500 text-xs">No users found.</div>
               )}

              {data.map((user) => (
                  <div key={user.farcasterId} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group">
                      <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700">
                              {user.pfpUrl ? (
                                  <img src={user.pfpUrl} alt={user.farcasterUsername} className="w-full h-full object-cover" />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br from-purple-600 to-blue-600">
                                      {user.farcasterUsername.slice(0, 2).toUpperCase()}
                                  </div>
                              )}
                          </div>
                          <div className="min-w-0 flex flex-col">
                              <span className="text-xs font-bold text-white truncate max-w-[100px]">
                                  {user.farcasterName || user.farcasterUsername}
                              </span>
                              <span className="text-[10px] text-slate-400 truncate">
                                  @{user.farcasterUsername}
                              </span>
                          </div>
                      </div>
                      
                      <button
                          onClick={() => handleFollow(user.farcasterId)}
                          disabled={followLoading[user.farcasterId] || followingState[user.farcasterId]}
                          className={`
                              px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all min-w-[70px] flex justify-center
                              ${followingState[user.farcasterId] 
                                  ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                                  : 'bg-white text-black hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_10px_rgba(34,211,238,0.4)]'
                              }
                              disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                      >
                          {followLoading[user.farcasterId] ? (
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : followingState[user.farcasterId] ? (
                              'Following'
                          ) : (
                              'Follow'
                          )}
                      </button>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
}

