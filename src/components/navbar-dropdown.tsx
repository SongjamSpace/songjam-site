"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";

interface NavbarDropdownProps {
  inverse?: boolean;
}

export default function NavbarDropdown({ inverse }: NavbarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        className={`flex items-center gap-1 ${
          inverse ? "text-[#48333D] hover:text-[#48333D]/60" : ""
        }`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
      >
        MINDSHARE
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {isOpen && (
        <div
          className="absolute top-full left-0 w-48 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg z-50"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="py-2">
            <Link href="/adam" target="_blank">
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-2 text-left hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                $ADAM
              </Button>
            </Link>
            <Link href="/genesis-leaderboard" target="_blank">
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-2 text-left hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                Songjam Genesis
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
