// Enhanced analytics tracking functions

interface SearchEvent {
  query: string;
  filters?: string[];
  resultCount: number;
  source: 'projects' | 'people' | 'global';
}

interface FilterEvent {
  filterType: 'tag' | 'category' | 'status';
  filterValue: string;
  resultCount: number;
  page: string;
}

interface UserFlowEvent {
  event: string;
  source: string;
  destination: string;
  duration?: number;
  metadata?: Record<string, any>;
}

interface PageViewEvent {
  page: string;
  title: string;
  referrer?: string;
  loadTime?: number;
}

// Search tracking
export function trackSearch(searchData: SearchEvent) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'search', {
      search_term: searchData.query,
      content_category: searchData.source,
      custom_parameters: {
        filters_applied: searchData.filters?.join(',') || 'none',
        result_count: searchData.resultCount,
        search_source: searchData.source,
      },
    });
  }

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Search tracked:', searchData);
  }
}

// Filter tracking
export function trackFilter(filterData: FilterEvent) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'filter_applied', {
      event_category: 'User Interaction',
      event_label: `${filterData.filterType}:${filterData.filterValue}`,
      custom_parameters: {
        filter_type: filterData.filterType,
        filter_value: filterData.filterValue,
        result_count: filterData.resultCount,
        page: filterData.page,
      },
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('🔽 Filter tracked:', filterData);
  }
}

// User flow tracking
export function trackUserFlow(flowData: UserFlowEvent) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'user_flow', {
      event_category: 'User Journey',
      event_label: `${flowData.source} → ${flowData.destination}`,
      custom_parameters: {
        flow_event: flowData.event,
        flow_source: flowData.source,
        flow_destination: flowData.destination,
        flow_duration: flowData.duration,
        ...flowData.metadata,
      },
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 User flow tracked:', flowData);
  }
}

// Enhanced page view tracking
export function trackPageView(pageData: PageViewEvent) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_title: pageData.title,
      page_location: window.location.href,
      page_referrer: pageData.referrer || document.referrer,
      custom_parameters: {
        load_time: pageData.loadTime,
        page_type: pageData.page,
      },
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('📄 Page view tracked:', pageData);
  }
}

// Click tracking for internal links
export function trackLinkClick(
  linkText: string,
  destination: string,
  source: string
) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'click', {
      event_category: 'Navigation',
      event_label: linkText,
      custom_parameters: {
        link_destination: destination,
        link_source: source,
        link_text: linkText,
      },
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('🔗 Link click tracked:', { linkText, destination, source });
  }
}

// Project interaction tracking
export function trackProjectInteraction(
  action: 'view' | 'github_click' | 'website_click' | 'tag_click',
  projectSlug: string,
  metadata?: Record<string, any>
) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'project_interaction', {
      event_category: 'Project Engagement',
      event_label: `${action}:${projectSlug}`,
      custom_parameters: {
        project_slug: projectSlug,
        interaction_type: action,
        ...metadata,
      },
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('📁 Project interaction tracked:', {
      action,
      projectSlug,
      metadata,
    });
  }
}

// Error tracking
export function trackError(
  errorType: 'api_error' | 'render_error' | 'network_error',
  errorMessage: string,
  context?: Record<string, any>
) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'exception', {
      description: errorMessage,
      fatal: false,
      custom_parameters: {
        error_type: errorType,
        error_context: JSON.stringify(context || {}),
      },
    });
  }

  // Also send to Sentry if available
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(new Error(errorMessage), {
      tags: {
        errorType,
      },
      extra: context,
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error tracked:', { errorType, errorMessage, context });
  }
}

// Session tracking utilities
export class SessionTracker {
  private startTime: number;
  private pageViews: number = 0;
  private interactions: number = 0;

  constructor() {
    this.startTime = Date.now();

    // Track session start
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'session_start', {
        event_category: 'Session',
        custom_parameters: {
          session_id: this.generateSessionId(),
          user_agent: navigator.userAgent,
          viewport_width: window.innerWidth,
          viewport_height: window.innerHeight,
        },
      });
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  trackPageView() {
    this.pageViews++;
  }

  trackInteraction() {
    this.interactions++;
  }

  getSessionData() {
    return {
      duration: Date.now() - this.startTime,
      pageViews: this.pageViews,
      interactions: this.interactions,
    };
  }

  endSession() {
    const sessionData = this.getSessionData();

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'session_end', {
        event_category: 'Session',
        custom_parameters: {
          session_duration: sessionData.duration,
          page_views: sessionData.pageViews,
          interactions: sessionData.interactions,
          bounce_rate: sessionData.pageViews === 1 ? 1 : 0,
        },
      });
    }
  }
}

// Global session tracker instance
let sessionTracker: SessionTracker | null = null;

export function getSessionTracker(): SessionTracker {
  if (!sessionTracker && typeof window !== 'undefined') {
    sessionTracker = new SessionTracker();

    // End session on page unload
    window.addEventListener('beforeunload', () => {
      sessionTracker?.endSession();
    });
  }

  return sessionTracker!;
}
