import Image from "next/image";
import Link from "next/link";
import GlassCard from "./glass-card";
import PrimaryButton from "./primary-button";
import AboutDialog from "./about-dialog";

export default function AboutShort() {
  return (
    <div className="relative bg-[url('/images/jellu-about-bg.png')] bg-cover bg-top bg-no-repeat py-12">
      {/* Top gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10"></div>
      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10"></div>
      <div className="relative flex flex-col md:flex-row items-center justify-start gap-8 h-full max-w-7xl mx-auto px-4 md:px-0 z-20">
        <GlassCard>
          <div className="justify-center items-center w-full flex mt-auto mb-auto">
            <Image
              src="/images/jellu-circle-bg.png"
              alt="jellu-circle"
              width={250}
              height={250}
              style={{ width: "250px", height: "250px", borderRadius: "50%" }}
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-sm">
              The soul of $JELLU has always been about mirroring the crypto
              memes community, lighthearted, curious, and unafraid to float into
              new currents.
              <br />
              <br /> It’s a character that laughs with you, reminding everyone
              that even small ripples can turn into big waves And now, to keep
              that spirit alive beyond the chain, the Jelly devs have pushed out
              a fresh batch of GIFs and stickers onto GIPHY for the whole world
              to see. <br />
              <br /> The community is not only welcome but encouraged to use
              them everywhere, remix them, and even add more because JELLU is
              about all of us glowing together.
            </div>
            <button
              className="flex items-center justify-center px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 bg-white/10 text-white border border-white/30 hover:bg-white/20 backdrop-blur-sm shadow-lg hover:shadow-xl hover:border-white/50 w-[222px] h-[40px]"
              style={{ fontFamily: "Inter, sans-serif" }}
              onClick={() =>
                window.open("https://giphy.com/channel/jellufun", "_blank")
              }
            >
              LEARN MORE
            </button>
          </div>
        </GlassCard>
        {/* <GlassCard>
          <div className="justify-center items-center w-full flex">
            <Image
              src="/images/protoSBT.png"
              alt="proto-sbt"
              width={423.5}
              height={514}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-lg font-bold">PROTO SOULBOUND TOKENS</div>
            <div className="text-sm">
              Decentrally store and administer your voice data via a proto
              Soulbound Token. Monetize your voice data to researchers, or make
              it available for AI assistants, voiceovers and reader apps.
            </div>
          </div>
        </GlassCard> */}
      </div>
      <div className="text-sm text-center mt-12">
        <div className="text-center text-lg">Legal Disclaimer</div>
        <div className="text-center text-lg mt-2 text-white">
          $JELLU is a meme mascot coin for entertainment and cultural purposes
          only. <br /> Nothing here is financial advice, it's just jelly and all
          types of life wobbling on the somnia blockchain.
        </div>
      </div>
    </div>
  );
}
