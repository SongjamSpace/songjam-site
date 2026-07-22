import { detectBot, buildPayload, sendDetectEvent } from '@munerate/bot-id';

const botIdConfig = {
  siteId: 'eb952b00-b1e6-4a28-a3e2-e5ad55a2378d',
  apiEndpoint: 'https://munerate-ingest-server.onrender.com',
  siteTag: 'fl_pub_e79a1f46805b8386c45526e8c0c8cdf7',
};

// Edge middleware for any framework on platforms like Vercel, AWS Amplify,
// Netlify, or self-hosted. Detects bots, then passes through.
export default function middleware(request: Request, event: any) {
  const url = new URL(request.url);
  const bot = detectBot(request.headers.get('user-agent') || '');

  if (bot) {
    console.log("Detected Munerate Bot:", bot);
    const payload = buildPayload(request, botIdConfig, url.pathname, false, bot);
    const send = sendDetectEvent(botIdConfig, payload, botIdConfig.siteTag).catch(() => { console.log("Failed to log Munerate Event") });
    if (event?.waitUntil) event.waitUntil(send);
  }

  // returning nothing lets the request pass through normally
}

export const config = {
  // run on document requests, skip static assets
  matcher: ['/((?!assets|favicon\\.ico).*)'],
};