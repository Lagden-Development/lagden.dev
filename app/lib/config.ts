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

  if (env === 'development') return 'development';
  return 'production';
}

function createConfig(): Config {
  const environment = getEnvironment();
  const isDevelopment = environment === 'development';
  const isStaging = false;
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
  return config.isDevelopment ? 'http://localhost:3000' : 'https://lagden.dev';
};

// Error reporting configuration
export const shouldReportError = (): boolean => {
  // Don't report certain development errors
  if (isDevelopment) {
    return false;
  }

  return true;
};

// Export for use in other modules
export default config;
