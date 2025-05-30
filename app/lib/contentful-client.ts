import { createClient } from 'contentful';

// Contentful client configuration
export const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_DELIVERY_API_KEY!,
  environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
});

// Type definitions for Contentful entries
export interface ContentfulProject {
  contentTypeId: 'project';
  fields: {
    slug: string;
    title: string;
    description: string;
    picture: any; // Asset reference
    githubRepoUrl?: string;
    websiteUrl?: string;
    tags: string[];
    projectReadme: any; // Rich text field
    isFeatured?: boolean;
    betterStackStatusId?: string; // For future BetterStack integration
  };
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ContentfulPerson {
  contentTypeId: 'person';
  fields: {
    name: string;
    slug: string;
    occupation: string;
    location: string;
    pronouns: string;
    skills: string[];
    links: Array<{
      url: string;
      name: string;
    }>;
    introduction: any; // Rich text field
    picture: any; // Asset reference
  };
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Transform Contentful data to match existing interfaces
export function transformProject(entry: any): any {
  // Handle both resolved and unresolved asset references
  let pictureUrl = '';
  if (entry.fields.picture) {
    if (entry.fields.picture.fields?.file?.url) {
      // Asset is resolved
      pictureUrl = `https:${entry.fields.picture.fields.file.url}`;
    } else if (entry.fields.picture.sys?.type === 'Link') {
      // Asset is unresolved - we'll need to handle this differently
      console.warn(`Unresolved asset for project ${entry.fields.slug}`);
    }
  }

  return {
    slug: entry.fields.slug,
    title: entry.fields.title,
    description: entry.fields.description,
    picture_url: pictureUrl,
    github_repo_url: entry.fields.githubRepoUrl,
    website_url: entry.fields.websiteUrl,
    tags: entry.fields.tags || [],
    project_readme: entry.fields.projectReadme,
    is_featured: entry.fields.isFeatured || false,
    better_stack_status_id: entry.fields.betterStackStatusId,
    // Status will be fetched separately from BetterStack
  };
}

export function transformPerson(entry: any): any {
  // Handle both resolved and unresolved asset references
  let pictureUrl = '';
  if (entry.fields.picture) {
    if (entry.fields.picture.fields?.file?.url) {
      // Asset is resolved
      pictureUrl = `https:${entry.fields.picture.fields.file.url}`;
    } else if (entry.fields.picture.sys?.type === 'Link') {
      // Asset is unresolved - we'll need to handle this differently
      console.warn(`Unresolved asset for person ${entry.fields.slug}`);
    }
  }

  return {
    name: entry.fields.name,
    slug: entry.fields.slug,
    occupation: entry.fields.occupation,
    location: entry.fields.location,
    pronouns: entry.fields.pronouns,
    skills: entry.fields.skills || [],
    links: entry.fields.links || [],
    introduction: entry.fields.introduction,
    picture_url: pictureUrl,
  };
}
