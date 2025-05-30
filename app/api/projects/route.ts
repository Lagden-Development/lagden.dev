import { NextRequest } from 'next/server';
import {
  createApiHandler,
  generateCacheKey,
  parseQueryParams,
} from '@/lib/api/base-handler';
import { CACHE_TTL } from '@/lib/cache/manager';
import { contentfulClient } from '@/lib/contentful-client';
import type { Project } from '@/types';
import { Entry } from 'contentful';

interface ContentfulProject {
  fields: {
    title: string;
    slug: string;
    description: string;
    tags?: string[];
    githubRepoUrl?: string;
    websiteUrl?: string;
    projectReadme?: any;
    picture?: {
      fields: {
        file: {
          url: string;
        };
      };
    };
    betterStackStatusId?: string;
    isFeatured?: boolean;
  };
}

// Transform Contentful entry to our Project type
function transformProject(entry: Entry<any>): Project {
  const fields = entry.fields as any;

  // Extract image URL from resolved Contentful asset
  let pictureUrl = '';
  if (fields.picture && fields.picture.fields && fields.picture.fields.file) {
    pictureUrl = fields.picture.fields.file.url as string;
    // Ensure it starts with https://
    if (pictureUrl.startsWith('//')) {
      pictureUrl = `https:${pictureUrl}`;
    }
  }

  return {
    title: (fields.title as string) || '',
    slug: (fields.slug as string) || '',
    description: (fields.description as string) || '',
    tags: (fields.tags as string[]) || [],
    github_repo_url: (fields.githubRepoUrl as string) || '',
    website_url: (fields.websiteUrl as string) || '',
    project_readme: (fields.projectReadme as any) || {
      nodeType: 'document',
      content: [],
      data: {},
    },
    picture_url: pictureUrl,
    better_stack_status_id: (fields.betterStackStatusId as string) || '',
    is_featured: (fields.isFeatured as boolean) || false, // Now using the actual field
  };
}

export const GET = async (req: NextRequest) => {
  // Generate dynamic cache key based on query parameters
  const params = parseQueryParams(req);
  const cacheKey =
    params.featured === 'true'
      ? generateCacheKey('projects', 'list', 'featured')
      : generateCacheKey('projects', 'list', 'all');

  return createApiHandler<Project[]>({
    cacheKey,
    cacheTTL: CACHE_TTL.PROJECTS_LIST,
    cacheTags: ['projects'],
    rateLimit: {
      limit: 60, // 60 requests per minute
      windowMs: 60000, // 1 minute
    },

    async fetcher(req: NextRequest) {
      try {
        console.log('[API] Fetching projects from Contentful');

        const response = await contentfulClient.getEntries({
          content_type: 'project',
          order: ['-sys.createdAt'],
          limit: 100,
          include: 2, // Include linked assets (up to 2 levels deep)
        });

        console.log(
          `[API] Contentful returned ${response.items.length} projects`
        );

        const projects = response.items.map(transformProject);

        // Apply filtering based on query params
        const params = parseQueryParams(req);

        if (params.featured === 'true') {
          return projects.filter((p) => p.is_featured);
        }

        return projects;
      } catch (error) {
        console.error('[API] Failed to fetch projects from Contentful:', error);
        throw error;
      }
    },
  })(req);
};
