import { NextRequest } from 'next/server';
import { createApiHandler, generateCacheKey } from '@/lib/api/base-handler';
import { CACHE_TTL } from '@/lib/cache/manager';
import { contentfulClient } from '@/lib/contentful-client';
import { NotFoundError } from '@/lib/api/errors';
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

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  if (!slug) {
    throw new NotFoundError('Person', 'slug is required');
  }

  return createApiHandler<Person>({
    cacheKey: generateCacheKey('people', 'detail', slug),
    cacheTTL: CACHE_TTL.PEOPLE_DETAIL,
    cacheTags: ['people', `person-${slug}`],
    rateLimit: {
      limit: 120, // 120 requests per minute
      windowMs: 60000, // 1 minute
    },

    async fetcher(req: NextRequest) {
      console.log(`[API] Fetching person with slug: ${slug}`);

      const response = await contentfulClient.getEntries({
        content_type: 'person',
        'fields.slug': slug,
        limit: 1,
        include: 2, // Include linked assets
      });

      if (response.items.length === 0) {
        throw new NotFoundError('Person', slug);
      }

      const personEntry = response.items[0];
      if (!personEntry) {
        throw new NotFoundError('Person', slug);
      }

      console.log(`[API] Found person: ${(personEntry.fields as any).name}`);

      return transformPerson(personEntry);
    },
  })(req);
}
