// components/StatusIndicator.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  TrendingUp,
  Clock,
  Wifi,
  WifiOff,
  Server,
  Zap,
  Globe,
  Shield,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { getProjectStatus } from '@/lib/api-client';

interface StatusModalProps {
  status: 'operational' | 'degraded' | 'down' | 'maintenance' | 'unknown';
  lastCheckedAt: string;
  url: string;
  uptimePercentage?: number;
  responseTime?: number;
  totalDowntime?: number;
  incidentsCount?: number;
  checkFrequency?: number;
  nextUpdateIn?: number;
  isUpdating?: boolean;
  onClose: () => void;
}

const StatusModal = ({
  status,
  lastCheckedAt,
  url,
  uptimePercentage,
  responseTime,
  totalDowntime,
  incidentsCount,
  checkFrequency,
  nextUpdateIn = 0,
  isUpdating = false,
  onClose,
}: StatusModalProps) => {
  const [animateIn, setAnimateIn] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  // Format downtime to human-readable
  const formatDowntime = (seconds?: number): string => {
    if (seconds === undefined) return 'N/A';
    if (seconds === 0) return 'None';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400)
      return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
  };

  // Format uptime percentage - show more precision for high values
  const formatUptime = (percentage?: number): string => {
    if (percentage === undefined) return 'N/A';
    if (percentage === 100) return '100%';
    if (percentage >= 99.99) return `${percentage.toFixed(4)}%`;
    if (percentage >= 99.9) return `${percentage.toFixed(3)}%`;
    if (percentage >= 99) return `${percentage.toFixed(2)}%`;
    return `${percentage.toFixed(1)}%`;
  };

  useEffect(() => {
    // Trigger animations
    const timer = setTimeout(() => {
      setAnimateIn(true);
      setTimeout(() => setShowMetrics(true), 200);
    }, 10);

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Lock body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const statusConfig = {
    operational: {
      icon: CheckCircle2,
      title: 'All Systems Operational',
      description: 'Service is running smoothly with no issues detected.',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      gradientFrom: 'from-emerald-500',
      gradientTo: 'to-green-500',
      gradientVia: 'via-emerald-400',
      pulseColor: 'bg-emerald-400',
      shadowColor: 'shadow-emerald-500/20',
      metrics: [
        { label: 'Status', value: 'Online', icon: Wifi, trend: 'Stable' },
        {
          label: 'Response Time',
          value: responseTime ? `${responseTime}ms` : 'N/A',
          icon: Zap,
          trend:
            responseTime && responseTime < 100
              ? 'Fast'
              : responseTime && responseTime < 300
                ? 'Normal'
                : 'Slow',
        },
        {
          label: 'Availability',
          value: formatUptime(uptimePercentage),
          icon: TrendingUp,
          trend:
            uptimePercentage && uptimePercentage >= 99.9
              ? 'Excellent'
              : uptimePercentage && uptimePercentage >= 99
                ? 'Good'
                : 'Poor',
        },
        {
          label: 'Incidents',
          value:
            incidentsCount !== undefined ? incidentsCount.toString() : 'N/A',
          icon: Activity,
          trend:
            incidentsCount === 0
              ? 'None'
              : incidentsCount === 1
                ? '1 incident'
                : `${incidentsCount} incidents`,
        },
        {
          label: 'Monitoring',
          value: 'Active',
          icon: BarChart3,
          trend: 'Real-time',
        },
        {
          label: 'Check Interval',
          value: checkFrequency ? `${checkFrequency}s` : 'N/A',
          icon: Clock,
          trend: 'Automated',
        },
      ],
    },
    degraded: {
      icon: AlertCircle,
      title: 'Degraded Performance',
      description:
        'Service is operational but experiencing slower response times.',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-yellow-500',
      gradientVia: 'via-amber-400',
      pulseColor: 'bg-amber-400',
      shadowColor: 'shadow-amber-500/20',
      metrics: [
        {
          label: 'Status',
          value: 'Degraded',
          icon: AlertCircle,
          trend: 'Monitoring',
        },
        {
          label: 'Response Time',
          value: responseTime ? `${responseTime}ms` : 'N/A',
          icon: Zap,
          trend: 'Slower than usual',
        },
        {
          label: 'Availability',
          value: formatUptime(uptimePercentage),
          icon: TrendingUp,
          trend: 'Below target',
        },
        {
          label: 'Incidents',
          value:
            incidentsCount !== undefined ? incidentsCount.toString() : 'N/A',
          icon: Activity,
          trend: 'Active issues',
        },
        {
          label: 'Downtime',
          value: formatDowntime(totalDowntime),
          icon: Clock,
          trend: 'Accumulating',
        },
        {
          label: 'Check Interval',
          value: checkFrequency ? `${checkFrequency}s` : 'N/A',
          icon: RefreshCw,
          trend: 'Monitoring',
        },
      ],
    },
    down: {
      icon: XCircle,
      title: 'Service Unavailable',
      description: 'The service is currently experiencing issues.',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      gradientFrom: 'from-red-500',
      gradientTo: 'to-rose-500',
      gradientVia: 'via-red-400',
      pulseColor: 'bg-red-400',
      shadowColor: 'shadow-red-500/20',
      metrics: [
        { label: 'Status', value: 'Offline', icon: WifiOff, trend: 'Critical' },
        {
          label: 'Response Time',
          value: responseTime ? `${responseTime}ms` : 'Timeout',
          icon: Zap,
          trend: 'Failed',
        },
        {
          label: 'Availability',
          value: formatUptime(uptimePercentage),
          icon: TrendingUp,
          trend: 'Impacted',
        },
        {
          label: 'Incidents',
          value:
            incidentsCount !== undefined ? incidentsCount.toString() : 'N/A',
          icon: AlertCircle,
          trend: 'Active outage',
        },
        {
          label: 'Downtime',
          value: formatDowntime(totalDowntime),
          icon: Clock,
          trend: 'Ongoing',
        },
        {
          label: 'Auto-retry',
          value: checkFrequency ? `In ${checkFrequency}s` : 'N/A',
          icon: RefreshCw,
          trend: 'Pending',
        },
      ],
    },
    maintenance: {
      icon: RefreshCw,
      title: 'Scheduled Maintenance',
      description: 'Service is temporarily offline for scheduled updates.',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-sky-500',
      gradientVia: 'via-blue-400',
      pulseColor: 'bg-blue-400',
      shadowColor: 'shadow-blue-500/20',
      metrics: [
        {
          label: 'Status',
          value: 'Maintenance',
          icon: RefreshCw,
          trend: 'Scheduled',
        },
        {
          label: 'Response Time',
          value: responseTime ? `${responseTime}ms` : 'N/A',
          icon: Zap,
          trend: 'Under maintenance',
        },
        {
          label: 'Availability',
          value: formatUptime(uptimePercentage),
          icon: TrendingUp,
          trend: 'Expected',
        },
        {
          label: 'Incidents',
          value:
            incidentsCount !== undefined ? incidentsCount.toString() : 'N/A',
          icon: Activity,
          trend: 'Maintenance window',
        },
        {
          label: 'Downtime',
          value: formatDowntime(totalDowntime),
          icon: Clock,
          trend: 'Planned',
        },
        {
          label: 'Check Interval',
          value: checkFrequency ? `${checkFrequency}s` : 'N/A',
          icon: BarChart3,
          trend: 'Monitoring',
        },
      ],
    },
    unknown: {
      icon: AlertCircle,
      title: 'Status Unknown',
      description: 'Unable to determine current service status.',
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/20',
      gradientFrom: 'from-gray-500',
      gradientTo: 'to-gray-400',
      gradientVia: 'via-gray-400',
      pulseColor: 'bg-gray-400',
      shadowColor: 'shadow-gray-500/20',
      metrics: [
        {
          label: 'Status',
          value: 'Unknown',
          icon: AlertCircle,
          trend: 'Checking',
        },
        {
          label: 'Response Time',
          value: responseTime ? `${responseTime}ms` : 'N/A',
          icon: Zap,
          trend: 'No data',
        },
        {
          label: 'Availability',
          value: formatUptime(uptimePercentage),
          icon: TrendingUp,
          trend: 'Unknown',
        },
        {
          label: 'Incidents',
          value:
            incidentsCount !== undefined ? incidentsCount.toString() : 'N/A',
          icon: Activity,
          trend: 'No data',
        },
        {
          label: 'Downtime',
          value: formatDowntime(totalDowntime),
          icon: Clock,
          trend: 'Unknown',
        },
        {
          label: 'Check Interval',
          value: checkFrequency ? `${checkFrequency}s` : 'N/A',
          icon: RefreshCw,
          trend: 'Pending',
        },
      ],
    },
  };

  // Update metrics for each status with real data
  if (status === 'operational') {
    statusConfig.operational.metrics = [
      { label: 'Status', value: 'Online', icon: Wifi, trend: 'Stable' },
      {
        label: 'Response Time',
        value: responseTime ? `${responseTime}ms` : 'N/A',
        icon: Zap,
        trend:
          responseTime && responseTime < 100
            ? 'Fast'
            : responseTime && responseTime < 300
              ? 'Normal'
              : 'Slow',
      },
      {
        label: 'Availability',
        value: formatUptime(uptimePercentage),
        icon: TrendingUp,
        trend:
          uptimePercentage && uptimePercentage >= 99.9
            ? 'Excellent'
            : uptimePercentage && uptimePercentage >= 99
              ? 'Good'
              : 'Poor',
      },
      {
        label: 'Incidents',
        value: incidentsCount !== undefined ? incidentsCount.toString() : 'N/A',
        icon: Activity,
        trend:
          incidentsCount === 0
            ? 'None'
            : incidentsCount === 1
              ? '1 incident'
              : `${incidentsCount} incidents`,
      },
      {
        label: 'Downtime',
        value: formatDowntime(totalDowntime),
        icon: Clock,
        trend: totalDowntime === 0 ? 'Perfect' : 'Recovered',
      },
      {
        label: 'Check Interval',
        value: checkFrequency ? `${checkFrequency}s` : 'N/A',
        icon: RefreshCw,
        trend: 'Automated',
      },
    ];
  } else if (status === 'degraded') {
    statusConfig.degraded.metrics = [
      {
        label: 'Status',
        value: 'Degraded',
        icon: AlertCircle,
        trend: 'Monitoring',
      },
      {
        label: 'Response Time',
        value: responseTime ? `${responseTime}ms` : 'N/A',
        icon: Zap,
        trend: 'Slower than usual',
      },
      {
        label: 'Availability',
        value: formatUptime(uptimePercentage),
        icon: TrendingUp,
        trend: 'Below target',
      },
      {
        label: 'Incidents',
        value: incidentsCount !== undefined ? incidentsCount.toString() : 'N/A',
        icon: Activity,
        trend: 'Active issues',
      },
      {
        label: 'Downtime',
        value: formatDowntime(totalDowntime),
        icon: Clock,
        trend: 'Accumulating',
      },
      {
        label: 'Check Interval',
        value: checkFrequency ? `${checkFrequency}s` : 'N/A',
        icon: RefreshCw,
        trend: 'Monitoring',
      },
    ];
  } else if (status === 'down') {
    statusConfig.down.metrics = [
      { label: 'Status', value: 'Offline', icon: WifiOff, trend: 'Critical' },
      {
        label: 'Last Response',
        value: responseTime ? `${responseTime}ms` : 'Timeout',
        icon: Zap,
        trend: 'Failed',
      },
      {
        label: 'Availability',
        value: formatUptime(uptimePercentage),
        icon: TrendingUp,
        trend: 'Impacted',
      },
      {
        label: 'Incidents',
        value: incidentsCount !== undefined ? incidentsCount.toString() : 'N/A',
        icon: AlertCircle,
        trend: 'Active outage',
      },
      {
        label: 'Downtime',
        value: formatDowntime(totalDowntime),
        icon: Clock,
        trend: 'Ongoing',
      },
      {
        label: 'Auto-retry',
        value: checkFrequency ? `In ${checkFrequency}s` : 'N/A',
        icon: RefreshCw,
        trend: 'Pending',
      },
    ];
  }

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.unknown;
  const Icon = config.icon;

  return createPortal(
    <div className="status-modal-backdrop">
      {/* Backdrop with animated gradient */}
      <div
        className={`backdrop-animate-in absolute inset-0 ${
          animateIn ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-500/10" />
      </div>

      {/* Modal */}
      <div
        className={`status-modal-container ${
          animateIn ? 'status-modal-animate-in' : 'opacity-0'
        }`}
      >
        <div
          className="status-modal"
          data-status={status}
          style={
            {
              '--gradient-from': config.gradientFrom
                .replace('from-', '#')
                .replace('emerald-500', '10b981')
                .replace('amber-500', 'f59e0b')
                .replace('red-500', 'ef4444')
                .replace('blue-500', '3b82f6')
                .replace('gray-500', '6b7280'),
              '--gradient-via': config.gradientVia
                .replace('via-', '#')
                .replace('emerald-400', '34d399')
                .replace('amber-400', 'fbbf24')
                .replace('red-400', 'f87171')
                .replace('blue-400', '60a5fa')
                .replace('gray-400', '9ca3af'),
              '--gradient-to': config.gradientTo
                .replace('to-', '#')
                .replace('green-500', '22c55e')
                .replace('yellow-500', 'eab308')
                .replace('rose-500', 'f43f5e')
                .replace('sky-500', '0ea5e9')
                .replace('gray-400', '9ca3af'),
            } as React.CSSProperties
          }
        >
          {/* Animated gradient background */}
          <div className="status-modal-gradient" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="status-close-button"
            aria-label="Close status modal"
          >
            <XCircle className="h-5 w-5 text-white" />
          </button>

          {/* Content */}
          <div className="relative p-6">
            {/* Status Icon with enhanced animation */}
            <div className="mb-6 flex justify-center">
              <div className="status-icon-container">
                {/* Outer rings */}
                <div
                  className="status-icon-ring scale-150"
                  style={
                    {
                      '--ring-color': config.bgColor.includes('emerald')
                        ? 'rgba(16, 185, 129, 0.2)'
                        : config.bgColor.includes('amber')
                          ? 'rgba(245, 158, 11, 0.2)'
                          : config.bgColor.includes('red')
                            ? 'rgba(239, 68, 68, 0.2)'
                            : config.bgColor.includes('blue')
                              ? 'rgba(59, 130, 246, 0.2)'
                              : 'rgba(156, 163, 175, 0.2)',
                    } as React.CSSProperties
                  }
                />
                <div
                  className="status-icon-ring animation-delay-200 scale-125"
                  style={
                    {
                      '--ring-color': config.bgColor.includes('emerald')
                        ? 'rgba(16, 185, 129, 0.3)'
                        : config.bgColor.includes('amber')
                          ? 'rgba(245, 158, 11, 0.3)'
                          : config.bgColor.includes('red')
                            ? 'rgba(239, 68, 68, 0.3)'
                            : config.bgColor.includes('blue')
                              ? 'rgba(59, 130, 246, 0.3)'
                              : 'rgba(156, 163, 175, 0.3)',
                    } as React.CSSProperties
                  }
                />

                {/* Icon container */}
                <div
                  className={`relative rounded-full bg-gradient-to-br ${config.gradientFrom} ${config.gradientVia} ${config.gradientTo} p-[2px]`}
                >
                  <div
                    className={`rounded-full ${config.bgColor} p-6 backdrop-blur-sm`}
                  >
                    <Icon
                      className={`h-16 w-16 text-white ${
                        status === 'maintenance'
                          ? 'animate-spin'
                          : status === 'operational'
                            ? 'animate-pulse'
                            : status === 'down'
                              ? 'animate-bounce'
                              : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Status-specific effects */}
                {status === 'operational' && (
                  <div className="absolute -inset-2">
                    <div
                      className={`animate-spin-slow absolute inset-0 rounded-full bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} opacity-20 blur-md`}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Title and Description */}
            <div className="mb-6 text-center">
              <h3 className={`mb-2 text-2xl font-bold ${config.color}`}>
                {config.title}
              </h3>
              <p className="text-sm text-gray-400">{config.description}</p>
            </div>

            {/* Enhanced Metrics Grid */}
            <div className="mb-6 grid grid-cols-3 gap-3">
              {config.metrics.map((metric, index) => (
                <div
                  key={index}
                  className={`status-metric-card ${
                    showMetrics
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-4 opacity-0'
                  }`}
                  style={
                    {
                      transitionDelay: `${index * 50}ms`,
                      '--metric-glow': config.color.includes('emerald')
                        ? 'rgba(16, 185, 129, 0.2)'
                        : config.color.includes('amber')
                          ? 'rgba(245, 158, 11, 0.2)'
                          : config.color.includes('red')
                            ? 'rgba(239, 68, 68, 0.2)'
                            : config.color.includes('blue')
                              ? 'rgba(59, 130, 246, 0.2)'
                              : 'rgba(156, 163, 175, 0.2)',
                    } as React.CSSProperties
                  }
                >
                  <metric.icon
                    className={`relative mx-auto mb-2 h-5 w-5 ${config.color} transition-transform duration-300 group-hover:scale-110`}
                  />
                  <div className="text-xs text-gray-500">{metric.label}</div>
                  <div
                    className={`status-metric-value mt-1 text-sm ${config.color}`}
                  >
                    {metric.value}
                  </div>
                  {metric.trend && (
                    <div className="mt-1 text-xs text-gray-500">
                      {metric.trend}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Last Checked with countdown */}
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                <span>
                  Last checked: {new Date(lastCheckedAt).toLocaleString()}
                </span>
              </div>

              {/* Update countdown */}
              <div className="flex items-center justify-center gap-2">
                <div
                  className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                    isUpdating
                      ? 'bg-violet-500/20 text-violet-300'
                      : nextUpdateIn === 0
                        ? 'bg-blue-500/20 text-blue-300'
                        : nextUpdateIn <= 5000
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-gray-500/20 text-gray-300'
                  }`}
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : nextUpdateIn === 0 ? (
                    <>
                      <Clock className="h-3 w-3 animate-pulse" />
                      <span>Waiting for server...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3" />
                      <span>
                        Next update in {Math.ceil(nextUpdateIn / 1000)}s
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Actions */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="status-action-button flex-1 text-white"
                >
                  <span className="relative z-10">Close</span>
                </button>
                <Link
                  href="https://status.lagden.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="status-action-button status-action-button-primary flex flex-1 items-center justify-center gap-2"
                  style={
                    {
                      '--button-from': config.gradientFrom
                        .replace('from-', '#')
                        .replace('emerald-500', '10b981')
                        .replace('amber-500', 'f59e0b')
                        .replace('red-500', 'ef4444')
                        .replace('blue-500', '3b82f6')
                        .replace('gray-500', '6b7280'),
                      '--button-to': config.gradientTo
                        .replace('to-', '#')
                        .replace('green-500', '22c55e')
                        .replace('yellow-500', 'eab308')
                        .replace('rose-500', 'f43f5e')
                        .replace('sky-500', '0ea5e9')
                        .replace('gray-400', '9ca3af'),
                    } as React.CSSProperties
                  }
                >
                  <span className="relative z-10 flex items-center gap-2">
                    View Full Status
                    <ExternalLink className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

interface StatusIndicatorProps {
  status: 'operational' | 'degraded' | 'down' | 'maintenance' | 'unknown';
  lastCheckedAt: string;
  url: string;
  uptimePercentage?: number;
  responseTime?: number;
  totalDowntime?: number;
  incidentsCount?: number;
  checkFrequency?: number;
  monitorId?: string;
  projectSlug: string; // Added for new API
}

export default function StatusIndicator({
  status: initialStatus,
  lastCheckedAt: initialLastCheckedAt,
  url,
  uptimePercentage: initialUptimePercentage,
  responseTime: initialResponseTime,
  totalDowntime: initialTotalDowntime,
  incidentsCount: initialIncidentsCount,
  checkFrequency: initialCheckFrequency,
  monitorId,
  projectSlug,
}: StatusIndicatorProps) {
  const [showModal, setShowModal] = useState(false);
  const indicatorRef = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState(initialStatus);
  const [lastCheckedAt, setLastCheckedAt] = useState(initialLastCheckedAt);
  const [uptimePercentage, setUptimePercentage] = useState(
    initialUptimePercentage
  );
  const [responseTime, setResponseTime] = useState(initialResponseTime);
  const [totalDowntime, setTotalDowntime] = useState(initialTotalDowntime);
  const [incidentsCount, setIncidentsCount] = useState(initialIncidentsCount);
  const [checkFrequency, setCheckFrequency] = useState(initialCheckFrequency);
  const [nextUpdateIn, setNextUpdateIn] = useState<number>(30000);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch real-time status updates
  useEffect(() => {
    if (!projectSlug || typeof window === 'undefined') return;

    let intervalId: NodeJS.Timeout;
    let isComponentMounted = true;

    const fetchStatus = async () => {
      if (!isComponentMounted) return;

      setIsUpdating(true);
      try {
        // Use the new status endpoint via api-client
        const statusData = await getProjectStatus(projectSlug);

        if (!isComponentMounted || !statusData) return;

        setStatus(statusData.status);
        setLastCheckedAt(statusData.last_checked_at);
        if (statusData.uptime_percentage !== undefined)
          setUptimePercentage(statusData.uptime_percentage);
        if (statusData.response_time !== undefined)
          setResponseTime(statusData.response_time);
        if (statusData.total_downtime !== undefined)
          setTotalDowntime(statusData.total_downtime);
        if (statusData.incidents_count !== undefined)
          setIncidentsCount(statusData.incidents_count);
        if (statusData.check_frequency !== undefined)
          setCheckFrequency(statusData.check_frequency);

        // Calculate actual time until update based on server response
        const now = Date.now();
        const actualTimeUntilUpdate = statusData.meta?.nextUpdate
          ? Math.max(0, statusData.meta.nextUpdate - now)
          : 30000; // Default 30 seconds

        // If we got a cached response and countdown is near 0, wait a bit before next fetch
        if (statusData.meta?.cached && actualTimeUntilUpdate < 2000) {
          setNextUpdateIn(5000); // Set 5 seconds before retry
          // Schedule next fetch after 5 seconds
          if (intervalId) clearInterval(intervalId);
          intervalId = setInterval(fetchStatus, 5000);
        } else {
          setNextUpdateIn(actualTimeUntilUpdate);
          // Schedule next fetch based on server timing
          if (intervalId) clearInterval(intervalId);
          intervalId = setInterval(
            fetchStatus,
            Math.max(actualTimeUntilUpdate, 5000)
          );
        }
      } catch (error) {
        console.error('Failed to fetch status update:', error);
      } finally {
        if (isComponentMounted) {
          setIsUpdating(false);
        }
      }
    };

    // Initial fetch after a short delay
    const initialTimeout = setTimeout(fetchStatus, 1000);

    return () => {
      isComponentMounted = false;
      clearTimeout(initialTimeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, [projectSlug]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setNextUpdateIn((prev) => {
        const newValue = Math.max(0, prev - 1000);
        // If countdown reaches 0 and we're not already updating, trigger a fetch
        if (newValue === 0 && !isUpdating && projectSlug) {
          // The fetch will be triggered by the polling interval
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isUpdating, projectSlug]);

  const statusConfig = {
    operational: {
      icon: Wifi,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/30',
      glowColor: 'shadow-emerald-500/50',
      gradientFrom: 'from-emerald-500',
      gradientTo: 'to-green-500',
      label: 'Operational',
      pulse: true,
    },
    degraded: {
      icon: AlertCircle,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-500/30',
      glowColor: 'shadow-amber-500/50',
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-yellow-500',
      label: 'Degraded',
      pulse: true,
    },
    down: {
      icon: WifiOff,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      glowColor: 'shadow-red-500/50',
      gradientFrom: 'from-red-500',
      gradientTo: 'to-rose-500',
      label: 'Offline',
      pulse: false,
    },
    maintenance: {
      icon: RefreshCw,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      glowColor: 'shadow-blue-500/50',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-sky-500',
      label: 'Maintenance',
      pulse: true,
    },
    unknown: {
      icon: Activity,
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/20',
      borderColor: 'border-gray-500/30',
      glowColor: 'shadow-gray-500/50',
      gradientFrom: 'from-gray-500',
      gradientTo: 'to-gray-400',
      label: 'Unknown',
      pulse: false,
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.unknown;
  const Icon = config.icon;

  return (
    <>
      <button
        ref={indicatorRef}
        onClick={() => setShowModal(true)}
        className={`group relative overflow-hidden rounded-full border ${config.borderColor} ${config.bgColor} px-6 py-2.5 text-xs font-medium ${config.color} shadow-lg ${config.glowColor} w-auto min-w-fit whitespace-nowrap backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-black`}
        aria-label={`Service status: ${config.label}. Click to view details.`}
      >
        {/* Gradient background */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} opacity-0 transition-opacity duration-300 group-hover:opacity-20`}
        />

        {/* Content container */}
        <div className="relative flex min-w-0 items-center gap-2.5">
          {/* Animated icon with glow */}
          <div className="relative flex-shrink-0">
            {config.pulse && (
              <div
                className={`absolute -inset-1 rounded-full ${config.bgColor} animate-ping opacity-75`}
              />
            )}
            <Icon
              className={`relative h-4 w-4 ${status === 'maintenance' ? 'animate-spin' : ''} ${isUpdating ? 'animate-pulse' : ''} transition-transform duration-300 group-hover:scale-110`}
            />
          </div>

          {/* Status text with hover effect */}
          <span className="relative flex-shrink-0 font-semibold">
            {config.label}
            <span className="absolute inset-x-0 -bottom-1 h-px scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100" />
          </span>

          {/* Update indicator or chevron */}
          {isUpdating ? (
            <RefreshCw className="h-3 w-3 flex-shrink-0 animate-spin" />
          ) : (
            <svg
              className="h-3 w-3 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
        </div>

        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      </button>

      {showModal && (
        <StatusModal
          status={status}
          lastCheckedAt={lastCheckedAt}
          url={url}
          uptimePercentage={uptimePercentage}
          responseTime={responseTime}
          totalDowntime={totalDowntime}
          incidentsCount={incidentsCount}
          checkFrequency={checkFrequency}
          nextUpdateIn={nextUpdateIn}
          isUpdating={isUpdating}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
