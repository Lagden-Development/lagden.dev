import { NextRequest, NextResponse } from 'next/server';
import { cacheManager } from '../cache/manager';
import { CacheConfig } from '../cache/types';
import { successResponse, errorResponse, ApiMetadata } from './responses';
import { handleApiError, ApiError } from './errors';

export interface HandlerOptions<T> {
  // Cache configuration
  cacheKey?: string;
  cacheTTL?: number;
  cacheTags?: string[];

  // Request validation
  validateRequest?: (req: NextRequest) => void | Promise<void>;

  // Main data fetcher
  fetcher: (req: NextRequest) => Promise<T>;

  // Response transformer
  transform?: (data: T) => any;

  // Error handler
  onError?: (error: unknown) => NextResponse | void;

  // Rate limiting
  rateLimit?: {
    limit: number;
    windowMs?: number;
  };
}

// Create a standardized API handler with caching
export function createApiHandler<T>(options: HandlerOptions<T>) {
  return async (req: NextRequest) => {
    let rateLimitInfo: RateLimitInfo | undefined;
    
    try {
      // Apply rate limiting if configured
      if (options.rateLimit) {
        const clientIp = getClientIp(req);
        const rateLimitKey = `${req.nextUrl.pathname}:${clientIp}`;
        rateLimitInfo = checkRateLimit(
          rateLimitKey,
          options.rateLimit.limit,
          options.rateLimit.windowMs
        );
      }

      // Validate request if validator provided
      if (options.validateRequest) {
        await options.validateRequest(req);
      }

      // If no cache key provided, fetch directly
      if (!options.cacheKey) {
        const data = await options.fetcher(req);
        const transformed = options.transform ? options.transform(data) : data;

        const response = successResponse(transformed, { cached: false });
        
        // Add rate limit headers if applicable
        if (rateLimitInfo) {
          response.headers.set('X-RateLimit-Limit', rateLimitInfo.limit.toString());
          response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString());
          response.headers.set('X-RateLimit-Reset', rateLimitInfo.reset.toString());
        }
        
        return response;
      }

      // Prepare cache configuration
      const cacheConfig: CacheConfig = {
        ttl: options.cacheTTL || 3600,
        tags: options.cacheTags || [],
      };

      // Use cache manager's get method which properly tracks access
      const data = await cacheManager.get<T>(
        options.cacheKey,
        () => options.fetcher(req),
        cacheConfig
      );

      if (data === null) {
        throw new ApiError('Failed to fetch data', 'FETCH_ERROR');
      }

      const transformed = options.transform ? options.transform(data) : data;

      // Get the cache entry to provide metadata
      const cacheEntry = cacheManager.getAllEntries().get(options.cacheKey);
      const metadata: ApiMetadata = {
        cached: cacheEntry ? true : false,
      };

      if (cacheEntry) {
        metadata.created = cacheEntry.metadata.created;
        metadata.expires = cacheEntry.metadata.expires;
        metadata.cacheAge = Date.now() - cacheEntry.metadata.lastAccessed;
      }

      const response = successResponse(transformed, metadata);
      
      // Add rate limit headers if applicable
      if (rateLimitInfo) {
        response.headers.set('X-RateLimit-Limit', rateLimitInfo.limit.toString());
        response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString());
        response.headers.set('X-RateLimit-Reset', rateLimitInfo.reset.toString());
      }
      
      return response;
    } catch (error) {
      // Allow custom error handling
      if (options.onError) {
        const customResponse = options.onError(error);
        if (customResponse) return customResponse;
      }

      // Default error handling
      const { code, message, statusCode } = handleApiError(error);
      const errorResp = errorResponse(code, message, statusCode);
      
      // Add rate limit headers to error responses too
      if (rateLimitInfo && statusCode === 429) {
        errorResp.headers.set('X-RateLimit-Limit', rateLimitInfo.limit.toString());
        errorResp.headers.set('X-RateLimit-Remaining', '0');
        errorResp.headers.set('X-RateLimit-Reset', rateLimitInfo.reset.toString());
        errorResp.headers.set('Retry-After', Math.ceil(rateLimitInfo.reset - Date.now() / 1000).toString());
      }
      
      return errorResp;
    }
  };
}

// Helper to generate cache keys
export function generateCacheKey(
  prefix: string,
  ...parts: (string | number | undefined)[]
): string {
  const validParts = parts.filter((p) => p !== undefined);
  return `${prefix}:${validParts.join(':')}`;
}

// Helper to parse query parameters
export function parseQueryParams(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const params: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

// Helper to validate required parameters
export function validateRequiredParams(
  params: Record<string, any>,
  required: string[]
): void {
  const missing = required.filter((key) => !params[key]);

  if (missing.length > 0) {
    throw new ApiError(
      `Missing required parameters: ${missing.join(', ')}`,
      'MISSING_PARAMETERS',
      400
    );
  }
}

// Rate limiting helper (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000 // 1 minute
): RateLimitInfo {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || record.resetAt < now) {
    // Create new record
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      limit,
      remaining: limit - 1,
      reset: Math.floor((now + windowMs) / 1000),
    };
  }

  if (record.count >= limit) {
    throw new ApiError(
      `Rate limit exceeded. Try again in ${Math.ceil((record.resetAt - now) / 1000)} seconds`,
      'RATE_LIMIT',
      429
    );
  }

  record.count++;
  
  return {
    limit,
    remaining: limit - record.count,
    reset: Math.floor(record.resetAt / 1000),
  };
}

// Clean up old rate limit records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (record.resetAt < now) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean up every minute

// Helper to get client IP address
export function getClientIp(req: NextRequest): string {
  // Check Cloudflare headers first (default for this project)
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Check for various headers that might contain the real IP
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for may contain multiple IPs, take the first one
    return forwardedFor.split(',')[0]?.trim() || forwardedFor;
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Vercel specific
  const vercelForwardedFor = req.headers.get('x-vercel-forwarded-for');
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(',')[0]?.trim() || vercelForwardedFor;
  }

  // Fallback to a generic identifier
  return 'unknown-ip';
}
