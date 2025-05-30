// Cache interfaces and types

export interface CacheEntry<T> {
  data: T;
  metadata: {
    key: string;
    created: number;
    expires: number;
    lastAccessed: number;
    accessCount: number;
    size: number;
    tags: string[];
  };
}

export interface CacheConfig {
  ttl: number;
  tags?: string[];
  priority?: number;
}

export interface CacheEntryDetails {
  key: string;
  created: number;
  expires: number;
  lastAccessed: number;
  accessCount: number;
  size: number;
  tags: string[];
  ttl: number;
  remainingTtl: number;
  isExpired: boolean;
}

export interface CacheStatistics {
  entries: number;
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
  oldestEntry: number;
  newestEntry: number;
  memoryUsage: {
    used: number;
    limit: number;
    percentage: number;
  };
  topAccessed: Array<{
    key: string;
    accessCount: number;
    lastAccessed: number;
  }>;
  allEntries: CacheEntryDetails[];
  cleanup: {
    enabled: boolean;
    intervalMs: number;
    lastCleanup?: number;
    totalCleanups: number;
    totalExpiredRemoved: number;
  };
  expiredEntries: CacheEntryDetails[];
}

export interface CacheOptions {
  maxSizeBytes?: number;
  maxEntries?: number;
  enableStats?: boolean;
  onEviction?: (key: string, entry: CacheEntry<any>) => void;
}

export type CacheTTL = {
  PROJECTS_LIST: number;
  PROJECTS_DETAIL: number;
  PEOPLE_LIST: number;
  PEOPLE_DETAIL: number;
  STATUS: number;
  COMMITS: number;
  TAGS: number;
  SEARCH: number;
};
