import { Button } from "./ui/button";
import PrimaryButton from "./primary-button";
import Link from "next/link";
import AboutDialog from "./about-dialog";
import { Menu } from "lucide-react";
import { MobileMenu } from "./mobile-menu";
import Logo from "./logo";
import { cn } from "@/lib/utils";
import VirtualsIcon from "./virtuals-icon";
import NavbarDropdown from "./navbar-dropdown";

export const APP_BASE_URL = "https://app.songjam.space";

export default function Navbar({ inverse }: { inverse?: boolean }) {
  return (
    <div className="flex justify-between items-center rounded-[12px] max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <img src="/images/logo1.png" alt="Logo" className="h-8 w-8" />
            <span
              className={`hidden md:block text-xl font-black ${
                inverse ? "text-[#48333D]" : "text-white"
              }`}
              style={{
                fontFamily: "Audiowide, cursive",
                textShadow: inverse
                  ? "none"
                  : "0 0 20px rgba(255, 255, 255, 0.4), 0 0 40px rgba(255, 255, 255, 0.2)",
                letterSpacing: "0.1em",
                fontWeight: 400,
              }}
            >
              SONGJAM
            </span>
          </div>
        </Link>
      </div>
      <div className="hidden md:flex gap-4 items-center">
        <Link href={`${APP_BASE_URL}/dashboard?tab=campaigns`} target="_blank">
          <Button
            variant="ghost"
            className={inverse ? "text-[#48333D] hover:text-[#48333D]/60" : ""}
          >
            AUTO DMs
          </Button>
        </Link>
        <Link href={`${APP_BASE_URL}/dashboard?tab=livespace`} target="_blank">
          <Button
            variant="ghost"
            className={inverse ? "text-[#48333D] hover:text-[#48333D]/60" : ""}
          >
            LIVE SPACE
          </Button>
        </Link>
        <Link href={`${APP_BASE_URL}/dashboard?tab=endedspace`} target="_blank">
          <Button
            variant="ghost"
            className={inverse ? "text-[#48333D] hover:text-[#48333D]/60" : ""}
          >
            ENDED SPACE
          </Button>
        </Link>
        <Link href={`${APP_BASE_URL}/dj`} target="_blank">
          <Button
            variant="ghost"
            className={inverse ? "text-[#48333D] hover:text-[#48333D]/60" : ""}
          >
            SONGJAM DJ
          </Button>
        </Link>
        <NavbarDropdown inverse={inverse} />
        {/* <Link href="" rel="noopener noreferrer">
          <Button
            variant="ghost"
            className={inverse ? "text-[#48333D] hover:text-[#48333D]/60" : ""}
          >
            $SANG PAIRS
          </Button>
        </Link> */}
        <Link
          href="https://x.com/SongjamSpace"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            size="icon"
            variant="ghost"
            className={`w-auto h-auto text-[20px] ${
              inverse ? "text-[#48333D] hover:text-[#48333D]/60" : ""
            }`}
          >
            𝕏
          </Button>
        </Link>
        <Link
          href="https://app.virtuals.io/virtuals/29671"
          target="_blank"
          rel="noopener noreferrer"
          className="flex"
        >
          <Button
            size="icon"
            variant="ghost"
            className={`w-auto h-auto ${
              inverse ? "text-[#48333D] hover:text-[#48333D]/60" : ""
            }`}
          >
            <VirtualsIcon className="scale-150" />
          </Button>
        </Link>
      </div>
      <div className="hidden md:block">
        <Link
          href="https://leaderboard.songjam.space/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
              inverse
                ? "bg-[#48333D] text-white hover:bg-[#48333D]/90 shadow-lg hover:shadow-xl"
                : "bg-black text-white border border-white/30 hover:bg-black/90 shadow-lg hover:shadow-xl hover:border-white/50"
            }`}
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            CONNECT
          </button>
        </Link>
      </div>
      <div className="md:hidden">
        <MobileMenu inverse={inverse}>
          <Menu size={24} className={inverse ? "text-[#48333D]" : ""} />
        </MobileMenu>
      </div>
    </div>
  );
}
