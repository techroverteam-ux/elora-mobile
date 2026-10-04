import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// Enable Google Play Services Fused Location Provider on Android for fast, reliable fixes
try {
  Geolocation.setRNConfiguration({
    skipPermissionRequests: false,
    authorizationLevel: 'whenInUse',
    locationProvider: 'playServices',
  });
} catch (e) {
  console.warn('Failed to set Geolocation configuration:', e);
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
  timestamp?: number;
}

export interface AddressComponents {
  placeName?: string;      // Store / building / establishment name
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
}

export interface LocationOverlayConfig {
  enabled: boolean;
  mapSize: number;
  showAddress: boolean;
  showCoordinates: boolean;
  showTimestamp: boolean;
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

class LocationService {
  async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        // Android 12+ (API 31+) requires requesting both FINE and COARSE together
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        const fineGranted = results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;
        const coarseGranted = results[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;

        return fineGranted || coarseGranted;
      } catch (err) {
        console.error('Location permission request error:', err);
        return false;
      }
    }
    return true;
  }

  async checkLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const fineGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (fineGranted) return true;

        const coarseGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
        );
        return coarseGranted;
      } catch (err) {
        console.error('Location permission check error:', err);
        return false;
      }
    }
    return true;
  }

  /**
   * Get the current GPS position with high accuracy first, falling back to network/cell location if needed.
   */
  async getCurrentLocation(): Promise<LocationData> {
    const hasPermission = await this.checkLocationPermission();
    if (!hasPermission) {
      const granted = await this.requestLocationPermission();
      if (!granted) {
        throw new Error('Location permission denied. Please grant location access in device settings.');
      }
    }

    // Try high accuracy (Play Services / GPS) first
    try {
      return await this.fetchPosition({
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 10000,
      });
    } catch (highAccuracyError) {
      console.warn('High accuracy location failed, trying standard accuracy fallback:', highAccuracyError);
      // Fallback to standard/network accuracy
      try {
        return await this.fetchPosition({
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000,
        });
      } catch (fallbackError) {
        console.error('All location attempts failed:', fallbackError);
        throw new Error('Unable to retrieve GPS coordinates. Please ensure Location is enabled in phone settings.');
      }
    }
  }

  private fetchPosition(options: { enableHighAccuracy: boolean; timeout: number; maximumAge: number }): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          reject(error);
        },
        options
      );
    });
  }

  /**
   * Reverse geocode coordinates to human-readable address.
   * Uses OpenStreetMap Nominatim with fallback to BigDataCloud.
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<AddressComponents> {
    // 1. Try OpenStreetMap Nominatim (rich street & neighborhood data)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'EloraMobileApp/1.0 (contact@elora.com)',
            'Accept-Language': 'en',
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.address) {
          const addr = data.address;
          const street = [addr.house_number, addr.road || addr.street || addr.pedestrian || addr.footway]
            .filter(Boolean)
            .join(' ');
          const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || '';
          const state = addr.state || addr.region || '';
          const country = addr.country || '';
          const postalCode = addr.postcode || '';
          const placeName = addr.amenity || addr.shop || addr.building || addr.office || '';

          const formattedParts = [placeName, street, city, state, postalCode, country].filter(Boolean);
          const formattedAddress = data.display_name || formattedParts.join(', ');

          return {
            placeName,
            street,
            city,
            state,
            country,
            postalCode,
            formattedAddress,
          };
        }
      }
    } catch (osmError) {
      console.warn('OSM reverse geocode error, trying BigDataCloud fallback:', osmError);
    }

    // 2. Fallback to BigDataCloud API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const street = data.locality || data.localityInfo?.administrative?.[3]?.name || '';
        const city = data.city || data.localityInfo?.administrative?.[2]?.name || '';
        const state = data.principalSubdivision || data.localityInfo?.administrative?.[1]?.name || '';
        const country = data.countryName || data.localityInfo?.administrative?.[0]?.name || '';
        const postalCode = data.postcode || '';

        const formattedAddress = this.buildFormattedAddress({
          street,
          city,
          state,
          country,
          postalCode,
        }) || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

        return {
          street,
          city,
          state,
          country,
          postalCode,
          formattedAddress,
        };
      }
    } catch (bdcError) {
      console.warn('BigDataCloud reverse geocode error:', bdcError);
    }

    // 3. Fallback to raw formatted coordinates
    return {
      formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
    };
  }

  /**
   * Build formatted address string from individual components
   */
  private buildFormattedAddress(components: AddressComponents): string {
    const parts: string[] = [];
    if (components.placeName) parts.push(components.placeName);
    if (components.street) parts.push(components.street);
    if (components.city) parts.push(components.city);
    if (components.state) parts.push(components.state);
    if (components.postalCode) parts.push(components.postalCode);
    if (components.country) parts.push(components.country);
    return parts.filter(p => p && p.trim().length > 0).join(', ');
  }

  /**
   * Generate a reliable static map URL for embedding in photos without requiring paid API keys.
   */
  getStaticMapUrl(latitude: number, longitude: number, size: number = 80, zoom: number = 15): string {
    // Yandex Static Maps provides free, reliable static map tiles with markers
    const s = Math.min(Math.max(size, 60), 300);
    return `https://static-maps.yandex.ru/1.x/?ll=${longitude.toFixed(6)},${latitude.toFixed(6)}&z=${zoom}&l=map&size=${s},${s}&pt=${longitude.toFixed(6)},${latitude.toFixed(6)},pm2rdm`;
  }

  async getLocationForImageEmbedding(): Promise<{
    location: LocationData;
    address: AddressComponents;
    mapUrl: string;
  }> {
    const location = await this.getCurrentLocation();
    const address = await this.reverseGeocode(location.latitude, location.longitude);
    const mapUrl = this.getStaticMapUrl(location.latitude, location.longitude, 120, 15);

    return {
      location,
      address,
      mapUrl,
    };
  }

  /**
   * Format location data for display
   */
  formatLocationForDisplay(location: LocationData, address: AddressComponents): {
    coordinates: string;
    address: string;
    timestamp: string;
  } {
    return {
      coordinates: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
      address: address.formattedAddress || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
      timestamp: new Date(location.timestamp || Date.now()).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    };
  }
}

export const locationService = new LocationService();