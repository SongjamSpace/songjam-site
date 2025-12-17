import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import "@neynar/react/dist/style.css";

export const metadata: Metadata = {
  title: "Songjam - The Future of Engagement",
  description:
    "Agentic CRM and AI-powered outreach for X Spaces. Supercharge your engagement and grow your audience with the power of verifiable human connection.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;500;600;700&family=Audiowide&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
