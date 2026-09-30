import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const javaApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(
    /\/$/,
    '',
  );
  const canProxyToJava =
    javaApiBaseUrl && request.nextUrl.pathname.startsWith('/api/');
  if (canProxyToJava) {
    try {
      const target = `${javaApiBaseUrl}${request.nextUrl.pathname}${request.nextUrl.search}`;
      const backendHeaders = new Headers(request.headers);
      backendHeaders.delete('host');
      backendHeaders.delete('content-length');
      const backendResponse = await fetch(target, {
        method: request.method,
        headers: backendHeaders,
        body:
          request.method === 'GET' || request.method === 'HEAD'
            ? undefined
            : await request.clone().arrayBuffer(),
        redirect: 'manual',
      });
      return new NextResponse(backendResponse.body, {
        status: backendResponse.status,
        headers: backendResponse.headers,
      });
    } catch {
      return NextResponse.json(
        { error: 'Java API unavailable' },
        { status: 503 },
      );
    }
  }
  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
