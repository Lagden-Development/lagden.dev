import { unstable_cache } from 'next/cache';
import type { Project, Person, Commit } from '@/types';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheTime?: number;
  headers?: Record<string, string>;
}

interface ApiError extends Error {
  status?: number;
  statusText?: string;
}

// API response interface matching our new unified format
interface ApiResponse<T> {
  data: T | null;
  meta: {
    cached: boolean;
    cacheAge?: number;
    ttl?: number;
    nextUpdate?: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

// Helper to extract data from API response
function extractData<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(
      `API Error [${response.error.code}]: ${response.error.message}`
    );
  }

  if (response.data === null) {
    throw new Error('API returned null data');
  }

  return response.data;
}

class ApiClient {
  private baseUrl: string;
  private apiKey: string;
  private defaultTimeout = 10000; // 10 seconds
  private defaultRetries = 3;
  private defaultRetryDelay = 1000; // 1 second

  // In-memory cache for request deduplication
  private requestCache = new Map<string, Promise<any>>();

  constructor() {
    // Use local API routes
    this.baseUrl = '';
    this.apiKey = ''; // No longer needed for local API routes
  }

  private createRequestKey(url: string, options: ApiOptions): string {
    return `${options.method || 'GET'}:${url}:${JSON.stringify(options.headers || {})}`;
  }

  private async makeRequest<T>(
    url: string,
    options: ApiOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      headers = {},
    } = options;

    // In server context, we need absolute URLs
    let fullUrl = url;
    if (typeof window === 'undefined' && url.startsWith('/')) {
      // Server-side: always use localhost (Docker container)
      fullUrl = `http://localhost:3000${url}`;
    }

    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: AbortSignal.timeout(timeout),
    };

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(fullUrl, requestOptions);

        if (!response.ok) {
          const error: ApiError = new Error(
            `HTTP ${response.status}: ${response.statusText}`
          );
          error.status = response.status;
          error.statusText = response.statusText;

          // Don't retry on client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            throw error;
          }

          // Retry on server errors (5xx) and network issues
          if (attempt === retries) {
            throw error;
          }

          // Exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * Math.pow(2, attempt))
          );
          continue;
        }

        return await response.json();
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms`);
        }

        if (attempt === retries) {
          throw error;
        }

        // Wait before retrying
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * Math.pow(2, attempt))
        );
      }
    }

    throw new Error('Max retries exceeded');
  }

  async get<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const url = endpoint;
    const requestKey = this.createRequestKey(url, {
      ...options,
      method: 'GET',
    });

    // Request deduplication - return existing promise if same request is in flight
    if (this.requestCache.has(requestKey)) {
      return this.requestCache.get(requestKey);
    }

    const requestPromise = this.makeRequest<T>(url, {
      ...options,
      method: 'GET',
    });

    // Cache the promise
    this.requestCache.set(requestKey, requestPromise);

    // Clean up cache after request completes
    requestPromise.finally(() => {
      setTimeout(() => {
        this.requestCache.delete(requestKey);
      }, 100); // Small delay to allow for duplicate requests
    });

    return requestPromise;
  }

  // Health check method for new health endpoint
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    latency: number;
  }> {
    const start = Date.now();
    try {
      const response = await this.get<ApiResponse<any>>('/api/health', {
        timeout: 5000,
        retries: 0,
      });
      const healthData = extractData(response);

      return {
        status: healthData.status === 'healthy' ? 'healthy' : 'unhealthy',
        latency: Date.now() - start,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - start,
      };
    }
  }
}

// Singleton instance
export const apiClient = new ApiClient();

// Cached API functions using new endpoints
export const getProjects = unstable_cache(
  async (featuredOnly?: boolean): Promise<Project[]> => {
    console.log('[getProjects] Starting fetch, featuredOnly:', featuredOnly);
    try {
      const url = featuredOnly
        ? '/api/projects?featured=true'
        : '/api/projects';
      const response = await apiClient.get<ApiResponse<Project[]>>(url);

      console.log('[getProjects] API response meta:', response.meta);

      const projects = extractData(response);

      console.log(
        '[getProjects] Returning projects count:',
        projects?.length || 0
      );
      console.log(
        '[getProjects] First project picture_url:',
        projects?.[0]?.picture_url || 'NO PROJECTS'
      );
      return projects;
    } catch (error) {
      console.error('[getProjects] Failed to fetch projects:', error);
      console.log('[getProjects] Returning empty array');
      return [];
    }
  },
  ['projects-v3'], // Changed cache key to invalidate old cache
  {
    revalidate: 3600, // 1 hour
    tags: ['projects'],
  }
);

export const getProject = unstable_cache(
  async (slug: string): Promise<Project | null> => {
    try {
      console.log(`[getProject] Fetching project: ${slug}`);
      const response = await apiClient.get<ApiResponse<Project>>(
        `/api/projects/${slug}`
      );
      const project = extractData(response);

      console.log(`[getProject] Found project: ${project.title}`);
      return project;
    } catch (error) {
      console.error(`[getProject] Failed to fetch project ${slug}:`, error);
      return null;
    }
  },
  ['project-v2'],
  {
    revalidate: 300, // 5 minutes
    tags: ['project'],
  }
);

export const getPeople = unstable_cache(
  async (): Promise<Person[]> => {
    try {
      console.log('[getPeople] Starting fetch');
      const response =
        await apiClient.get<ApiResponse<Person[]>>('/api/people');

      console.log('[getPeople] API response meta:', response.meta);

      const people = extractData(response);

      console.log('[getPeople] Returning people:', people?.length || 0);
      return people;
    } catch (error) {
      console.error('[getPeople] Failed to fetch people:', error);
      console.log('[getPeople] Returning empty array');
      return [];
    }
  },
  ['people-v2'],
  {
    revalidate: 7200, // 2 hours
    tags: ['people'],
  }
);

export const getPerson = unstable_cache(
  async (slug: string): Promise<Person | null> => {
    try {
      console.log(`[getPerson] Fetching person: ${slug}`);
      const response = await apiClient.get<ApiResponse<Person>>(
        `/api/people/${slug}`
      );
      const person = extractData(response);

      console.log(`[getPerson] Found person: ${person.name}`);
      return person;
    } catch (error) {
      console.error(`[getPerson] Failed to fetch person ${slug}:`, error);
      return null;
    }
  },
  ['person-v2'],
  {
    revalidate: 600, // 10 minutes
    tags: ['person'],
  }
);

export const getCommits = unstable_cache(
  async (
    projectSlug: string
  ): Promise<{
    project_title: string;
    repository_url: string;
    commits: Commit[];
  }> => {
    try {
      console.log(`[getCommits] Fetching commits for: ${projectSlug}`);
      const response = await apiClient.get<
        ApiResponse<{
          project_title: string;
          repository_url: string;
          commits: Commit[];
        }>
      >(`/api/projects/${projectSlug}/commits`);

      console.log('[getCommits] API response meta:', response.meta);

      const commitsData = extractData(response);

      console.log(
        `[getCommits] Found ${commitsData.commits.length} commits for ${projectSlug}`
      );
      return commitsData;
    } catch (error) {
      console.error(
        `[getCommits] Failed to fetch commits for ${projectSlug}:`,
        error
      );
      // Return empty data structure on error
      return {
        project_title: projectSlug
          .replace('-', ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        repository_url: '',
        commits: [],
      };
    }
  },
  ['commits-v2'],
  {
    revalidate: 300, // 5 minutes
    tags: ['commits'],
  }
);

// New function to get project status
export const getProjectStatus = async (projectSlug: string) => {
  try {
    console.log(`[getProjectStatus] Fetching status for: ${projectSlug}`);
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/projects/${projectSlug}/status`
    );

    const statusData = extractData(response);

    // Include metadata for real-time updates
    return {
      ...statusData,
      meta: response.meta,
    };
  } catch (error) {
    console.error(
      `[getProjectStatus] Failed to fetch status for ${projectSlug}:`,
      error
    );
    return null;
  }
};

// Client-side API functions (for components to use)
export const getProjectsClient = async (
  featuredOnly?: boolean
): Promise<Project[]> => {
  try {
    const url = featuredOnly ? '/api/projects?featured=true' : '/api/projects';
    const response = await apiClient.get<ApiResponse<Project[]>>(url);
    return extractData(response);
  } catch (error) {
    console.error('[getProjectsClient] Failed to fetch projects:', error);
    return [];
  }
};

export const getProjectClient = async (
  slug: string
): Promise<Project | null> => {
  try {
    const response = await apiClient.get<ApiResponse<Project>>(
      `/api/projects/${slug}`
    );
    return extractData(response);
  } catch (error) {
    console.error('[getProjectClient] Failed to fetch project:', error);
    return null;
  }
};

export const getPeopleClient = async (): Promise<Person[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Person[]>>('/api/people');
    return extractData(response);
  } catch (error) {
    console.error('[getPeopleClient] Failed to fetch people:', error);
    return [];
  }
};

export const getPersonClient = async (slug: string): Promise<Person | null> => {
  try {
    const response = await apiClient.get<ApiResponse<Person>>(
      `/api/people/${slug}`
    );
    return extractData(response);
  } catch (error) {
    console.error('[getPersonClient] Failed to fetch person:', error);
    return null;
  }
};

export const getCommitsClient = async (
  projectSlug: string
): Promise<{
  project_title: string;
  repository_url: string;
  commits: Commit[];
}> => {
  try {
    const response = await apiClient.get<
      ApiResponse<{
        project_title: string;
        repository_url: string;
        commits: Commit[];
      }>
    >(`/api/projects/${projectSlug}/commits`);
    return extractData(response);
  } catch (error) {
    console.error('[getCommitsClient] Failed to fetch commits:', error);
    return {
      project_title: projectSlug
        .replace('-', ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      repository_url: '',
      commits: [],
    };
  }
};

// Performance tracking helper
export const withPerformanceTracking = async <T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;

    // Send to analytics (implement based on your analytics provider)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'api_performance', {
        operation,
        duration,
        success: true,
      });
    }

    return result;
  } catch (error) {
    const duration = performance.now() - start;

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'api_performance', {
        operation,
        duration,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    throw error;
  }
};
