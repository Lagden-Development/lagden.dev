import { cacheManager, CACHE_TTL } from '@/lib/cache/manager';
import { generateCacheKey } from '@/lib/api/base-handler';
import { contentfulClient } from '@/lib/contentful-client';
import { NotFoundError } from '@/lib/api/errors';
import type { Project } from '@/types';
import { Entry } from 'contentful';

// Transform Contentful entry to our Project type
// This is shared between the API route and internal callers
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

/**
 * Fetch a project by slug with caching.
 * Uses the same cache key as /api/projects/[slug] so cache is shared.
 * This allows internal API routes (like commits) to access project data
 * without making HTTP self-calls.
 */
export async function getProjectBySlug(slug: string): Promise<Project> {
  const cacheKey = generateCacheKey('projects', 'detail', slug);

  const project = await cacheManager.get<Project>(
    cacheKey,
    async () => {
      console.log(`[getProjectBySlug] Fetching project with slug: ${slug}`);

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

      console.log(
        `[getProjectBySlug] Found project: ${(projectEntry.fields as any).title}`
      );

      return transformProject(projectEntry);
    },
    { ttl: CACHE_TTL.PROJECTS_DETAIL, tags: ['projects', `project-${slug}`] }
  );

  if (!project) {
    throw new NotFoundError('Project', slug);
  }

  return project;
}
