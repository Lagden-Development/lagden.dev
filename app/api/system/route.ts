import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api/base-handler';
import { readFileSync } from 'fs';
import { join } from 'path';

interface SystemInfoResponse {
  package: {
    name: string;
    version: string;
    description: string;
    keyDependencies: Array<{
      name: string;
      version: string;
      description: string;
    }>;
    dependencyCount: number;
  };
  framework: string;
  typescript: boolean;
  platform: string;
  environment: string;
  uptimeHours: number;
  features: {
    ssr: boolean;
    ssg: boolean;
    api: boolean;
    serverComponents: boolean;
    clientComponents: boolean;
    caching: boolean;
    analytics: boolean;
  };
  buildTarget: string;
  bundler: string;
  deployment: string;
  stats: {
    cacheEnabled: boolean;
    apiRoutes: number;
    pages: number;
    components: number;
  };
}

function getPackageInfo() {
  try {
    const packagePath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

    // Get key dependencies with their versions
    const dependencies = packageJson.dependencies || {};
    const keyDeps = [
      'next',
      'react',
      'typescript',
      'tailwindcss',
      'contentful',
      'lucide-react',
      '@sentry/nextjs',
      'geist',
    ];

    const keyDependencies = keyDeps
      .filter((dep) => dependencies[dep])
      .map((dep) => ({
        name: dep,
        version: dependencies[dep].replace('^', '').replace('~', ''),
        description: getPackageDescription(dep),
      }));

    return {
      name: packageJson.name || 'unknown',
      version: packageJson.version || 'unknown',
      description: packageJson.description || '',
      keyDependencies,
      dependencyCount: Object.keys(dependencies).length,
    };
  } catch (error) {
    console.warn('[System API] Could not read package.json:', error);
    return {
      name: process.env.SYSTEM_NAME || 'lagden.dev',
      version: process.env.SYSTEM_VERSION || 'unknown',
      description:
        process.env.SYSTEM_DESCRIPTION ||
        'Lagden Development portfolio website',
      keyDependencies: [],
      dependencyCount: 0,
    };
  }
}

function getPackageDescription(packageName: string): string {
  const descriptions: Record<string, string> = {
    next: 'React framework',
    react: 'UI library',
    typescript: 'Type safety',
    tailwindcss: 'CSS framework',
    contentful: 'CMS client',
    'lucide-react': 'Icon library',
    '@sentry/nextjs': 'Error tracking',
    geist: 'Font family',
  };

  return descriptions[packageName] || `${packageName} package`;
}

function getTsConfig() {
  try {
    const tsConfigPath = join(process.cwd(), 'tsconfig.json');
    const tsConfig = JSON.parse(readFileSync(tsConfigPath, 'utf8'));

    return {
      typescript: true,
      buildTarget: tsConfig.compilerOptions?.target || 'ES2017',
      strict: tsConfig.compilerOptions?.strict || false,
    };
  } catch (error) {
    return {
      typescript: process.env.SYSTEM_TYPESCRIPT !== 'false',
      buildTarget: process.env.SYSTEM_BUILD_TARGET || 'ES2017',
      strict: false,
    };
  }
}

function getNextConfig() {
  // Detect Next.js version from package.json and features from runtime
  const isSSR = true; // Next.js always supports SSR
  const isSSG = true; // Next.js always supports SSG
  const hasAppRouter = true; // This project uses app router

  return {
    framework: `Next.js ${process.env.npm_package_dependencies_next?.replace('^', '') || '15+'}`,
    features: {
      ssr: isSSR,
      ssg: isSSG,
      api: true,
      serverComponents: hasAppRouter,
      clientComponents: true,
      caching: process.env.ENABLE_CACHE_STATS === 'true',
      analytics:
        !!process.env.NEXT_PUBLIC_GA_ID ||
        process.env.SYSTEM_ANALYTICS !== 'false',
    },
    bundler: 'webpack', // Next.js uses webpack
  };
}

export const GET = createApiHandler<SystemInfoResponse>({
  // No caching for system info - always get fresh data
  rateLimit: {
    limit: 30, // 30 requests per minute
    windowMs: 60000, // 1 minute
  },

  async fetcher(req: NextRequest): Promise<SystemInfoResponse> {
    const packageInfo = getPackageInfo();
    const tsConfig = getTsConfig();
    const nextConfig = getNextConfig();

    // Auto-detected system information with minimal env var overrides
    const safeSystemInfo: SystemInfoResponse = {
      // Package information (auto-detected from package.json)
      package: packageInfo,

      // Framework info (auto-detected + minimal config)
      framework: process.env.SYSTEM_FRAMEWORK || nextConfig.framework,
      typescript: tsConfig.typescript,

      // Runtime info (auto-detected)
      platform: process.platform,

      // Environment (auto-detected)
      environment:
        process.env.NODE_ENV === 'development' ? 'development' : 'production',

      // Safe uptime (rounded to hours to avoid exact process info)
      uptimeHours: Math.floor((process.uptime?.() || 0) / 3600),

      // Features (mostly auto-detected)
      features: nextConfig.features,

      // Build info (auto-detected from tsconfig.json + minimal overrides)
      buildTarget: tsConfig.buildTarget,
      bundler: process.env.SYSTEM_BUNDLER || nextConfig.bundler,
      deployment: process.env.VERCEL
        ? 'vercel'
        : process.env.SYSTEM_DEPLOYMENT || 'custom',

      // Stats (configurable for accuracy)
      stats: {
        cacheEnabled: process.env.ENABLE_CACHE_STATS === 'true',
        apiRoutes: parseInt(process.env.SYSTEM_API_ROUTES || '12'),
        pages: parseInt(process.env.SYSTEM_PAGES || '18'),
        components: parseInt(process.env.SYSTEM_COMPONENTS || '32'),
      },
    };

    return safeSystemInfo;
  },
});
