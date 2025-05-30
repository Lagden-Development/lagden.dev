'use client';

// Nerds Page - Easter egg dashboard for developers
// Shows real-time cache stats, health metrics, and tech stack info
// Safe data only - no sensitive information exposed

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Database,
  Package,
  Clock,
  Zap,
  BarChart3,
  Cpu,
  HardDrive,
  Wifi,
  RefreshCw,
  Terminal,
  Code2,
  GitBranch,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface CacheStats {
  hitRate: number;
  entries: number;
  size: number;
  hits: number;
  misses: number;
  evictions: number;
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
}

interface HealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    api: {
      status: 'up' | 'down' | 'degraded';
      latency?: number;
    };
    contentful: {
      status: 'up' | 'down' | 'degraded';
      latency?: number;
      error?: string;
    };
    betterstack: {
      status: 'up' | 'down' | 'degraded';
      latency?: number;
      error?: string;
    };
    cache: {
      status: 'up' | 'down' | 'degraded';
      entries?: number;
      hitRate?: number;
      memoryUsage?: {
        used: number;
        limit: number;
      };
    };
  };
  environment: {
    nodeVersion: string;
    region: string;
    deployment: string;
  };
}

interface PackageInfo {
  name: string;
  version: string;
  description?: string;
  dependencies?: number;
}

interface SystemInfo {
  package: {
    name: string;
    version: string;
    keyDependencies: string[];
    dependencyCount: number;
  };
  framework: string;
  typescript: boolean;
  platform: string;
  environment: string;
  uptimeHours: number;
  features: Record<string, boolean>;
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

export default function NerdsPage() {
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchCacheStats = async () => {
    try {
      const response = await fetch('/api/cache/stats');
      if (response.ok) {
        const data = await response.json();
        setCacheStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch cache stats:', error);
      setCacheStats(null);
    }
  };

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        setHealthData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch health data:', error);
      setHealthData(null);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      const response = await fetch('/api/system');
      if (response.ok) {
        const data = await response.json();
        setSystemInfo(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch system info:', error);
    }
  };

  const fetchPackageInfo = async () => {
    try {
      const response = await fetch('/api/system');
      if (response.ok) {
        const data = await response.json();
        // Use the key dependencies with actual versions from system API
        const packageList = data.data?.package?.keyDependencies || [];
        setPackages(packageList);
      }
    } catch (error) {
      console.error('Failed to fetch package info:', error);
      setPackages([]);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchCacheStats(),
      fetchHealthData(),
      fetchPackageInfo(),
      fetchSystemInfo(),
    ]);
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchCacheStats();
      fetchHealthData();
      setLastUpdate(new Date());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatUptime = () => {
    if (systemInfo?.uptimeHours !== undefined) {
      return `${systemInfo.uptimeHours}h`;
    }
    return 'Unknown';
  };

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to normal world
              </Link>
            </div>
            <h1 className="flex items-center gap-3 text-4xl font-bold text-white">
              <Terminal className="h-8 w-8 text-green-400" />
              Nerds Dashboard
              <Code2 className="h-6 w-6 text-violet-400" />
            </h1>
            <p className="mt-2 text-gray-400">
              Real-time system metrics, cache stats, and developer goodies
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`${autoRefresh ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}
            >
              <Activity className="mr-2 h-4 w-4" />
              {autoRefresh ? 'Live' : 'Paused'}
            </Button>

            <Button onClick={fetchAllData} disabled={loading}>
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Last updated */}
        <div className="mb-6 text-sm text-gray-500">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Cache Stats */}
          <Card className="border-gray-800 bg-black/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="h-5 w-5 text-blue-400" />
                Cache Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cacheStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-blue-500/10 p-3">
                      <div className="text-2xl font-bold text-blue-400">
                        {cacheStats.hitRate !== undefined
                          ? (cacheStats.hitRate * 100).toFixed(1)
                          : '0.0'}
                        %
                      </div>
                      <div className="text-sm text-gray-400">Hit Rate</div>
                    </div>

                    <div className="rounded-lg bg-green-500/10 p-3">
                      <div className="text-2xl font-bold text-green-400">
                        {cacheStats.hits + cacheStats.misses}
                      </div>
                      <div className="text-sm text-gray-400">
                        Total Requests
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-purple-500/10 p-3">
                      <div className="text-2xl font-bold text-purple-400">
                        {cacheStats.entries}
                      </div>
                      <div className="text-sm text-gray-400">Total Entries</div>
                    </div>

                    <div className="rounded-lg bg-orange-500/10 p-3">
                      <div className="text-2xl font-bold text-orange-400">
                        {formatBytes(cacheStats.memoryUsage.used)}
                      </div>
                      <div className="text-sm text-gray-400">Memory Used</div>
                    </div>
                  </div>

                  {cacheStats.topAccessed &&
                    cacheStats.topAccessed.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-white">
                          Hot Cache Keys
                        </h4>
                        <div className="space-y-1">
                          {cacheStats.topAccessed
                            .slice(0, 3)
                            .map((entry, i) => (
                              <div
                                key={i}
                                className="flex justify-between text-xs"
                              >
                                <span className="truncate text-gray-300">
                                  {entry.key}
                                </span>
                                <span className="text-green-400">
                                  {entry.accessCount} hits
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="animate-pulse space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-16 rounded-lg bg-gray-800/50"></div>
                    <div className="h-16 rounded-lg bg-gray-800/50"></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Health Status */}
          <Card className="border-gray-800 bg-black/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="h-5 w-5 text-green-400" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              {healthData ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
                        healthData.status === 'healthy'
                          ? 'bg-green-500/20 text-green-400'
                          : healthData.status === 'degraded'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${
                          healthData.status === 'healthy'
                            ? 'bg-green-400'
                            : healthData.status === 'degraded'
                              ? 'bg-yellow-400'
                              : 'bg-red-400'
                        }`}
                      ></div>
                      {healthData.status.toUpperCase()}
                    </div>

                    <div className="text-sm text-gray-400">
                      Uptime: {Math.round((healthData.uptime || 0) / 3600000)}h
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {/* API Service */}
                    <div className="rounded-lg bg-gray-800/50 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              healthData.services.api.status === 'up'
                                ? 'bg-green-400'
                                : 'bg-red-400'
                            }`}
                          ></div>
                          <span className="text-sm text-gray-300">API</span>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-sm font-medium ${
                              healthData.services.api.status === 'up'
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}
                          >
                            {healthData.services.api.status.toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {healthData.services.api.latency !== undefined
                              ? `${healthData.services.api.latency}ms`
                              : '< 1ms'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contentful Service */}
                    <div className="rounded-lg bg-gray-800/50 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              healthData.services.contentful.status === 'up'
                                ? 'bg-green-400'
                                : 'bg-red-400'
                            }`}
                          ></div>
                          <span className="text-sm text-gray-300">
                            Contentful
                          </span>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-sm font-medium ${
                              healthData.services.contentful.status === 'up'
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}
                          >
                            {healthData.services.contentful.status.toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {healthData.services.contentful.status === 'up' &&
                            healthData.services.contentful.latency !== undefined
                              ? `${healthData.services.contentful.latency}ms`
                              : healthData.services.contentful.error ||
                                'No details'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* BetterStack Service */}
                    <div className="rounded-lg bg-gray-800/50 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              healthData.services.betterstack.status === 'up'
                                ? 'bg-green-400'
                                : 'bg-red-400'
                            }`}
                          ></div>
                          <span className="text-sm text-gray-300">
                            BetterStack
                          </span>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-sm font-medium ${
                              healthData.services.betterstack.status === 'up'
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}
                          >
                            {healthData.services.betterstack.status.toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {healthData.services.betterstack.status === 'up' &&
                            healthData.services.betterstack.latency !==
                              undefined
                              ? `${healthData.services.betterstack.latency}ms`
                              : healthData.services.betterstack.error ||
                                'No details'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cache Service */}
                    <div className="rounded-lg bg-gray-800/50 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              healthData.services.cache.status === 'up'
                                ? 'bg-green-400'
                                : 'bg-red-400'
                            }`}
                          ></div>
                          <span className="text-sm text-gray-300">Cache</span>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-sm font-medium ${
                              healthData.services.cache.status === 'up'
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}
                          >
                            {healthData.services.cache.status.toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {healthData.services.cache.status === 'up'
                              ? `${healthData.services.cache.entries || 0} entries`
                              : 'Cache error'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-gray-800/50 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">
                          Environment
                        </span>
                        <span className="text-blue-400">
                          {healthData.environment.deployment}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-pulse space-y-4">
                  <div className="h-8 w-32 rounded-full bg-gray-800/50"></div>
                  <div className="space-y-2">
                    <div className="h-12 rounded-lg bg-gray-800/50"></div>
                    <div className="h-12 rounded-lg bg-gray-800/50"></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Package Dependencies */}
          <Card className="border-gray-800 bg-black/50 backdrop-blur-md lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Package className="h-5 w-5 text-violet-400" />
                Tech Stack & Dependencies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {packages.map((pkg, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-gray-800/50 bg-gray-900/50 p-3"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-mono text-sm text-white">
                        {pkg.name}
                      </span>
                      <span className="text-xs text-green-400">
                        v{pkg.version}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {pkg.description}
                    </div>
                    {pkg.dependencies !== undefined && (
                      <div className="mt-1 text-xs text-violet-400">
                        {pkg.dependencies} deps
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Build Info */}
          <Card className="border-gray-800 bg-black/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <GitBranch className="h-5 w-5 text-orange-400" />
                Build Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              {systemInfo ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Framework</span>
                    <span className="text-white">{systemInfo.framework}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">TypeScript</span>
                    <span className="text-blue-400">
                      {systemInfo.typescript ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Build Target</span>
                    <span className="text-green-400">
                      {systemInfo.buildTarget}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bundler</span>
                    <span className="text-yellow-400">
                      {systemInfo.bundler}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Deployment</span>
                    <span className="text-purple-400">
                      {systemInfo.deployment}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Platform</span>
                    <span className="text-cyan-400">{systemInfo.platform}</span>
                  </div>
                </div>
              ) : (
                <div className="animate-pulse space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 w-20 rounded bg-gray-800/50"></div>
                      <div className="h-4 w-16 rounded bg-gray-800/50"></div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="border-gray-800 bg-black/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="h-5 w-5 text-cyan-400" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Cache Hit Rate</span>
                  <span className="text-green-400">
                    {cacheStats && cacheStats.hitRate !== undefined
                      ? `${(cacheStats.hitRate * 100).toFixed(1)}%`
                      : 'No data'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">API Response</span>
                  <span className="text-cyan-400">
                    {healthData?.services?.api?.latency !== undefined
                      ? `${healthData.services.api.latency}ms`
                      : '< 1ms'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Components</span>
                  <span className="text-green-400">
                    {systemInfo?.stats?.components || 'No data'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">API Routes</span>
                  <span className="text-blue-400">
                    {systemInfo?.stats?.apiRoutes || 'No data'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>
            🤓 You found the nerds page! This dashboard updates every 5 seconds
            when live mode is enabled.
          </p>
          <p className="mt-1">Built with ❤️ by developers, for developers</p>
        </div>
      </div>
    </div>
  );
}
