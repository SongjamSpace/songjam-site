"use client";

import React, { useState } from "react";
import { Music, Play, Square, X, Plus, Volume2, CloudUpload, Grid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DjIntegratedPlaylistProps {
  audioUploads: { name: string; audioFullPath: string }[];
  isLibraryLoading: boolean;
  isLoading: boolean;
  activeTrackPath: string;
  onSelectTrack: (path: string) => void;
  onPlayTrack: (path: string) => void;
  onDeleteTrack: (fileName: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  volume: number;
  onVolumeChange: (val: number) => void;
}

export default function DjIntegratedPlaylist({
  audioUploads,
  isLibraryLoading,
  isLoading,
  activeTrackPath,
  onSelectTrack,
  onPlayTrack,
  onDeleteTrack,
  onFileUpload,
  volume,
  onVolumeChange,
}: DjIntegratedPlaylistProps) {
  const [soundboard] = useState([
    { id: 1, name: "Airhorn", active: true },
    { id: 2, name: "Laugh", active: true },
    { id: 3, name: "Crickets", active: false },
    { id: 4, name: "Clap", active: true },
    { id: 5, name: "Drumroll", active: false },
  ]);

  // Handle local volume change for UI smoothness
  const handleLocalVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseFloat(e.target.value));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Container with shared glassmorphic style */}
      <div className="bg-[#0a0a0f]/60 backdrop-blur-3xl border border-white/[0.08] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl relative group/playlist">
        
        {/* Header Section */}
        <div className="p-8 flex items-center justify-between border-b border-white/[0.05] relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover/playlist:text-blue-300 transition-colors">
              <Music size={24} />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-[0.2em] text-white" style={{ fontFamily: "Orbitron, sans-serif" }}>Music Library</h2>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.3em] mt-1">Inventory Management</p>
            </div>
          </div>
          <label className="flex items-center gap-3 px-6 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white/70 hover:bg-white/10 hover:text-white transition-all shadow-xl cursor-pointer relative z-10 group/upload">
            <CloudUpload size={16} className="text-blue-500 group-hover/upload:scale-110 transition-transform" /> 
            Sync Audio
            <input type="file" className="hidden" accept="audio/*" onChange={onFileUpload} />
          </label>
        </div>

        {/* Playlist Items */}
        <div className="p-8 flex flex-col gap-3 max-h-[350px] min-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 relative z-10">
          <AnimatePresence>
            {isLibraryLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : audioUploads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/10 gap-4">
                <Music size={40} className="opacity-20" />
                <div className="text-center text-[10px] font-black uppercase tracking-[0.3em]">
                  No signals detected in library
                </div>
              </div>
            ) : (
              audioUploads.map((track, index) => (
                <motion.div
                  key={track.audioFullPath}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex items-center justify-between p-4 rounded-3xl border transition-all cursor-pointer group/item ${
                    activeTrackPath === track.audioFullPath
                      ? "bg-white/[0.05] border-orange-500/40 shadow-lg shadow-orange-500/5"
                      : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                  onClick={() => onSelectTrack(track.audioFullPath)}
                >
                  <div className="flex items-center gap-5">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        activeTrackPath === track.audioFullPath 
                        ? "bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-600/40 text-white" 
                        : "bg-white/5 text-white/30 group-hover/item:bg-white/10 group-hover/item:text-white/60"
                      }`}>
                         {activeTrackPath === track.audioFullPath ? <Play size={16} fill="currentColor" className="animate-pulse" /> : <span className="text-xs font-black">{index + 1}</span>}
                      </div>
                      <div className="flex flex-col gap-0.5">
                         <span className={`text-sm font-bold transition-colors ${activeTrackPath === track.audioFullPath ? "text-orange-400" : "text-white/80 group-hover/item:text-white"}`}>{track.name}</span>
                         <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">{track.name.split('.').pop()} Source</span>
                      </div>
                  </div>
                  <div className="flex items-center gap-4 md:opacity-0 group-hover/item:opacity-100 transition-all transform translate-x-2 group-hover/item:translate-x-0">
                      <div className="h-8 w-[1px] bg-white/10" />
                      <button 
                        className="p-2.5 text-white/20 hover:text-red-500 transition-colors hover:bg-red-500/10 rounded-xl"
                        onClick={(e) => { e.stopPropagation(); onDeleteTrack(track.name); }}
                      >
                         <X size={16} />
                      </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Playback Controls (Middle Bar) */}
        <div className="p-8 bg-white/[0.03] border-t border-b border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
           <div className="flex items-center gap-5 flex-1 w-full">
              <div className="text-white/20 group-hover/playlist:text-blue-400 transition-colors"><Volume2 size={20} /></div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleLocalVolumeChange}
                className="h-1.5 flex-1 bg-white/[0.05] rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 shadow-2xl"
              />
           </div>
           <div className="flex items-center gap-4 shrink-0">
              <button disabled={isLoading} className="px-8 py-3.5 bg-white/[0.05] border border-white/10 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/10 transition-all flex items-center gap-3 disabled:opacity-50">
                 <Square size={14} fill="currentColor" /> Terminate
              </button>
              <button 
                disabled={isLoading || !activeTrackPath}
                onClick={() => onPlayTrack(activeTrackPath)}
                className="px-10 py-3.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.3em] text-white hover:from-orange-500 hover:to-red-500 transition-all shadow-2xl shadow-orange-600/30 flex items-center gap-3 disabled:opacity-50 relative overflow-hidden group/play"
              >
                 <div className="absolute inset-0 bg-white/0 group-hover/play:bg-white/10 transition-colors" />
                 {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play size={14} fill="currentColor" className="group-hover/play:scale-110 transition-transform" />}
                 Transmit Now
              </button>
           </div>
        </div>

        {/* Integrated Soundboard (Footer Section) */}
        <div className="p-8 bg-[#0a0a0f]/40 relative overflow-hidden">
           <div className="absolute bottom-0 right-0 w-40 h-40 bg-orange-500/5 blur-3xl pointer-events-none" />
           <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50" style={{ fontFamily: "Orbitron, sans-serif" }}>Soundboard Matrix</h3>
           </div>
           <div className="grid grid-cols-5 gap-4 relative z-10">
              {soundboard.map((slot) => (
                <motion.button
                  key={slot.id}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className={`aspect-square rounded-3xl border transition-all duration-500 flex flex-col items-center justify-center gap-3 group/slot relative overflow-hidden ${
                    slot.active 
                      ? "bg-white/[0.02] border-white/10 hover:border-orange-500/40 hover:bg-orange-500/5 shadow-2xl" 
                      : "bg-white/[0.01] border-white/5 opacity-30 cursor-not-allowed"
                  }`}
                >
                  {slot.active ? (
                    <>
                      <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover/slot:bg-gradient-to-br from-orange-500 to-red-600 group-hover/slot:text-white group-hover/slot:shadow-lg group-hover/slot:shadow-orange-600/30 transition-all duration-500">
                        <Play size={14} fill="currentColor" className="ml-0.5" />
                      </div>
                      <span className="text-[9px] font-black text-white/40 group-hover/slot:text-white uppercase tracking-tighter transition-colors">{slot.name}</span>
                    </>
                  ) : (
                    <div className="text-white/10"><Plus size={20} /></div>
                  )}
                  {/* Active Indicator Glow */}
                  {slot.active && (
                    <div className="absolute inset-0 bg-orange-500/0 group-hover/slot:bg-orange-500/[0.02] transition-opacity" />
                  )}
                </motion.button>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
