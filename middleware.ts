import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname, searchParams } = request.nextUrl;

  // Handle canonical URLs - remove query parameters for SEO
  if (searchParams.has('from') && pathname.startsWith('/projects/')) {
    const canonicalUrl = new URL(pathname, request.url);
    response.headers.set(
      'Link',
      `<${canonicalUrl.toString()}>; rel="canonical"`
    );
  }

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Add cache headers based on path

  // Static assets - long cache
  if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
  }

  // API routes - no cache
  else if (pathname.startsWith('/api/')) {
    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  // Dynamic pages - short cache with revalidation
  else if (
    pathname.startsWith('/projects/') ||
    pathname.startsWith('/people/')
  ) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=60, stale-while-revalidate=300'
    );
  }

  // List pages - medium cache
  else if (pathname === '/projects' || pathname === '/people') {
    response.headers.set(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=600'
    );
  }

  // Homepage - short cache
  else if (pathname === '/') {
    response.headers.set(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=600'
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
