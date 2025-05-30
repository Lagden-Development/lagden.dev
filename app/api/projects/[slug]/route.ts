import { NextRequest } from 'next/server';
import { CACHE_TTL } from '@/lib/cache/manager';
import { createApiHandler, generateCacheKey } from '@/lib/api/base-handler';
import { contentfulClient } from '@/lib/contentful-client';
import { NotFoundError } from '@/lib/api/errors';
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

  // Extract image URL from Contentful asset reference
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
    project_readme: fields.projectReadme || {
      nodeType: 'document',
      content: [],
      data: {},
    },
    picture_url: pictureUrl,
    better_stack_status_id: (fields.betterStackStatusId as string) || '',
    is_featured: false, // Field doesn't exist in Contentful - set default
  };
}

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
      console.log(`[API] Fetching project with slug: ${slug}`);

      const response = await contentfulClient.getEntries({
        content_type: 'project',
        'fields.slug': slug,
        limit: 1,
        include: 2, // Include linked assets
      });

      if (response.items.length === 0) {
        throw new NotFoundError('Project', slug);
      }

      const projectEntry = response.items[0];
      if (!projectEntry) {
        throw new NotFoundError('Project', slug);
      }

      console.log(`[API] Found project: ${(projectEntry.fields as any).title}`);

      return transformProject(projectEntry);
    },
  })(req);
}
