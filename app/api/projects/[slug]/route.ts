import { NextRequest } from 'next/server';
import { CACHE_TTL } from '@/lib/cache/manager';
import { createApiHandler, generateCacheKey } from '@/lib/api/base-handler';
import { getProjectBySlug } from '@/lib/data/projects';
import { NotFoundError } from '@/lib/api/errors';
import type { Project } from '@/types';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  if (!slug) {
    throw new NotFoundError('Project', 'slug is required');
  }

  const cacheKey = generateCacheKey('projects', 'detail', slug);

  return createApiHandler<Project>({
    cacheKey,
    cacheTTL: CACHE_TTL.PROJECTS_DETAIL,
    cacheTags: ['projects', `project-${slug}`],
    rateLimit: {
      limit: 120, // 120 requests per minute
      windowMs: 60000, // 1 minute
    },

    async fetcher() {
      // Use shared fetcher - cache is managed there
      return getProjectBySlug(slug);
    },
  })(req);
}
