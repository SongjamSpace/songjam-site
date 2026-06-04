import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';
import { detectBot } from '@aiedx/fetchlens-core';

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // Use fetchlens-core to detect bots
  const bot = detectBot(userAgent);
  const isAI = bot && bot.category === 'ai';

  // Log the visit to LogSnag asynchronously
  const logPromise = fetch('https://api.logsnag.com/v1/log', {
    method: 'POST',
    headers: { 
      'Authorization': 'Bearer cf410b022ad002f05f80af9a6c29c4d2', 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({
      project: "bot-or-human",
      channel: "visits",
      event: bot ? "Bot Visit" : "Human Visit",
      description: bot ? `[songjam.space] Bot: ${bot.name} (${bot.provider})` : `[songjam.space] User Agent: ${userAgent}`,
      icon: bot ? "🤖" : "👤",
      tags: { 
        category: bot?.category || "human",
        name: bot?.name || "unknown",
        ai: isAI ? "true" : "false",
        site: "songjam.space"
      }
    })
  }).catch(err => console.error("LogSnag Error:", err));

  // Ensure the fetch completes even after the response is sent
  if (event && event.waitUntil) {
    event.waitUntil(logPromise);
  }

  if (isAI) {
    // Return 402 Payment Required for AI agents
    return new NextResponse(
      JSON.stringify({ 
        error: "Payment Required", 
        message: "AI training/scraping access requires a license." 
      }),
      { 
        status: 402, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  // Returning NextResponse.next() tells Next.js to pass the request through normally
  return NextResponse.next();
}

export const config = {
  // Only run the middleware on document requests, skip static assets and Next.js internal paths
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json (metadata files)
     * - Any path containing a dot (e.g. static files like sound.wav, images, etc.)
     */
    '/((?!api|_next/static|_next/image|assets|vite\\.svg|favicon\\.ico|manifest\\.json|.*\\..*).*)',
  ],
};
