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
                  fontFamily: 'Audiowide, cursive',
                  textShadow: '0 0 20px rgba(255, 255, 255, 0.4), 0 0 40px rgba(255, 255, 255, 0.2)',
                  letterSpacing: '0.1em',
                  fontWeight: 400
                }}
              >
                SONGJAM
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4">
          <AboutDialog>
            <Button
              variant="ghost"
              inverse={inverse}
              className="w-full justify-start"
            >
              AUTO DMs
            </Button>
          </AboutDialog>
          <Link href="/mirror" className="w-full">
            <Button
              variant="ghost"
              inverse={inverse}
              className="w-full justify-start"
            >
              MIRROR
            </Button>
          </Link>
          <Link href="/profile" className="w-full">
            <Button
              variant="ghost"
              inverse={inverse}
              className="w-full justify-start"
            >
              PROFILE
            </Button>
          </Link>
          <Link href="/stake" className="w-full">
            <Button
              variant="ghost"
              inverse={inverse}
              className="w-full justify-start"
            >
              STAKE
            </Button>
          </Link>
          <Link
            href="https://eva-online.gitbook.io/eva-agent-online"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button
              variant="ghost"
              inverse={inverse}
              className="w-full justify-start"
            >
              GITBOOK
            </Button>
          </Link>
          <Link href="/assets" className="w-full">
            <Button
              variant="ghost"
              inverse={inverse}
              className="w-full justify-start"
            >
              ASSETS
            </Button>
          </Link>
          <Link href="/og-wall" className="w-full">
            <Button
              variant="ghost"
              inverse={inverse}
              className="w-full justify-start"
            >
              OG WALL
            </Button>
          </Link>
          <Link href="/og-checker" className="w-full">
            <Button
              variant="ghost"
              inverse={inverse}
              className="w-full justify-start"
            >
              OG CLAIM
            </Button>
          </Link>
        </div>
        <SheetFooter className="flex-row flex items-center gap-4">
          <PrimaryButton inverse={inverse}>CONNECT</PrimaryButton>
          <Link
            href="https://x.com/evaonlinexyz"
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
            href="https://app.virtuals.io/geneses/6030"
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
