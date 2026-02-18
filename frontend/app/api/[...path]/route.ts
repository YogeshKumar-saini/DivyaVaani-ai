/**
 * Catch-all API proxy route
 *
 * Every request the browser sends to /api/* is handled here as a Vercel
 * serverless function. The function forwards the request to the FastAPI
 * backend on EC2 and streams the response back to the browser.
 *
 * Why a Route Handler instead of next.config.ts rewrites?
 * - Route Handlers are guaranteed to run on Vercel's serverless runtime
 * - They are NOT affected by `output: "standalone"` packaging
 * - BACKEND_URL is read at request-time (server-only), never baked into the
 *   client bundle, so no NEXT_PUBLIC_ variable can leak into the browser
 * - Works with streaming (SSE) responses via ReadableStream passthrough
 */

import { NextRequest, NextResponse } from 'next/server';

function getBackendOrigin(req: NextRequest): { origin: string; error?: string } {
  const raw = (process.env.BACKEND_URL ?? '').trim();

  if (!raw) {
    return {
      origin: '',
      error: 'BACKEND_URL is not set. Add it in Vercel Project Settings -> Environment Variables.',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return {
      origin: '',
      error: `BACKEND_URL is not a valid URL: "${raw}"`,
    };
  }

  const frontendHost = req.headers.get('host') ?? '';
  if (frontendHost && parsed.host === frontendHost) {
    return {
      origin: '',
      error: `BACKEND_URL points to the frontend host (${parsed.host}). It must point to your backend server (for example http://<backend-ip>:8000).`,
    };
  }

  if (parsed.pathname && parsed.pathname !== '/' && parsed.pathname.startsWith('/api')) {
    return {
      origin: '',
      error: `BACKEND_URL should not include an /api path: "${raw}"`,
    };
  }

  return {
    origin: parsed.origin.replace(/\/+$/, ''),
  };
}

// 25-second timeout — Vercel Hobby limit is 10s, Pro is 60s.
// Keeps us well under the Pro limit while failing fast on a dead backend.
const PROXY_TIMEOUT_MS = 25_000;

/**
 * Forward a Next.js request to the backend and return the response.
 * Handles GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS.
 */
async function proxyRequest(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const backend = getBackendOrigin(req);

  if (backend.error) {
    console.error(`[API proxy] Misconfigured BACKEND_URL: ${backend.error}`);
    return NextResponse.json(
      {
        detail: 'Proxy misconfigured',
        hint: backend.error,
      },
      { status: 503 }
    );
  }

  const { path } = await params;

  // Reconstruct the backend URL: /api/foo/bar?x=1 → BACKEND/foo/bar?x=1
  const pathStr = path.join('/');
  const search = req.nextUrl.search; // includes leading '?'
  const targetUrl = `${backend.origin}/${pathStr}${search}`;

  // Forward request body for methods that carry one
  const hasBody = !['GET', 'HEAD'].includes(req.method);
  const body = hasBody ? req.body : undefined;

  // Build forwarded headers (strip host so EC2 doesn't see Vercel's hostname)
  const forwardedHeaders = new Headers(req.headers);
  forwardedHeaders.delete('host');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

  try {
    const backendResponse = await fetch(targetUrl, {
      method: req.method,
      headers: forwardedHeaders,
      body,
      // Always follow redirects server-side so the browser never receives a
      // Location: http://... header that would trigger a mixed-content block.
      redirect: 'follow',
      signal: controller.signal,
      // Required so ReadableStream body is forwarded without buffering
      // @ts-expect-error — Node 18+ fetch supports this flag
      duplex: 'half',
    });

    clearTimeout(timer);

    // Pass the response (including streaming SSE) straight through to the
    // browser.  NextResponse accepts a ReadableStream as the body.
    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: backendResponse.headers,
    });
  } catch (err) {
    clearTimeout(timer);

    const isTimeout = err instanceof Error && err.name === 'AbortError';
    console.error(`[API proxy] ${isTimeout ? 'Timeout' : 'Error'} reaching backend at ${targetUrl}:`, err);

    return NextResponse.json(
      {
        detail: isTimeout ? 'Backend request timed out' : 'Backend unreachable',
        target: targetUrl,
        hint: 'Verify BACKEND_URL in Vercel → Settings → Environment Variables includes the port (e.g. http://54.84.227.171:8000).',
      },
      { status: isTimeout ? 504 : 502 }
    );
  }
}

export const GET     = proxyRequest;
export const POST    = proxyRequest;
export const PUT     = proxyRequest;
export const PATCH   = proxyRequest;
export const DELETE  = proxyRequest;
export const HEAD    = proxyRequest;
export const OPTIONS = proxyRequest;
