import { PermissionsAndroid, Platform, Alert, Linking, AppState } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// Configure Geolocation safely for Android and iOS
try {
  Geolocation.setRNConfiguration({
    skipPermissionRequests: true, // Manage permissions via PermissionsAndroid to avoid bridge collisions
    authorizationLevel: 'whenInUse',
    locationProvider: 'android', // Use stable Android LocationManager to eliminate PlayServices callback crashes
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
  district?: string;
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

/** Why a location request failed in a way the user can fix. */
export type LocationIssue = 'LOCATION_OFF' | 'PERMISSION_DENIED';

const makeLocationError = (code: LocationIssue, message: string) => {
  const err: any = new Error(message);
  err.code = code;
  return err;
};

/** LOCATION_OFF / PERMISSION_DENIED if the error is one the user can fix, else null. */
export const getLocationIssue = (err: any): LocationIssue | null => {
  if (err?.code === 'LOCATION_OFF' || err?.code === 'PERMISSION_DENIED') return err.code;
  return null;
};

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

  async checkFineLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        return await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
      } catch (err) {
        console.error('Fine location permission check error:', err);
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
        throw makeLocationError('PERMISSION_DENIED', 'Location permission denied. Please grant location access in device settings.');
      }
    }

    // Android 12+ Security check: only request high accuracy (GPS) if FINE location is granted
    const hasFinePermission = await this.checkFineLocationPermission();

    if (hasFinePermission) {
      // Try high accuracy (GPS) first
      try {
        return await this.fetchPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 10000,
        });
      } catch (highAccuracyError) {
        console.warn('High accuracy location failed or timed out, trying standard accuracy fallback:', highAccuracyError);
      }
    }

    // Fallback to standard/network accuracy (safe for coarse-only permissions too)
    try {
      return await this.fetchPosition({
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 60000,
      });
    } catch (fallbackError: any) {
      console.error('All location attempts failed:', fallbackError);
      // @react-native-community/geolocation reports "location switched off" as
      // POSITION_UNAVAILABLE (code 2) with "No location provider available"
      // (Android) — it never shows the system "Turn on location" dialog itself.
      const msg = String(fallbackError?.message || '');
      if (fallbackError?.code === 1) {
        throw makeLocationError('PERMISSION_DENIED', 'Location permission denied. Please grant location access in settings.');
      }
      if (/no location provider|location not available|disabled/i.test(msg) || (Platform.OS === 'ios' && fallbackError?.code === 2)) {
        throw makeLocationError('LOCATION_OFF', 'Location (GPS) is turned off. Please turn it on.');
      }
      throw new Error('Unable to retrieve GPS coordinates. Please ensure Location (GPS) is turned ON in your phone settings.');
    }
  }

  /**
   * Ask the user to turn on location (or grant permission) and send them to the
   * right settings screen. Resolves true once they come back to the app after
   * tapping "Turn on", false if they cancel.
   */
  promptToEnableLocation(issue: LocationIssue, purpose = 'This needs your current GPS location.'): Promise<boolean> {
    const isOff = issue === 'LOCATION_OFF';
    return new Promise((resolve) => {
      Alert.alert(
        isOff ? 'Turn on Location' : 'Allow Location Access',
        isOff
          ? `${purpose} Your phone's Location (GPS) is off. Turn it on, then come back to the app.`
          : `${purpose} Please allow location access for this app in Settings, then come back.`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          {
            text: isOff ? 'Turn on' : 'Open Settings',
            onPress: async () => {
              // Wait for the user to return from Settings before retrying.
              let sub: any;
              const done = () => { sub?.remove(); resolve(true); };
              sub = AppState.addEventListener('change', (state) => { if (state === 'active') done(); });
              try {
                if (isOff && Platform.OS === 'android') {
                  await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
                } else {
                  await Linking.openSettings();
                }
              } catch (e) {
                console.warn('Could not open location settings:', e);
                sub?.remove();
                resolve(false);
              }
            },
          },
        ],
        { cancelable: false }
      );
    });
  }

  /**
   * getCurrentLocation(), but if location is off / permission denied, prompt
   * the user to fix it and retry once. Still throws if they cancel.
   */
  async getCurrentLocationWithPrompt(purpose?: string): Promise<LocationData> {
    try {
      return await this.getCurrentLocation();
    } catch (err) {
      const issue = getLocationIssue(err);
      if (!issue) throw err;
      const fixed = await this.promptToEnableLocation(issue, purpose);
      if (!fixed) throw err;
      // Give the GPS provider a moment to come up after being switched on.
      await new Promise((r) => setTimeout(r, 800));
      return await this.getCurrentLocation();
    }
  }

  private fetchPosition(options: { enableHighAccuracy: boolean; timeout: number; maximumAge: number }): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      let isSettled = false;

      // Safety timeout guard in JS to prevent hanging or duplicate callback resolution
      const timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          reject(new Error(`Location request timed out after ${options.timeout}ms`));
        }
      }, options.timeout + 1500);

      try {
        Geolocation.getCurrentPosition(
          (position) => {
            if (!isSettled) {
              isSettled = true;
              clearTimeout(timer);
              if (position && position.coords) {
                resolve({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                  timestamp: position.timestamp,
                });
              } else {
                reject(new Error('Invalid location coordinates returned by device'));
              }
            }
          },
          (error) => {
            if (!isSettled) {
              isSettled = true;
              clearTimeout(timer);
              reject(error || new Error('Failed to acquire location'));
            }
          },
          options
        );
      } catch (err) {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          reject(err);
        }
      }
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
          const district = addr.state_district || addr.county || '';
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
            district,
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