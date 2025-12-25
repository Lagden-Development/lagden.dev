import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler, generateCacheKey } from '@/lib/api/base-handler';
import { getProjectBySlug } from '@/lib/data/projects';
import type { Commit } from '@/types';

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  html_url: string;
  author?: {
    login: string;
    avatar_url: string;
  };
}

interface CommitsApiResponse {
  project_title: string;
  repository_url: string;
  commits: Commit[];
}

async function fetchCommitsData(slug: string): Promise<CommitsApiResponse> {
  // Get the project from cache/Contentful (no HTTP self-call needed)
  const project = await getProjectBySlug(slug);

  if (!project.github_repo_url) {
    throw new Error(`No GitHub repository found for project: ${slug}`);
  }

  // Extract owner and repo from GitHub URL
  const githubMatch = project.github_repo_url.match(
    /github\.com\/([^\/]+)\/([^\/]+)/
  );
  if (!githubMatch) {
    throw new Error(`Invalid GitHub URL format: ${project.github_repo_url}`);
  }

  const [, owner, repo] = githubMatch;

  // Fetch commits from GitHub API (public API, no auth required)
  const commitsResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`,
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'lagden.dev-website',
      },
      next: { revalidate: 0 },
    }
  );

  if (!commitsResponse.ok) {
    if (commitsResponse.status === 404) {
      throw new Error(`Repository not found: ${owner}/${repo}`);
    }
    throw new Error(
      `GitHub API error: ${commitsResponse.status} ${commitsResponse.statusText}`
    );
  }

  const githubCommits: GitHubCommit[] = await commitsResponse.json();

  // Transform GitHub commits to our format
  const commits: Commit[] = githubCommits.map((commit) => ({
    sha: commit.sha,
    message: commit.commit.message,
    author_name: commit.commit.author.name,
    author_email: commit.commit.author.email,
    date: commit.commit.author.date,
    url: commit.html_url,
    author_username: commit.author?.login,
    author_avatar: commit.author?.avatar_url,
  }));

  return {
    project_title: project.title,
    repository_url: project.github_repo_url,
    commits,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const handler = createApiHandler<CommitsApiResponse>({
    cacheKey: generateCacheKey('commits', slug),
    cacheTTL: parseInt(process.env.CACHE_COMMITS || '300'), // 5 minutes default
    cacheTags: ['commits', `commits:${slug}`],
    rateLimit: {
      limit: 30, // 30 requests per minute
      windowMs: 60000, // 1 minute
    },
    fetcher: async () => fetchCommitsData(slug),
  });

  return handler(request);
}
