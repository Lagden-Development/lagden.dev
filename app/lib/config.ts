// Environment-specific configuration

interface Config {
  environment: 'development' | 'staging' | 'production';
  isDevelopment: boolean;
  isStaging: boolean;
  isProduction: boolean;
  enableAnalytics: boolean;
  enableSentry: boolean;
  enableDebugMode: boolean;
  cacheSettings: {
    projects: number;
    people: number;
    commits: number;
  };
  features: {
    search: boolean;
    pagination: boolean;
    performanceTracking: boolean;
  };
}

function getEnvironment(): 'development' | 'staging' | 'production' {
  const env = process.env.NODE_ENV;
  const vercelEnv = process.env.VERCEL_ENV;

  if (env === 'development') return 'development';
  if (vercelEnv === 'preview') return 'staging';
  return 'production';
}

function createConfig(): Config {
  const environment = getEnvironment();
  const isDevelopment = environment === 'development';
  const isStaging = environment === 'staging';
  const isProduction = environment === 'production';

  // Feature flags based on environment
  const features = {
    search: true,
    pagination: true,
    performanceTracking: !isDevelopment,
  };

  // Cache settings (in seconds)
  const cacheSettings = {
    projects: isDevelopment ? 60 : 3600, // 1 min dev, 1 hour prod
    people: isDevelopment ? 60 : 3600, // 1 min dev, 1 hour prod
    commits: isDevelopment ? 30 : 300, // 30 sec dev, 5 min prod
  };

  return {
    environment,
    isDevelopment,
    isStaging,
    isProduction,
    enableAnalytics: !isDevelopment,
    enableSentry: !isDevelopment,
    enableDebugMode: isDevelopment,
    cacheSettings,
    features,
  };
}

// Export the configuration
export const config = createConfig();

// Helper functions
export const isClient = typeof window !== 'undefined';
export const isServer = !isClient;

// Environment checks
export const {
  isDevelopment,
  isStaging,
  isProduction,
  enableAnalytics,
  enableSentry,
  enableDebugMode,
} = config;

// API helpers
export const getApiUrl = (endpoint: string): string => {
  return `${config.apiBaseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export const getApiHeaders = (): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
    'X-API-Version': '1.0.0',
    'X-Client-Environment': config.environment,
  };
};

// Cache configuration
export const getCacheConfig = (type: keyof typeof config.cacheSettings) => {
  return {
    revalidate: config.cacheSettings[type],
    tags: [type],
  };
};

// Debug logging
export const debugLog = (message: string, data?: any) => {
  if (config.enableDebugMode) {
    console.log(`[${config.environment.toUpperCase()}] ${message}`, data || '');
  }
};

// Performance monitoring
export const trackPerformance = (
  metric: string,
  value: number,
  metadata?: Record<string, any>
) => {
  if (!config.features.performanceTracking) return;

  debugLog(`Performance: ${metric}`, { value, metadata });

  // Send to analytics in production
  if (isClient && enableAnalytics && (window as any).gtag) {
    (window as any).gtag('event', 'performance_metric', {
      event_category: 'Performance',
      event_label: metric,
      value: Math.round(value),
      custom_parameters: {
        environment: config.environment,
        ...metadata,
      },
    });
  }
};

// Feature flag helper
export const isFeatureEnabled = (
  feature: keyof typeof config.features
): boolean => {
  return config.features[feature];
};

// Environment-specific URLs
export const getBaseUrl = (): string => {
  if (isClient) {
    return window.location.origin;
  }

  // Server-side URL detection
  const vercelUrl = process.env.VERCEL_URL;
  const protocol = process.env.VERCEL_ENV === 'production' ? 'https' : 'https';

  if (vercelUrl) {
    return `${protocol}://${vercelUrl}`;
  }

  switch (config.environment) {
    case 'development':
      return 'http://localhost:3000';
    case 'staging':
      return 'https://staging.lagden.dev';
    case 'production':
      return 'https://lagden.dev';
    default:
      return 'https://lagden.dev';
  }
};

// Error reporting configuration
export const shouldReportError = (error: Error): boolean => {
  // Don't report certain development errors
  if (isDevelopment) {
    return false;
  }

  // Filter out client-side network errors in staging
  if (isStaging && error.message.includes('network')) {
    return false;
  }

  return true;
};

// Export for use in other modules
export default config;
