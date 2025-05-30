import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api/base-handler';
import { cacheManager } from '@/lib/cache/manager';

interface CacheStatsResponse {
  entries: number;
  hitRate: number;
  memoryUsage: {
    used: number;
    limit: number;
  };
  hits: number;
  misses: number;
  evictions: number;
  timestamp: string;
  environment: string;
  uptime: number;
}

export const GET = createApiHandler<CacheStatsResponse>({
  // No caching for cache stats - always get fresh data
  rateLimit: {
    limit: 30, // 30 requests per minute
    windowMs: 60000, // 1 minute
  },

  async fetcher(req: NextRequest): Promise<CacheStatsResponse> {
    console.log('[API] Fetching cache statistics');

    const stats = cacheManager.getStats();

    // Add additional metadata
    const enhancedStats = {
      ...stats,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    };

    return enhancedStats;
  },
});
