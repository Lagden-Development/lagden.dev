import {
  CacheEntry,
  CacheConfig,
  CacheStatistics,
  CacheOptions,
  CacheTTL,
} from './types';

// Environment-based cache TTLs (in seconds)
export const CACHE_TTL: CacheTTL = {
  PROJECTS_LIST: parseInt(process.env.CACHE_PROJECTS_LIST || '3600', 10), // 1 hour
  PROJECTS_DETAIL: parseInt(process.env.CACHE_PROJECTS_DETAIL || '300', 10), // 5 minutes
  PEOPLE_LIST: parseInt(process.env.CACHE_PEOPLE_LIST || '7200', 10), // 2 hours
  PEOPLE_DETAIL: parseInt(process.env.CACHE_PEOPLE_DETAIL || '600', 10), // 10 minutes
  STATUS: parseInt(process.env.CACHE_STATUS || '30', 10), // 30 seconds
  COMMITS: parseInt(process.env.CACHE_COMMITS || '300', 10), // 5 minutes
  TAGS: parseInt(process.env.CACHE_TAGS || '86400', 10), // 24 hours
  SEARCH: parseInt(process.env.CACHE_SEARCH || '300', 10), // 5 minutes
};

// Calculate size of data in bytes (rough estimate)
function calculateSize(data: any): number {
  try {
    return new TextEncoder().encode(JSON.stringify(data)).length;
  } catch {
    return 0;
  }
}

export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingFetches = new Map<string, Promise<any>>();
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
  };

  private cleanupStats = {
    totalCleanups: 0,
    totalExpiredRemoved: 0,
    lastCleanup: undefined as number | undefined,
  };

  private maxSizeBytes: number;
  private maxEntries: number;
  private enableStats: boolean;
  private onEviction?: (key: string, entry: CacheEntry<any>) => void;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(options: CacheOptions = {}) {
    this.maxSizeBytes =
      options.maxSizeBytes ||
      parseInt(process.env.CACHE_MAX_SIZE_MB || '50', 10) * 1024 * 1024;
    this.maxEntries =
      options.maxEntries ||
      parseInt(process.env.CACHE_MAX_ENTRIES || '1000', 10);
    this.enableStats =
      options.enableStats ?? process.env.ENABLE_CACHE_STATS === 'true';
    this.onEviction = options.onEviction;

    // Start periodic cleanup every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupExpired();
      },
      5 * 60 * 1000
    );

    console.log('[CacheManager] Initialized with:', {
      maxSizeBytes: this.maxSizeBytes,
      maxEntries: this.maxEntries,
      enableStats: this.enableStats,
      cleanupInterval: '5 minutes',
    });
  }

  async get<T>(
    key: string,
    fetcher?: () => Promise<T>,
    config?: CacheConfig
  ): Promise<T | null> {
    // Check if we have a valid cached entry
    const entry = this.cache.get(key);

    if (entry && entry.metadata.expires > Date.now()) {
      // Valid cache hit
      if (this.enableStats) this.stats.hits++;

      // Update access metadata
      entry.metadata.lastAccessed = Date.now();
      entry.metadata.accessCount++;

      console.log(
        `[Cache] HIT: ${key} (expires in ${Math.round((entry.metadata.expires - Date.now()) / 1000)}s)`
      );
      return entry.data as T;
    }

    // Cache miss or expired
    if (this.enableStats) this.stats.misses++;

    // If no fetcher provided, return null
    if (!fetcher) {
      console.log(`[Cache] MISS: ${key} (no fetcher provided)`);
      return null;
    }

    // Check if we're already fetching this data
    const pendingFetch = this.pendingFetches.get(key);
    if (pendingFetch) {
      console.log(`[Cache] PENDING: ${key} (waiting for existing fetch)`);
      return pendingFetch;
    }

    // Start new fetch
    console.log(`[Cache] MISS: ${key} (fetching fresh data)`);
    const fetchPromise = this.fetchAndCache(key, fetcher, config);

    // Store the promise to prevent duplicate fetches
    this.pendingFetches.set(key, fetchPromise);

    try {
      const result = await fetchPromise;
      return result;
    } finally {
      // Clean up pending fetch
      this.pendingFetches.delete(key);
    }
  }

  private async fetchAndCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    config?: CacheConfig
  ): Promise<T> {
    try {
      const data = await fetcher();

      // Only cache non-null values
      if (data !== null && data !== undefined) {
        this.set(key, data, config);
      }

      return data;
    } catch (error) {
      console.error(`[Cache] Failed to fetch ${key}:`, error);
      throw error;
    }
  }

  set<T>(key: string, data: T, config?: CacheConfig): void {
    const now = Date.now();
    const ttl = (config?.ttl || 3600) * 1000; // Convert to milliseconds
    const size = calculateSize(data);

    const entry: CacheEntry<T> = {
      data,
      metadata: {
        key,
        created: now,
        expires: now + ttl,
        lastAccessed: now,
        accessCount: 1,
        size,
        tags: config?.tags || [],
      },
    };

    // Check if we need to evict entries
    this.evictIfNeeded(size);

    // Store the entry
    this.cache.set(key, entry);
    console.log(
      `[Cache] SET: ${key} (TTL: ${ttl / 1000}s, size: ${size} bytes)`
    );
  }

  private evictIfNeeded(newEntrySize: number): void {
    // Check entry count limit
    if (this.cache.size >= this.maxEntries) {
      this.evictLRU();
    }

    // Check size limit
    const totalSize = this.getTotalSize() + newEntrySize;
    while (totalSize > this.maxSizeBytes && this.cache.size > 0) {
      this.evictLRU();
    }
  }

  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTime = Infinity;

    // Find least recently used entry
    for (const [key, entry] of this.cache.entries()) {
      if (entry.metadata.lastAccessed < lruTime) {
        lruTime = entry.metadata.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      const entry = this.cache.get(lruKey);
      this.cache.delete(lruKey);

      if (this.enableStats) this.stats.evictions++;

      console.log(`[Cache] EVICTED: ${lruKey} (LRU)`);

      if (this.onEviction && entry) {
        this.onEviction(lruKey, entry);
      }
    }
  }

  private getTotalSize(): number {
    let total = 0;
    for (const entry of this.cache.values()) {
      total += entry.metadata.size;
    }
    return total;
  }

  invalidate(pattern: string | RegExp): number {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
      console.log(`[Cache] INVALIDATED: ${key}`);
    }

    return keysToDelete.length;
  }

  invalidateByTags(tags: string[]): number {
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (tags.some((tag) => entry.metadata.tags.includes(tag))) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
      console.log(`[Cache] INVALIDATED: ${key} (by tags: ${tags.join(', ')})`);
    }

    return keysToDelete.length;
  }

  getStats(): CacheStatistics {
    const entries = Array.from(this.cache.values());
    const now = Date.now();

    // Calculate top accessed entries
    const topAccessed = entries
      .sort((a, b) => b.metadata.accessCount - a.metadata.accessCount)
      .slice(0, 10)
      .map((entry) => ({
        key: entry.metadata.key,
        accessCount: entry.metadata.accessCount,
        lastAccessed: entry.metadata.lastAccessed,
      }));

    // Create detailed information for all entries
    const allEntries = entries
      .map((entry) => {
        const ttl = entry.metadata.expires - entry.metadata.created;
        const remainingTtl = Math.max(0, entry.metadata.expires - now);
        const isExpired = entry.metadata.expires <= now;

        return {
          key: entry.metadata.key,
          created: entry.metadata.created,
          expires: entry.metadata.expires,
          lastAccessed: entry.metadata.lastAccessed,
          accessCount: entry.metadata.accessCount,
          size: entry.metadata.size,
          tags: entry.metadata.tags,
          ttl,
          remainingTtl,
          isExpired,
        };
      })
      .sort((a, b) => b.created - a.created); // Sort by newest first

    // Separate expired entries for easier monitoring
    const expiredEntries = allEntries.filter((entry) => entry.isExpired);

    // Find oldest and newest entries
    let oldestEntry = now;
    let newestEntry = 0;

    for (const entry of entries) {
      if (entry.metadata.created < oldestEntry) {
        oldestEntry = entry.metadata.created;
      }
      if (entry.metadata.created > newestEntry) {
        newestEntry = entry.metadata.created;
      }
    }

    const totalSize = this.getTotalSize();
    const hitRate =
      this.stats.hits + this.stats.misses > 0
        ? this.stats.hits / (this.stats.hits + this.stats.misses)
        : 0;

    return {
      entries: this.cache.size,
      size: totalSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      evictions: this.stats.evictions,
      oldestEntry,
      newestEntry,
      memoryUsage: {
        used: totalSize,
        limit: this.maxSizeBytes,
        percentage: (totalSize / this.maxSizeBytes) * 100,
      },
      topAccessed,
      allEntries,
      cleanup: {
        enabled: !!this.cleanupInterval,
        intervalMs: 5 * 60 * 1000, // 5 minutes
        lastCleanup: this.cleanupStats.lastCleanup,
        totalCleanups: this.cleanupStats.totalCleanups,
        totalExpiredRemoved: this.cleanupStats.totalExpiredRemoved,
      },
      expiredEntries,
    };
  }

  cleanupExpired(): number {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.metadata.expires <= now) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      const entry = this.cache.get(key);
      if (entry) {
        this.cache.delete(key);
        if (this.enableStats) this.stats.evictions++;

        if (this.onEviction) {
          this.onEviction(key, entry);
        }

        console.log(`[Cache] EXPIRED: ${key} (removed during cleanup)`);
      }
    }

    // Update cleanup statistics
    if (this.enableStats) {
      this.cleanupStats.totalCleanups++;
      this.cleanupStats.totalExpiredRemoved += expiredKeys.length;
      this.cleanupStats.lastCleanup = now;
    }

    if (expiredKeys.length > 0) {
      console.log(
        `[Cache] CLEANUP: Removed ${expiredKeys.length} expired entries`
      );
    }

    return expiredKeys.length;
  }

  clear(): void {
    this.cache.clear();
    this.pendingFetches.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
    this.cleanupStats = {
      totalCleanups: 0,
      totalExpiredRemoved: 0,
      lastCleanup: undefined,
    };
    console.log('[Cache] CLEARED');
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    this.clear();
    console.log('[Cache] DESTROYED: Cache manager shut down');
  }

  // Get all entries (for debugging)
  getAllEntries(): Map<string, CacheEntry<any>> {
    return new Map(this.cache);
  }
}

// Singleton instance
export const cacheManager = new CacheManager();
