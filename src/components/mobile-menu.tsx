import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import PrimaryButton from "./primary-button";
import AboutDialog from "./about-dialog";
import { APP_BASE_URL } from "./navbar";

export function MobileMenu({
  children,
  inverse,
}: {
  children: React.ReactNode;
  inverse?: boolean;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-screen bg-white/10 border border-white/10 backdrop-blur-lg z-1000"
      >
        <SheetHeader className="mb-6">
          <SheetTitle>
            <div className="flex items-center space-x-2">
              <img src="/images/logo1.png" alt="Logo" className="h-8 w-8" />
              <span
                className="text-xl font-black text-white"
                style={{
                  fontFamily: "Audiowide, cursive",
                  textShadow:
                    "0 0 20px rgba(255, 255, 255, 0.4), 0 0 40px rgba(255, 255, 255, 0.2)",
                  letterSpacing: "0.1em",
                  fontWeight: 400,
                }}
              >
                SONGJAM
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4">
          <Link
            href={`${APP_BASE_URL}/spaces-crm?action=boostSpace`}
            target="_blank"
          >
            <Button
              variant="ghost"
              className={
                inverse ? "text-[#48333D] hover:text-[#48333D]/60" : ""
              }
            >
              AUTO DMs
            </Button>
          </Link>
          <Link
            href={`${APP_BASE_URL}/spaces-crm?action=livespace`}
            target="_blank"
          >
            <Button
              variant="ghost"
              className={
                inverse ? "text-[#48333D] hover:text-[#48333D]/60" : ""
              }
            >
              LIVE SPACE
            </Button>
          </Link>
          <Link href={`${APP_BASE_URL}/dashboard`} target="_blank">
            <Button
              variant="ghost"
              className={
                inverse ? "text-[#48333D] hover:text-[#48333D]/60" : ""
              }
            >
              ENDED SPACE
            </Button>
          </Link>
          <Link href={`${APP_BASE_URL}/dj`} target="_blank">
            <Button
              variant="ghost"
              className={
                inverse ? "text-[#48333D] hover:text-[#48333D]/60" : ""
              }
            >
              SONGJAM DJ
            </Button>
          </Link>
          <Link href="" rel="noopener noreferrer">
            <Button
              variant="ghost"
              className={
                inverse ? "text-[#48333D] hover:text-[#48333D]/60" : ""
              }
            >
              $SANG PAIRS
            </Button>
          </Link>
        </div>
        <SheetFooter className="flex-row flex items-center gap-4">
          {/* <PrimaryButton inverse={inverse}>CONNECT</PrimaryButton> */}
          <Link
            href="https://x.com/SongjamSpace"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="icon"
              variant="ghost"
              inverse={inverse}
              className="w-auto h-auto text-[20px]"
            >
              𝕏
            </Button>
          </Link>
          <Link
            href="https://app.virtuals.io/virtuals/29671"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="icon"
              variant="ghost"
              inverse={inverse}
              className="w-auto h-auto"
            >
              <Image
                src="/images/virtuals.svg"
                alt="v"
                width={28}
                height={28}
              />
            </Button>
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
