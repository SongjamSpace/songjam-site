"use client";

import React, { useEffect, useState, useRef } from "react";

import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebase.service";
import { useNeynarContext } from "@neynar/react";
import { neynarClient } from "@/services/neynar-client";
import axios from "axios";
import dynamic from 'next/dynamic';

const SocialGraphVisualization = dynamic(
  () => import('./SocialGraphVisualization'),
  { ssr: false }
);

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
  pfpUrl?: string;
  farcasterUsername?: string;
  fid?: number;
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
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [followingState, setFollowingState] = useState<Record<string, boolean>>({}); // fid -> isFollowing/Loading
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Get signer for follow actions
  // @ts-ignore - explicitly accessing signerUuid which might be hidden in types
  const { user: neynarUser, signerUuid } = useNeynarContext();
  
  // Ref for container constraints if needed
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const graphData = React.useMemo(() => {
    if (!internalTwitterUsername && !currentUser) return { nodes: [], links: [] };

    // Central node
    const centralNode = {
      id: "root",
      farcasterUsername: internalTwitterUsername || currentUser?.username,
      // Priority: 1. Metadata from generation (most recent/accurate) 2. Unavatar fallback 3. Current user PFP
      pfpUrl: metadata?.pfpUrl 
        ? metadata.pfpUrl 
        : currentUser?.verified_accounts?.find(acc => acc.platform === 'x' && acc.username === internalTwitterUsername)?.username 
            ? `https://unavatar.io/twitter/${internalTwitterUsername}`
            : currentUser?.pfp_url,
      type: "root",
      x: 0,
      y: 0,
      fx: 0, // Fix central node to center essentially, or let it float? Let's fix it initially or let forces handle it.
             // Actually, force-graph centers automatically.
    };
    
    // If no data yet, just return central node if we have a user
    if (data.length === 0) {
        return { nodes: [centralNode], links: [] };
    }

    const nodes = [
      centralNode,
      ...data.map((user) => ({
        ...user,
        id: user.farcasterId, // Use farcasterId as ID
      })),
    ];

    const links = data.map((user) => ({
      source: "root",
      target: user.farcasterId,
    }));

    return { nodes, links };
  }, [data, internalTwitterUsername, currentUser]);


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
        setTotalCount(142); // Mock count
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
        setTotalCount(querySnapshot.size);
        
        querySnapshot.forEach((doc) => {
            // Data validation could go here, but casting for now as per reliable source assumption
            profiles.push(doc.data() as ProcessFarcasterProfile);
        });

        if (profiles.length > 0) {
             // Sort/shuffle
             const shuffled = profiles.sort(() => 0.5 - Math.random());
             setData(shuffled.slice(0, 50));
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
      if (!neynarUser) {
          alert("Please sign in with Farcaster to generate your social graph.");
          return;
      }
      
      setIsGenerating(true);
      try {
          // Trigger the generation process
          await axios.post(`${process.env.NEXT_PUBLIC_SONGJAM_SERVER}/social-graph/process-farcaster`, {
              twitterUsername,
              fid: neynarUser.fid,
              pfpUrl: neynarUser.pfp_url || '',
              farcasterUsername: neynarUser.username
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
                   {totalCount > 0 && (
                      <div className="flex items-center gap-2">
                          <span className="text-slate-400">Found:</span>
                          <span className="text-cyan-400 font-bold">{totalCount} fascasters</span>
                      </div>
                  )}
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
             {/* Loading indication if needed, though graph handles it gracefully mostly */}
             
             {dimensions.width > 0 && dimensions.height > 0 && (
                <div className="absolute inset-0 z-10">
                    <SocialGraphVisualization
                        data={graphData}
                        width={dimensions.width}
                        height={dimensions.height}
                        onNodeClick={(node) => {
                            if (node.id !== 'root') {
                                // Maybe open profile or something?
                                // For now, handleFollow logic logic maybe?
                                // handleFollow(node.farcasterId);
                                window.open(`https://warpcast.com/${node.farcasterUsername}`, '_blank');
                            }
                        }}
                    />
                </div>
             )}

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

