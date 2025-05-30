import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/api/base-handler';
import { config } from '@/lib/config';
import { cacheManager } from '@/lib/cache/manager';
import { contentfulClient } from '@/lib/contentful-client';
import { betterStackClient } from '@/lib/betterstack-client';

interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  error?: string;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    api: ServiceHealth;
    contentful: ServiceHealth;
    betterstack: ServiceHealth;
    cache: ServiceHealth & {
      entries?: number;
      hitRate?: number;
      memoryUsage?: {
        used: number;
        limit: number;
      };
    };
  };
  environment: {
    nodeVersion: string;
    region: string;
    deployment: string;
  };
}

const startTime = Date.now();

async function checkContentfulHealth(): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    // Try to fetch a minimal amount of data
    const response = await contentfulClient.getEntries({
      content_type: 'project',
      limit: 1,
      select: ['sys.id'],
    });

    return {
      status: 'up',
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'down',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkBetterStackHealth(): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    // Ping BetterStack's main domain to test if their service is reachable
    const response = await fetch('https://betterstack.com', {
      method: 'HEAD', // Just check if BetterStack is reachable
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (response.ok) {
      return {
        status: 'up',
        latency: Date.now() - start,
      };
    } else {
      return {
        status: 'down',
        latency: Date.now() - start,
        error: `BetterStack returned ${response.status}`,
      };
    }
  } catch (error) {
    return {
      status: 'down',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'BetterStack unreachable',
    };
  }
}

function getCacheHealth(): ServiceHealth & {
  entries?: number;
  hitRate?: number;
  memoryUsage?: any;
} {
  try {
    const stats = cacheManager.getStats();

    return {
      status: 'up',
      entries: stats.entries,
      hitRate: stats.hitRate,
      memoryUsage: {
        used: stats.memoryUsage.used,
        limit: stats.memoryUsage.limit,
      },
    };
  } catch (error) {
    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export const GET = createApiHandler<HealthResponse>({
  // No caching for health checks - always get fresh data
  rateLimit: {
    limit: 60, // 60 requests per minute
    windowMs: 60000, // 1 minute
  },

  async fetcher(req: NextRequest): Promise<HealthResponse> {
    // Check all services in parallel
    const [contentfulHealth, betterStackHealth] = await Promise.all([
      checkContentfulHealth(),
      checkBetterStackHealth(), // Now checking BetterStack domain connectivity
    ]);

    const cacheHealth = getCacheHealth();

    // Determine overall health status
    const services = [contentfulHealth, betterStackHealth, cacheHealth];
    const downServices = services.filter((s) => s.status === 'down').length;
    const degradedServices = services.filter(
      (s) => s.status === 'degraded'
    ).length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (downServices > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedServices > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    const healthData: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: config.environment,
      uptime: Date.now() - startTime,
      services: {
        api: {
          status: 'up',
          latency: 0,
        },
        contentful: contentfulHealth,
        betterstack: betterStackHealth,
        cache: cacheHealth,
      },
      environment: {
        nodeVersion: process.version,
        region: 'local',
        deployment: config.environment,
      },
    };

    return healthData;
  },

  // Add no-cache headers for health checks
  onError(error) {
    const response = new NextResponse(
      JSON.stringify({
        error: {
          code: 'HEALTH_CHECK_FAILED',
          message: error instanceof Error ? error.message : 'Health check failed'
        }
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
    return response;
  }
});
