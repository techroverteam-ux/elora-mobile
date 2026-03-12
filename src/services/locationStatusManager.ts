import { clientService } from './clientService';

export interface LocationStatus {
  enabled: boolean;
  clientName?: string;
  loading: boolean;
  error?: string;
}

class LocationStatusManager {
  private cache = new Map<string, { config: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Check if location overlay is enabled for a client
   */
  async checkLocationStatus(clientId?: string): Promise<LocationStatus> {
    if (!clientId) {
      return { enabled: false, loading: false };
    }

    try {
      // Check cache first
      const cached = this.cache.get(clientId);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return {
          enabled: cached.config.enableLocationOverlay || false,
          loading: false,
        };
      }

      // Fetch from API
      const config = await clientService.getLocationConfig(clientId);
      
      // Cache the result
      this.cache.set(clientId, {
        config,
        timestamp: Date.now(),
      });

      return {
        enabled: config.enableLocationOverlay || false,
        loading: false,
      };
    } catch (error) {
      console.error('Error checking location status:', error);
      return {
        enabled: false,
        loading: false,
        error: 'Failed to check location settings',
      };
    }
  }

  /**
   * Clear cache for a specific client
   */
  clearCache(clientId: string) {
    this.cache.delete(clientId);
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    this.cache.clear();
  }

  /**
   * Get cached status without API call
   */
  getCachedStatus(clientId: string): LocationStatus | null {
    const cached = this.cache.get(clientId);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return {
        enabled: cached.config.enableLocationOverlay || false,
        loading: false,
      };
    }
    return null;
  }
}

export const locationStatusManager = new LocationStatusManager();