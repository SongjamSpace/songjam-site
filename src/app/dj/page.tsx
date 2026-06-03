"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DjHeader from "@/components/dj/DjHeader";
import DjControls from "@/components/dj/DjControls";
import DjIntegratedPlaylist from "@/components/dj/DjIntegratedPlaylist";
import DjReactions from "@/components/dj/DjReactions";
import DjSpeakText from "@/components/dj/DjSpeakText";
import DjActivityLog from "@/components/dj/DjActivityLog";
import { useAuth } from "@/components/providers";
import { getUploadedAudioPaths, uploadMusic, deleteMusicUpload } from "@/services/storage/dj.storage";
import AudioReactiveBackground from "@/components/audio-reactive-background";

// Placeholder types for missing services
enum RequestType {
  PLAY_MUSIC = "PLAY_MUSIC",
  STOP_MUSIC = "STOP_MUSIC",
  REACT_EMOJI = "REACT_EMOJI",
  SPEAK_TEXT = "SPEAK_TEXT",
  VOLUME_CHANGE = "VOLUME_CHANGE",
}

interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: "info" | "success" | "error";
  iconType?: string;
  user?: string;
  time?: string;
}

export default function DjPage() {
  const { user, authenticated, loading: authLoading } = useAuth();
  
  // Audio Reactive State
  const [inputVolume, setInputVolume] = useState(0);
  const [outputVolume, setOutputVolume] = useState(0);

  // Space Controls State
  const [spaceUrl, setSpaceUrl] = useState("");
  const [spaceId, setSpaceId] = useState("");
  const [ct0, setCt0] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [isJoined, setIsJoined] = useState(false);

  // Music & Logic State
  const [isLoading, setIsLoading] = useState(false);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [audioUploads, setAudioUploads] = useState<{ name: string; audioFullPath: string }[]>([]);
  const [audioFullPath, setAudioFullPath] = useState("");
  const [volume, setVolume] = useState(1);
  const [speakText, setSpeakText] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Add Log Helper
  const addLog = (message: string, type: "info" | "success" | "error" = "info", iconType?: string, user: string = "system") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [
      {
        id: Date.now(),
        timestamp,
        message,
        type,
        iconType,
        user,
        time: timestamp,
      },
      ...prev.slice(0, 49),
    ]);
  };

  // Fetch Uploads
  const fetchUserUploads = async () => {
    if (!user) return;
    setIsLibraryLoading(true);
    try {
      const uploads = await getUploadedAudioPaths(user.uid);
      setAudioUploads(uploads);
      if (uploads.length > 0 && !audioFullPath) {
        setAudioFullPath(uploads[0].audioFullPath);
      }
    } catch (error) {
      addLog("Failed to fetch library", "error");
    } finally {
      setIsLibraryLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserUploads();
      addLog(`Welcome back, ${user.displayName || user.email || 'DJ'}`, "success", "join");
    }
  }, [user]);

  // Handle File Upload
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.size > 150 * 1024 * 1024) {
      addLog("File size must be less than 150MB", "error");
      return;
    }
    if (file && user) {
      setIsLoading(true);
      addLog(`Uploading ${file.name}...`, "info");
      try {
        await uploadMusic(file, user.uid);
        addLog(`Uploaded ${file.name} successfully`, "success");
        await fetchUserUploads();
      } catch (error) {
        addLog(`Failed to upload ${file.name}`, "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle Delete
  const handleDeleteUpload = async (fileName: string) => {
    if (user) {
      try {
        await deleteMusicUpload(fileName, user.uid);
        addLog(`Deleted ${fileName}`, "success");
        await fetchUserUploads();
      } catch (error) {
        addLog(`Failed to delete ${fileName}`, "error");
      }
    }
  };

  // Mock Handlers for missing backend functionality
  const sendDjRequest = async (type: RequestType, payload: any) => {
    console.log(`[DJ REQUEST] ${type}:`, payload);
    // Placeholder for actual API call
    return new Promise((resolve) => setTimeout(resolve, 500));
  };

  const handlePlayMusic = async (path: string) => {
    const targetPath = path || audioFullPath;
    if (!targetPath) return;
    
    setIsLoading(true);
    addLog(`Requesting to play: ${targetPath.split('/').pop()}`, "info", "song");
    await sendDjRequest(RequestType.PLAY_MUSIC, { audioFullPath: targetPath });
    setIsLoading(false);
  };

  const handleEmojiReact = async (emoji: string) => {
    if (user) {
      await sendDjRequest(RequestType.REACT_EMOJI, { emoji });
      addLog(`Reacted with ${emoji}`, "success", "reaction", user.displayName || "You");
    }
  };

  const handleSpeakText = async () => {
    if (user && speakText.trim()) {
      await sendDjRequest(RequestType.SPEAK_TEXT, { text: speakText.trim(), voiceId: "" });
      addLog(`Speaking: ${speakText.trim()}`, "info", "info");
      setSpeakText("");
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    sendDjRequest(RequestType.VOLUME_CHANGE, { volume: newVolume });
  };

  const handleJoinSpace = () => {
    if (!spaceUrl) {
      addLog("Please enter a Space URL", "error");
      return;
    }
    setIsJoined(!isJoined);
    addLog(isJoined ? "Disconnected from space" : `Joined space: ${spaceUrl}`, isJoined ? "info" : "success", "join");
  };

  return (
    <div className="relative bg-[#07070a] min-h-screen text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Audio-reactive background from Adam theme */}
      <AudioReactiveBackground
        inputVolume={inputVolume}
        outputVolume={outputVolume}
        isConnected={isJoined}
        reactToUserInput
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:px-8 flex flex-col gap-10">
        {/* Header */}
        <DjHeader />

        {/* Top Controls: Compact inputs & Join Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <DjControls
            spaceUrl={spaceUrl}
            setSpaceUrl={setSpaceUrl}
            ct0={ct0}
            setCt0={setCt0}
            authToken={authToken}
            setAuthToken={setAuthToken}
            isJoined={isJoined}
            onJoin={handleJoinSpace}
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left/Main Column: Playlist, Soundboard, Reactions, TTS */}
          <motion.div
            className="lg:col-span-8 flex flex-col gap-10"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Integrated Playlist & Soundboard */}
            <DjIntegratedPlaylist 
              audioUploads={audioUploads}
              isLibraryLoading={isLibraryLoading}
              isLoading={isLoading}
              activeTrackPath={audioFullPath}
              onSelectTrack={setAudioFullPath}
              onPlayTrack={handlePlayMusic}
              onDeleteTrack={handleDeleteUpload}
              onFileUpload={handleFileChange}
              volume={volume}
              onVolumeChange={handleVolumeChange}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Reactions */}
              <DjReactions onReact={handleEmojiReact} />

              {/* Speak Text */}
              <DjSpeakText 
                text={speakText}
                setText={setSpeakText}
                onSpeak={handleSpeakText}
              />
            </div>
          </motion.div>

          {/* Right Panel: Activity Log */}
          <motion.div
            className="lg:col-span-4 h-full"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <DjActivityLog logs={logs} />
          </motion.div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-3 backdrop-blur-xl border rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all duration-500 bg-[#0a0a0f]/80 ${
            isJoined 
              ? "border-green-500/40 text-green-400 shadow-green-500/10" 
              : "border-white/10 text-white/60 shadow-black/40"
          }`}
        >
          <div className="flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full animate-pulse ${isJoined ? 'bg-green-500' : 'bg-white/20'}`} />
             {isJoined ? "Live Signal Active" : authLoading ? "Syncing Identity..." : authenticated ? "Deck Ready" : "Identity Required"}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
