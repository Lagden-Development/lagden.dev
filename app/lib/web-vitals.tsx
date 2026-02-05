'use client';

import { useEffect } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
  id: string;
  navigationType: string;
}

export function WebVitals() {
  useEffect(() => {
    const handleMetric = (metric: WebVitalMetric) => {
      // Send to Google Analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'web_vital', {
          event_category: 'Web Vitals',
          event_label: metric.name,
          value: Math.round(metric.value),
          custom_map: { metric_rating: metric.rating },
          non_interaction: true,
        });
      }

      // Console log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `%c${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`,
          `color: ${
            metric.rating === 'good'
              ? 'green'
              : metric.rating === 'needs-improvement'
                ? 'orange'
                : 'red'
          }`
        );
      }
    };

    // Measure all Core Web Vitals
    onCLS(handleMetric);
    onINP(handleMetric); // Replaced FID with INP (Interaction to Next Paint)
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);

    // Track custom performance metrics
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;

          // DNS lookup time
          const dnsTime = navEntry.domainLookupEnd - navEntry.domainLookupStart;

          // TCP connection time
          const connectionTime = navEntry.connectEnd - navEntry.connectStart;

          // Request time
          const requestTime = navEntry.responseEnd - navEntry.requestStart;

          // DOM ready time
          const domReadyTime =
            navEntry.domContentLoadedEventEnd - navEntry.fetchStart;

          // Window load time
          const windowLoadTime = navEntry.loadEventEnd - navEntry.fetchStart;

          // Send custom metrics
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'custom_performance', {
              event_category: 'Performance',
              dns_time: Math.round(dnsTime),
              connection_time: Math.round(connectionTime),
              request_time: Math.round(requestTime),
              dom_ready_time: Math.round(domReadyTime),
              window_load_time: Math.round(windowLoadTime),
              non_interaction: true,
            });
          }

          if (process.env.NODE_ENV === 'development') {
            console.group('Custom Performance Metrics');
            console.log(`DNS Lookup: ${Math.round(dnsTime)}ms`);
            console.log(`TCP Connection: ${Math.round(connectionTime)}ms`);
            console.log(`Request Time: ${Math.round(requestTime)}ms`);
            console.log(`DOM Ready: ${Math.round(domReadyTime)}ms`);
            console.log(`Window Load: ${Math.round(windowLoadTime)}ms`);
            console.groupEnd();
          }
        }
      }
    });

    // Observe navigation and resource timings
    observer.observe({
      entryTypes: ['navigation', 'resource'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}

// Hook for component-level performance tracking
export function usePerformanceTracking(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'component_render_time', {
          event_category: 'Performance',
          event_label: componentName,
          value: Math.round(renderTime),
          non_interaction: true,
        });
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `${componentName} render time: ${Math.round(renderTime)}ms`
        );
      }
    };
  }, [componentName]);
}

// Performance budget checker
export function checkPerformanceBudget() {
  if (typeof window === 'undefined') return;

  // Performance budget thresholds
  const budgets = {
    FCP: 1800, // First Contentful Paint
    LCP: 2500, // Largest Contentful Paint
    INP: 200, // Interaction to Next Paint (replaces FID)
    CLS: 0.1, // Cumulative Layout Shift
    TTFB: 800, // Time to First Byte
  };

  const checkMetric = (metric: WebVitalMetric) => {
    const budget = budgets[metric.name as keyof typeof budgets];
    if (budget && metric.value > budget) {
      console.warn(
        `⚠️ Performance budget exceeded for ${metric.name}: ${Math.round(metric.value)} > ${budget}`
      );

      // Send budget violation to analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'performance_budget_violation', {
          event_category: 'Performance',
          event_label: metric.name,
          value: Math.round(metric.value),
          budget,
          non_interaction: true,
        });
      }
    }
  };

  // Check budgets for all vitals
  onCLS(checkMetric);
  onINP(checkMetric); // Replaced FID with INP
  onFCP(checkMetric);
  onLCP(checkMetric);
  onTTFB(checkMetric);
}
