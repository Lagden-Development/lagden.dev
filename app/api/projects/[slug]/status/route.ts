import { NextRequest } from 'next/server';
import { CACHE_TTL } from '@/lib/cache/manager';
import { createApiHandler, generateCacheKey } from '@/lib/api/base-handler';
import { contentfulClient } from '@/lib/contentful-client';
import { betterStackClient } from '@/lib/betterstack-client';
import { NotFoundError } from '@/lib/api/errors';

interface StatusResponse {
  status: 'operational' | 'degraded' | 'down' | 'maintenance' | 'unknown';
  last_checked_at: string;
  monitor_url: string;
  uptime_percentage?: number;
  response_time?: number;
  total_downtime?: number;
  incidents_count?: number;
  check_frequency?: number;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  if (!slug) {
    throw new NotFoundError('Project status', 'slug is required');
  }

  const cacheKey = generateCacheKey('projects', 'status', slug);

  return createApiHandler<StatusResponse>({
    cacheKey,
    cacheTTL: CACHE_TTL.STATUS, // 30 seconds
    cacheTags: ['status', `status-${slug}`],
    rateLimit: {
      limit: 120, // 120 requests per minute
      windowMs: 60000, // 1 minute
    },

    async fetcher(): Promise<StatusResponse> {
      console.log(`[API] Fetching status for project: ${slug}`);

      // First, get the project to find the monitor ID
      const projectResponse = await contentfulClient.getEntries({
        content_type: 'project',
        'fields.slug': slug,
        limit: 1,
        select: ['fields.betterStackStatusId'] as any,
      });

      if (projectResponse.items.length === 0) {
        throw new NotFoundError('Project', slug);
      }

      const projectEntry = projectResponse.items[0];
      if (!projectEntry) {
        throw new NotFoundError('Project', slug);
      }

      const monitorId = (projectEntry.fields as any)
        .betterStackStatusId as string;

      if (!monitorId) {
        // Project has no monitoring configured - return default status
        throw new Error('No monitoring configured for this project');
      }

      console.log(
        `[API] Fetching BetterStack status for monitor: ${monitorId}`
      );

      // Fetch status from BetterStack
      const status = await betterStackClient.getMonitorStatus(monitorId);

      if (!status) {
        throw new Error('Failed to fetch status from BetterStack');
      }

      const response: StatusResponse = {
        status: status.status,
        last_checked_at: status.last_checked_at,
        monitor_url: status.monitor_url,
        uptime_percentage: status.uptime_percentage,
        response_time: status.response_time,
        total_downtime: status.total_downtime,
        incidents_count: status.incidents_count,
        check_frequency: status.check_frequency,
      };

      console.log(
        `[API] Status fetched successfully for ${slug}:`,
        response.status
      );

      return response;
    },

    // Custom transform to add nextUpdate metadata
    transform(data) {
      const nextUpdate = Date.now() + CACHE_TTL.STATUS * 1000;
      return {
        ...data,
        _meta: { nextUpdate }
      };
    },
  })(req);
}
