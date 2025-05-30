// BetterStack API client for fetching monitor status and metrics

export interface BetterStackMonitor {
  id: string;
  type: string;
  attributes: {
    url: string;
    pronounceable_name: string;
    monitor_type: string;
    status: 'up' | 'down' | 'paused' | 'pending' | 'maintenance' | 'validating';
    last_checked_at: string;
    check_frequency: number;
    last_response_time?: number;
    response_time?: number;
  };
}

export interface BetterStackResponseTime {
  at: string;
  response_time: number;
  name_lookup_time: number;
  connection_time: number;
  tls_handshake_time: number;
  data_transfer_time: number;
}

export interface BetterStackResponseTimes {
  data: {
    id: string;
    type: string;
    attributes: {
      regions: Array<{
        region: string;
        response_times: BetterStackResponseTime[];
      }>;
    };
  };
}

export interface BetterStackSLA {
  data: {
    id: string;
    type: string;
    attributes: {
      availability: number;
      total_downtime: number;
      number_of_incidents: number;
      longest_incident: number;
      average_incident: number;
    };
  };
}

export interface MonitorStatus {
  status: 'operational' | 'degraded' | 'down' | 'maintenance' | 'unknown';
  last_checked_at: string;
  monitor_url: string;
  uptime_percentage?: number;
  response_time?: number;
  total_downtime?: number;
  incidents_count?: number;
  check_frequency?: number;
}

interface CachedMonitorStatus {
  data: MonitorStatus;
  timestamp: number;
}

class BetterStackClient {
  private apiKey: string;
  private baseUrl = 'https://uptime.betterstack.com/api/v2';
  private cache = new Map<string, CachedMonitorStatus>();
  private cacheTimeout = 60000; // 1 minute cache

  constructor() {
    this.apiKey = process.env.BETTERSTACK_UPTIME_API_KEY || '';
  }

  private mapBetterStackStatus(status: string): MonitorStatus['status'] {
    switch (status) {
      case 'up':
        return 'operational';
      case 'validating':
        return 'degraded';
      case 'down':
        return 'down';
      case 'maintenance':
        return 'maintenance';
      case 'paused':
      case 'pending':
      default:
        return 'unknown';
    }
  }

  private async fetchFromBetterStack<T>(endpoint: string): Promise<T | null> {
    if (!this.apiKey) {
      console.error('[BetterStack] Missing API key');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(
          `[BetterStack] Error fetching ${endpoint}: ${response.status}`
        );
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`[BetterStack] Failed to fetch ${endpoint}:`, error);
      return null;
    }
  }

  async getMonitorStatus(monitorId: string): Promise<MonitorStatus | null> {
    // Check cache first
    const cached = this.cache.get(monitorId);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(
        `[BetterStack] Returning cached status for monitor ${monitorId}`
      );
      return cached.data;
    }

    console.log(`[BetterStack] Fetching full status for monitor ${monitorId}`);

    // Fetch all data in parallel
    const [monitorData, responseTimesData, slaData] = await Promise.all([
      this.fetchFromBetterStack<{ data: BetterStackMonitor }>(
        `/monitors/${monitorId}`
      ),
      this.fetchFromBetterStack<BetterStackResponseTimes>(
        `/monitors/${monitorId}/response-times?from=${new Date(Date.now() - 3600000).toISOString()}`
      ),
      this.fetchFromBetterStack<BetterStackSLA>(`/monitors/${monitorId}/sla`),
    ]);

    console.log(
      `[BetterStack] Monitor data:`,
      JSON.stringify(monitorData?.data?.attributes, null, 2)
    );

    if (!monitorData) {
      return null;
    }

    const monitor = monitorData.data;

    // Calculate average response time from last 10 measurements
    let avgResponseTime: number | undefined;

    if (
      responseTimesData?.data?.attributes?.regions &&
      responseTimesData.data.attributes.regions.length > 0
    ) {
      const allResponseTimes: number[] = [];
      let hasData = false;

      responseTimesData.data.attributes.regions.forEach((region) => {
        // Check if response_times exists and is an array
        if (
          Array.isArray(region.response_times) &&
          region.response_times.length > 0
        ) {
          hasData = true;
          region.response_times.slice(-10).forEach((rt) => {
            // BetterStack returns response times in seconds, convert to milliseconds
            const responseTimeMs = rt.response_time * 1000;
            allResponseTimes.push(responseTimeMs);
          });
        }
      });

      if (allResponseTimes.length > 0) {
        avgResponseTime = Math.round(
          allResponseTimes.reduce((sum, time) => sum + time, 0) /
            allResponseTimes.length
        );
        console.log(
          `[BetterStack] Calculated average response time: ${avgResponseTime}ms from ${allResponseTimes.length} samples`
        );
      } else if (!hasData) {
        console.log('[BetterStack] No response time data available in regions');
      }
    }

    // Fallback: Try to get response time from monitor attributes
    if (avgResponseTime === undefined || avgResponseTime === 0) {
      if (monitor.attributes.response_time !== undefined) {
        avgResponseTime = Math.round(monitor.attributes.response_time * 1000);
        console.log(
          `[BetterStack] Using response_time from monitor: ${avgResponseTime}ms`
        );
      } else if (monitor.attributes.last_response_time !== undefined) {
        avgResponseTime = Math.round(
          monitor.attributes.last_response_time * 1000
        );
        console.log(
          `[BetterStack] Using last_response_time from monitor: ${avgResponseTime}ms`
        );
      }
    }

    // Get SLA data
    const slaAttributes = slaData?.data?.attributes;

    const status: MonitorStatus = {
      status: this.mapBetterStackStatus(monitor.attributes.status),
      last_checked_at: monitor.attributes.last_checked_at,
      monitor_url: monitor.attributes.url,
      uptime_percentage: slaAttributes?.availability,
      response_time: avgResponseTime,
      total_downtime: slaAttributes?.total_downtime,
      incidents_count: slaAttributes?.number_of_incidents,
      check_frequency: monitor.attributes.check_frequency,
    };

    // Cache the result
    this.cache.set(monitorId, {
      data: status,
      timestamp: Date.now(),
    });

    return status;
  }
}

export const betterStackClient = new BetterStackClient();
