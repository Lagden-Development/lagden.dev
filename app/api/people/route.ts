import { NextRequest } from 'next/server';
import { createApiHandler, generateCacheKey } from '@/lib/api/base-handler';
import { CACHE_TTL } from '@/lib/cache/manager';
import { contentfulClient } from '@/lib/contentful-client';
import type { Person } from '@/types';
import { Entry } from 'contentful';

interface ContentfulPerson {
  fields: {
    name: string;
    slug: string;
    occupation: string;
    location: string;
    pronouns: string;
    skills?: string[];
    links?: Array<{
      fields: {
        url: string;
        label: string;
      };
    }>;
    introduction?: any;
    picture?: {
      fields: {
        file: {
          url: string;
        };
      };
    };
  };
}

// Transform Contentful entry to our Person type
function transformPerson(entry: Entry<any>): Person {
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
    name: (fields.name as string) || '',
    slug: (fields.slug as string) || '',
    occupation: (fields.occupation as string) || '',
    location: (fields.location as string) || '',
    pronouns: (fields.pronouns as string) || '',
    skills: (fields.skills as string[]) || [],
    links:
      fields.links?.map((link: any) => ({
        url: link.fields?.url || link.url || '',
        name: link.fields?.label || link.label || '',
      })) || [],
    introduction: fields.introduction || null,
    picture_url: pictureUrl,
  };
}

export const GET = createApiHandler<Person[]>({
  cacheKey: generateCacheKey('people', 'list'),
  cacheTTL: CACHE_TTL.PEOPLE_LIST,
  cacheTags: ['people'],
  rateLimit: {
    limit: 60, // 60 requests per minute
    windowMs: 60000, // 1 minute
  },

  async fetcher(req: NextRequest) {
    try {
      console.log('[API] Fetching people from Contentful');

      const response = await contentfulClient.getEntries({
        content_type: 'person',
        order: ['fields.name'],
        limit: 100,
        include: 2, // Include linked assets (up to 2 levels deep)
      });

      console.log(`[API] Contentful returned ${response.items.length} people`);

      const people = response.items.map(transformPerson);

      return people;
    } catch (error) {
      console.error('[API] Failed to fetch people from Contentful:', error);
      throw error;
    }
  },
});
