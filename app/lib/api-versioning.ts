// API versioning and schema validation utilities

import type { Project, Person } from '@/types';

// API version configuration
export const API_VERSION = '1.0.0';
export const SUPPORTED_VERSIONS = ['1.0.0'];

// Schema validators for different API versions
interface SchemaValidators {
  [version: string]: {
    project: (data: any) => boolean;
    person: (data: any) => boolean;
    commits: (data: any) => boolean;
  };
}

const schemaValidators: SchemaValidators = {
  '1.0.0': {
    project: (data: any): boolean => {
      return (
        typeof data === 'object' &&
        typeof data.slug === 'string' &&
        typeof data.title === 'string' &&
        typeof data.description === 'string' &&
        Array.isArray(data.tags) &&
        typeof data.project_readme === 'object'
      );
    },
    person: (data: any): boolean => {
      return (
        typeof data === 'object' &&
        typeof data.slug === 'string' &&
        typeof data.name === 'string' &&
        typeof data.occupation === 'string' &&
        Array.isArray(data.skills) &&
        Array.isArray(data.links)
      );
    },
    commits: (data: any): boolean => {
      return (
        typeof data === 'object' &&
        typeof data.project_title === 'string' &&
        Array.isArray(data.commits) &&
        data.commits.every(
          (commit: any) =>
            typeof commit.sha === 'string' &&
            typeof commit.message === 'string' &&
            typeof commit.author_name === 'string'
        )
      );
    },
  },
};

// Data transformers for different API versions
interface DataTransformers {
  [version: string]: {
    project: (data: any) => Project;
    person: (data: any) => Person;
    commits: (data: any) => any;
  };
}

const dataTransformers: DataTransformers = {
  '1.0.0': {
    project: (data: any): Project => {
      // Ensure all required fields exist with defaults
      return {
        slug: data.slug || '',
        title: data.title || 'Untitled Project',
        description: data.description || 'No description available',
        picture_url: data.picture_url || '/placeholder-project.png',
        github_repo_url: data.github_repo_url || '',
        website_url: data.website_url || '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        project_readme: data.project_readme || {
          nodeType: 'document',
          content: [],
          data: {},
        },
        status: data.status || undefined,
        is_featured: data.is_featured || false,
      };
    },
    person: (data: any): Person => {
      return {
        slug: data.slug || '',
        name: data.name || 'Unknown',
        occupation: data.occupation || 'Developer',
        location: data.location || 'Unknown',
        pronouns: data.pronouns || '',
        skills: Array.isArray(data.skills) ? data.skills : [],
        links: Array.isArray(data.links) ? data.links : [],
        introduction: data.introduction || {
          nodeType: 'document',
          content: [],
          data: {},
        },
        picture_url: data.picture_url || '/placeholder-person.png',
      };
    },
    commits: (data: any) => {
      return {
        project_title: data.project_title || 'Unknown Project',
        repository_url: data.repository_url || '',
        commits: Array.isArray(data.commits)
          ? data.commits.map((commit: any) => ({
              sha: commit.sha || '',
              message: commit.message || 'No message',
              author_name: commit.author_name || 'Unknown',
              author_email: commit.author_email || '',
              date: commit.date || new Date().toISOString(),
              url: commit.url || '',
            }))
          : [],
      };
    },
  },
};

// Migration functions for upgrading data between versions
interface MigrationFunctions {
  [fromVersion: string]: {
    [toVersion: string]: (data: any) => any;
  };
}

const migrations: MigrationFunctions = {
  // Example migration from v1.0.0 to v1.1.0 (when needed)
  // '1.0.0': {
  //   '1.1.0': (data: any) => {
  //     // Add new fields, transform existing ones, etc.
  //     return {
  //       ...data,
  //       new_field: 'default_value',
  //     };
  //   },
  // },
};

// Function to detect API version from response headers or data
export function detectApiVersion(response: Response | any): string {
  // Try to get version from response headers
  if (response instanceof Response) {
    const versionHeader =
      response.headers.get('X-API-Version') ||
      response.headers.get('API-Version');
    if (versionHeader && SUPPORTED_VERSIONS.includes(versionHeader)) {
      return versionHeader;
    }
  }

  // Try to get version from data structure
  if (typeof response === 'object' && response.api_version) {
    return response.api_version;
  }

  // Default to current version
  return API_VERSION;
}

// Function to validate data against schema for specific version
export function validateData(
  data: any,
  type: 'project' | 'person' | 'commits',
  version: string = API_VERSION
): boolean {
  const validator = schemaValidators[version]?.[type];
  if (!validator) {
    console.warn(`No validator found for ${type} in version ${version}`);
    return false;
  }

  try {
    return validator(data);
  } catch (error) {
    console.error(`Validation error for ${type}:`, error);
    return false;
  }
}

// Function to transform data to expected format
export function transformData(
  data: any,
  type: 'project' | 'person' | 'commits',
  version: string = API_VERSION
): any {
  const transformer = dataTransformers[version]?.[type];
  if (!transformer) {
    console.warn(`No transformer found for ${type} in version ${version}`);
    return data;
  }

  try {
    return transformer(data);
  } catch (error) {
    console.error(`Transformation error for ${type}:`, error);
    return data;
  }
}

// Function to migrate data between versions
export function migrateData(
  data: any,
  fromVersion: string,
  toVersion: string = API_VERSION
): any {
  if (fromVersion === toVersion) {
    return data;
  }

  const migration = migrations[fromVersion]?.[toVersion];
  if (!migration) {
    console.warn(`No migration path from ${fromVersion} to ${toVersion}`);
    return data;
  }

  try {
    return migration(data);
  } catch (error) {
    console.error(
      `Migration error from ${fromVersion} to ${toVersion}:`,
      error
    );
    return data;
  }
}

// Main function to process API response with versioning
export function processApiResponse(
  response: any,
  type: 'project' | 'person' | 'commits',
  expectedVersion: string = API_VERSION
): any {
  // Detect the API version
  const detectedVersion = detectApiVersion(response);

  // Log version mismatch for monitoring
  if (detectedVersion !== expectedVersion) {
    console.warn(
      `API version mismatch: expected ${expectedVersion}, got ${detectedVersion}`
    );

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'api_version_mismatch', {
        event_category: 'API',
        expected_version: expectedVersion,
        detected_version: detectedVersion,
        data_type: type,
      });
    }
  }

  // Extract the actual data (remove metadata if present)
  const actualData = response.data || response;

  // Validate the data structure
  if (!validateData(actualData, type, detectedVersion)) {
    throw new Error(
      `Invalid data structure for ${type} in version ${detectedVersion}`
    );
  }

  // Migrate data if necessary
  let processedData = actualData;
  if (detectedVersion !== expectedVersion) {
    processedData = migrateData(actualData, detectedVersion, expectedVersion);
  }

  // Transform data to expected format
  return transformData(processedData, type, expectedVersion);
}

// Function to check if a version is supported
export function isVersionSupported(version: string): boolean {
  return SUPPORTED_VERSIONS.includes(version);
}

// Function to get the latest supported version
export function getLatestSupportedVersion(): string {
  return SUPPORTED_VERSIONS[SUPPORTED_VERSIONS.length - 1] || '1.0.0';
}

// Error handling for version-related issues
export class ApiVersionError extends Error {
  constructor(
    message: string,
    public detectedVersion: string,
    public expectedVersion: string,
    public dataType: string
  ) {
    super(message);
    this.name = 'ApiVersionError';
  }
}

// Helper function to create version-aware error
export function createVersionError(
  message: string,
  detectedVersion: string,
  expectedVersion: string,
  dataType: string
): ApiVersionError {
  return new ApiVersionError(
    message,
    detectedVersion,
    expectedVersion,
    dataType
  );
}
