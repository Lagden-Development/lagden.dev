import { NextResponse } from 'next/server';

export interface ApiResponse<T> {
  data: T | null;
  meta: {
    cached: boolean;
    cacheAge?: number; // milliseconds since cached
    ttl?: number; // time until expiration in seconds
    nextUpdate?: number; // timestamp for next update (for real-time endpoints)
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface ApiMetadata {
  cached: boolean;
  created?: number;
  expires?: number;
  nextUpdate?: number;
  cacheAge?: number;
}

// Standard success response
export function successResponse<T>(
  data: T,
  metadata: ApiMetadata
): NextResponse<ApiResponse<T>> {
  const now = Date.now();

  const response: ApiResponse<T> = {
    data,
    meta: {
      cached: metadata.cached,
    },
  };

  // Add cache age if this is cached data
  if (metadata.cached && metadata.created) {
    response.meta.cacheAge = now - metadata.created;
  }

  // Add TTL if we have expiration info
  if (metadata.expires) {
    response.meta.ttl = Math.max(
      0,
      Math.round((metadata.expires - now) / 1000)
    );
  }

  // Add next update time for real-time endpoints
  if (metadata.nextUpdate) {
    response.meta.nextUpdate = metadata.nextUpdate;
  }

  return NextResponse.json(response);
}

// Standard error response
export function errorResponse(
  code: string,
  message: string,
  status: number = 500
): NextResponse<ApiResponse<null>> {
  const response: ApiResponse<null> = {
    data: null,
    meta: {
      cached: false,
    },
    error: {
      code,
      message,
    },
  };

  return NextResponse.json(response, { status });
}

// Common error responses
export const errors = {
  notFound: (resource: string) =>
    errorResponse('NOT_FOUND', `${resource} not found`, 404),

  badRequest: (message: string) => errorResponse('BAD_REQUEST', message, 400),

  unauthorized: () =>
    errorResponse('UNAUTHORIZED', 'Authentication required', 401),

  forbidden: () => errorResponse('FORBIDDEN', 'Access denied', 403),

  rateLimit: () => errorResponse('RATE_LIMIT', 'Too many requests', 429),

  serverError: (message: string = 'Internal server error') =>
    errorResponse('SERVER_ERROR', message, 500),

  serviceUnavailable: (service: string) =>
    errorResponse(
      'SERVICE_UNAVAILABLE',
      `${service} is currently unavailable`,
      503
    ),
};
