import { NextRequest, NextResponse } from 'next/server';

function getBackendOrigin(): string {
  const configured = (process.env.BACKEND_URL ?? '').trim();
  console.log('[API Proxy] BACKEND_URL from env:', configured);
  if (configured) return configured.replace(/\/+$/, '');
  return '';
}

const PROXY_TIMEOUT_MS = 25_000;

async function proxyRequest(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const backendOrigin = getBackendOrigin();
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

  // Read body as blob/buffer instead of streaming to avoid Node duplex issues
  // Clone the request first to avoid "detached ArrayBuffer" errors
  let body: BodyInit | null | undefined = undefined;
  if (hasBody) {
    try {
      // Clone the request before reading the body to avoid detaching the original.
      // Use Uint8Array (a copy of the ArrayBuffer) so the buffer is never
      // transferred/detached when undici follows a redirect and re-reads the body.
      const clonedReq = req.clone();
      const arrayBuffer = await clonedReq.arrayBuffer();
      if (arrayBuffer.byteLength > 0) {
        body = new Uint8Array(arrayBuffer.slice(0));  // explicit copy prevents detachment
      }
    } catch (e) {
      console.error('[API Proxy] Error reading request body:', e);
    }
  }

  // Build forwarded headers (strip host so EC2 doesn't see Vercel's hostname)
  const forwardedHeaders = new Headers(req.headers);
  forwardedHeaders.delete('host');
  forwardedHeaders.delete('content-length'); // Let fetch recalculate content-length

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
      cache: 'no-store',
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
