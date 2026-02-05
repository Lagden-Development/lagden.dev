import { NextResponse } from 'next/server';

/**
 * Simple ping endpoint for Docker/Coolify health checks.
 * Returns 200 OK if the application is running.
 * Does NOT check external services - use /api/health for that.
 */
export async function GET() {
  return NextResponse.json(
    { status: 'ok', timestamp: new Date().toISOString() },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}
