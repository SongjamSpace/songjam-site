import Image from "next/image";
import Link from "next/link";
import GlassCard from "./glass-card";
import PrimaryButton from "./primary-button";
import AboutDialog from "./about-dialog";

export default function AboutShort() {
  return (
    <div className="bg-[url('/images/about-bg3.png')] bg-cover bg-top bg-no-repeat py-12">
      <div className="flex flex-col md:flex-row items-center justify-start gap-8 h-full max-w-7xl mx-auto px-4 md:px-0">
        <GlassCard>
          <div className="justify-center items-center w-full flex">
            <Image
              src="/images/dj.png"
              alt="songjam-dj"
              width={257}
              height={385}
              style={{ width: "auto", height: "auto" }}
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-lg font-bold">
              A CRYPTOGRAPHIC VOICE VERIFICATION NETWORK POWERED BY $SANG
            </div>
            <div className="text-sm">
              In the age of AI, a voice recording of a few seconds is enough to
              create a deepfake clone. 'Vishing' or 'Voice Phishing' is a social
              engineering attack which leverages deepfake voices. Songjam
              cryptographically secures your voice to prevent these attacks.
            </div>
            <AboutDialog>
              <button
                className="flex items-center justify-center px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 bg-white/10 text-white border border-white/30 hover:bg-white/20 backdrop-blur-sm shadow-lg hover:shadow-xl hover:border-white/50 w-[222px] h-[40px]"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                LEARN MORE
              </button>
            </AboutDialog>
          </div>
        </GlassCard>
        <GlassCard>
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
        </GlassCard>
      </div>
      <div className="text-sm text-center mt-12">
        <div className="text-center text-sm text-white/60">
          COPYRIGHT © 2025 SONGJAM
        </div>
        <br />
        <Link href="/terms" className="text-sm text-white hover:text-white/70">
          Terms of Service
        </Link>
        {" | "}
        <Link
          href="/privacy"
          className="text-sm text-white hover:text-white/70"
        >
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
