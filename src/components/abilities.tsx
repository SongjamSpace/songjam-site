"use client";

import AbilityItem from "./ability-item";
import AbilityPoint from "./ability-point";
import Corners from "./corners";
import DotBackground from "./dot-background";
import VideoDialog from "./video-dialog";

const abilityPoints = [
  "Stay jelly, stay wobbly",
  "Ride the somnia wavfe",
  "Liquidity, Served with Jelly Jellu",
  "No roadmap, be jelly",
  "Meme. Wobble. Jellu. Repeat.",
  "Drift free with Jellu Fun",
];

export default function Abilities() {
  return (
    <div className="py-12 md:pt-[200px] relative bg-black">
      <DotBackground />
      <div className="flex flex-col md:flex-row items-center justify-start gap-8 h-full max-w-7xl mx-auto relative z-10">
        <div className="w-full h-full gap-10 px-4 items-center md:items-start flex flex-col">
          {/* <div
            className="hidden md:block relative"
            style={{ filter: "drop-shadow(0 0 10px rgba(255, 0, 122, 0.25))" }}
          >
            <img
              src="/images/logo1.png"
              alt="Logo Glow"
              className="w-20 h-auto"
            />
          </div> */}
          <AbilityItem
            title="The wobble started as a playful splash, just a jelly drifting into Somnia waters."
            description="Built meme-first, $JELLU is EVM-compatible and right now swims only on the Somnia Network at this address: 0xd5447af13a1df69add89e185155b20fb72d5e9a7"
          />
          <AbilityItem
            title="There’s no promises, no roadmap, just pure jelly vibes."
            description="The JellyDevs hold a total allocation of 16.9%, with the first 6.9% already set aside for our fellow Somnia yappers. The rest? The plan is to let it drift out fully to the wider community to spread the chillz, the memes, and the wobbly Somnia flow."
          />
          <AbilityItem
            title="Jellu Enjoy Living Like U"
            description="The jellyfish lives, vibes, and grows just like you do: adapting to currents, glowing under pressure, and finding joy in simple moments. It makes $JELLU feel like a reflection of its vibes, soft, resilient, and always connected."
          />
        </div>
        <div className="w-full h-full flex items-center justify-center">
          <video
            src="/images/jellu_animation.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-80 h-80 rounded-full object-cover"
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
              <h2 className="text-3xl font-bold text-white mb-4">JELLU</h2>
            </div>
            <div className="text-[64px] leading-[100%] font-semibold uppercase text-white mb-8">
              $JELLU
            </div>
            {/* <VideoDialog> */}
            {/* <button
              className="flex items-center justify-center px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 bg-black text-white border border-white/30 hover:bg-black/90 shadow-lg hover:shadow-xl hover:border-white/50 w-[222px] h-[40px]"
              style={{ fontFamily: "Inter, sans-serif" }}
              onClick={() =>
                window.open("https://app.virtuals.io/virtuals/29671", "_blank")
              }
            >
              STAKE NOW
            </button> */}
            {/* </VideoDialog> */}
          </div>
        </div>
      </div>
    </div>
  );
}
