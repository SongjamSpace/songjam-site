"use client";

import AbilityItem from "./ability-item";
import AbilityPoint from "./ability-point";
import Corners from "./corners";
import DotBackground from "./dot-background";
import VideoDialog from "./video-dialog";

const abilityPoints = [
  "AI Summarization",
  "Creator Coin Liquidity",
  "DM Automation",
  "Listener Retrieval",
  "Mindshare Trading",
  "Voice Tokenization",
  "X Space Toolkit",
];

export default function Abilities() {
  return (
    <div className="py-12 md:pt-[200px] relative bg-black">
      <DotBackground />
      <div className="flex flex-col md:flex-row items-center justify-start gap-8 h-full max-w-7xl mx-auto relative z-10">
        <div className="w-full h-full gap-10 px-4 items-center md:items-start flex flex-col">
          <div
            className="hidden md:block relative"
            style={{ filter: "drop-shadow(0 0 10px rgba(255, 0, 122, 0.25))" }}
          >
            <img
              src="/images/logo1.png"
              alt="Logo Glow"
              className="w-20 h-auto"
            />
          </div>
          <AbilityItem
            title="VOICE SOVEREIGNTY"
            description="Own your voice in the age of AI. Hold your data through a proto Soulbound Token which evolves with you."
          />
          <AbilityItem
            title="X SPACES COMPATIBLE"
            description="Natively compatible with X Spaces, capture your biometric data while expanding your reach and presence."
          />
          <AbilityItem
            title="DJ & SOUNDBOARD"
            description="Bring the party to your X Space with a custom soundboard and DJ. Play whatever you want and make it yours."
          />
        </div>
        <div className="w-full h-full flex items-center justify-center">
          <img
            src="/images/songjam-abilities.png"
            alt="Songjam Abilities"
            className="w-full h-auto"
          />
        </div>
        <div className="w-full h-full flex flex-col items-center justify-between gap-16">
          <div className="relative flex flex-col items-start w-[260px] justify-start gap-4 p-6">
            <Corners />
            <div className="flex flex-col items-start justify-start gap-2">
              {abilityPoints.map((title, index) => (
                <AbilityPoint key={index} title={title} />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-start justify-start">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">SONGJAM</h2>
            </div>
            <div className="text-[64px] leading-[100%] font-semibold uppercase text-white mb-8">
              $SANG
            </div>
            <VideoDialog>
              <button
                className="flex items-center justify-center px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 bg-black text-white border border-white/30 hover:bg-black/90 shadow-lg hover:shadow-xl hover:border-white/50 w-[222px] h-[40px]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                STAKE NOW
              </button>
            </VideoDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
