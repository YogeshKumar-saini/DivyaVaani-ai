import { NextRequest, NextResponse } from 'next/server';

function getBackendOrigin(): string {
  const configured = (process.env.BACKEND_URL ?? '').trim();
  if (configured) return configured.replace(/\/+$/, '');
  // Local DX fallback: avoids hard failures when BACKEND_URL is missing in dev.
  if (process.env.NODE_ENV !== 'production') return 'http://localhost:8000';
  return '';
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
  const backendOrigin = getBackendOrigin();
  console.log('[API Proxy] NODE_ENV:', process.env.NODE_ENV);
  console.log('[API Proxy] BACKEND_URL:', process.env.BACKEND_URL);
  console.log('[API Proxy] Resolved Origin:', backendOrigin);

  if (!backendOrigin) {
    return NextResponse.json(
      {
        detail: 'BACKEND_URL is not set',
      },
      { status: 503 }
    );
  }

  const { path } = await params;

  // Reconstruct the backend URL: /api/foo/bar?x=1 → BACKEND/foo/bar?x=1
  const pathStr = path.join('/');
  const search = req.nextUrl.search; // includes leading '?'
  const targetUrl = `${backendOrigin}/${pathStr}${search}`;

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

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const HEAD = proxyRequest;
export const OPTIONS = proxyRequest;
