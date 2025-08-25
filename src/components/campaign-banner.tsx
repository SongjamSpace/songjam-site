"use client";

import type { ReactNode } from "react";
import Link from "next/link";

interface CampaignBannerProps {
  label?: string;
  value?: string;
  icon?: ReactNode;
  href?: string;
}

export default function CampaignBanner({
  label = "Live Mindshare Campaign",
  value = "Pharmachain AI",
  icon,
  href = "/pharmachainai",
}: CampaignBannerProps) {
  const content = (
    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/30 via-fuchsia-500/30 to-emerald-500/30 border border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.08)] hover:from-indigo-500/40 hover:via-fuchsia-500/40 hover:to-emerald-500/40 transition-colors">
      {icon ? (
        <div className="h-5 w-5 flex items-center justify-center text-white/90">
          {icon}
        </div>
      ) : (
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
      )}
      <span
        className="text-xs uppercase tracking-wider text-white/80"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {label}
      </span>
      <span
        className="text-sm font-semibold"
        style={{ fontFamily: "Orbitron, sans-serif" }}
      >
        {value}
      </span>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-full"
      >
        {content}
      </Link>
    );
  }

  return content;
}
