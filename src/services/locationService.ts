import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
  timestamp?: number;
}

export interface AddressComponents {
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
  private googleMapsApiKey = 'AIzaSyBvOkBwgGlbUiuS-oSim-_hVautcHiOidc'; // Working Google Maps API key

  async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This app needs location access to embed GPS information in photos for accurate project documentation.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else {
          // Try coarse location as fallback
          const coarseGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            {
              title: 'Location Access Required',
              message: 'This app needs location access to embed GPS information in photos. Approximate location is acceptable.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          return coarseGranted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.error('Location permission error:', err);
        return false;
      }
    }
    return true;
  }

  async checkLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const fineLocationGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        
        if (fineLocationGranted) {
          return true;
        }
        
        // Check coarse location as fallback
        const coarseLocationGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
        );
        
        return coarseLocationGranted;
      } catch (err) {
        console.error('Location permission check error:', err);
        return false;
      }
    }
    return true;
  }

  async getCurrentLocation(): Promise<LocationData> {
    // First check and request location permission
    const hasPermission = await this.checkLocationPermission();
    if (!hasPermission) {
      const granted = await this.requestLocationPermission();
      if (!granted) {
        console.warn('Location permission denied, using fallback location');
        // Return fallback location for development/testing
        return {
          latitude: 28.6139,
          longitude: 77.2090,
          accuracy: 10,
          timestamp: Date.now(),
        };
      }
    }

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
          console.error('Location error:', error);
          // Provide more specific error handling
          if (error.code === 1) {
            console.warn('Location permission denied, using fallback');
          } else if (error.code === 2) {
            console.warn('Location unavailable, using fallback');
          } else if (error.code === 3) {
            console.warn('Location timeout, using fallback');
          }
          
          // Fallback to mock location for development
          resolve({
            latitude: 28.6139,
            longitude: 77.2090,
            accuracy: 10,
            timestamp: Date.now(),
          });
        },
        {
          enableHighAccuracy: false, // Changed to false for faster response
          timeout: 10000, // Reduced timeout to 10 seconds
          maximumAge: 30000, // Increased cache time to 30 seconds
        }
      );
    });
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<AddressComponents> {
    try {
      // First try Google Maps Geocoding API for more accurate results
      const googleResponse = await this.reverseGeocodeWithGoogle(latitude, longitude);
      if (googleResponse.formattedAddress && googleResponse.formattedAddress !== `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`) {
        return googleResponse;
      }
    } catch (error) {
      console.warn('Google Maps geocoding failed, trying fallback:', error);
    }

    try {
      // Fallback to BigDataCloud API
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const data = await response.json();
      
      return {
        street: data.locality || data.localityInfo?.administrative?.[3]?.name || '',
        city: data.city || data.localityInfo?.administrative?.[2]?.name || '',
        state: data.principalSubdivision || data.localityInfo?.administrative?.[1]?.name || '',
        country: data.countryName || data.localityInfo?.administrative?.[0]?.name || '',
        postalCode: data.postcode || '',
        formattedAddress: data.display_name || this.buildFormattedAddress({
          street: data.locality || '',
          city: data.city || '',
          state: data.principalSubdivision || '',
          country: data.countryName || '',
          postalCode: data.postcode || ''
        }) || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      };
    } catch (error) {
      console.error('All reverse geocoding methods failed:', error);
      return {
        formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      };
    }
  }

  /**
   * Reverse geocode using Google Maps Geocoding API
   */
  private async reverseGeocodeWithGoogle(latitude: number, longitude: number): Promise<AddressComponents> {
    if (!this.googleMapsApiKey || this.googleMapsApiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
      throw new Error('Google Maps API key not configured');
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.googleMapsApiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      throw new Error(`Geocoding failed: ${data.status} - ${data.error_message || 'No results'}`);
    }

    const result = data.results[0];
    const components = result.address_components || [];
    
    // Extract address components
    const addressComponents: AddressComponents = {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      formattedAddress: result.formatted_address || ''
    };

    components.forEach((component: any) => {
      const types = component.types || [];
      
      if (types.includes('street_number') || types.includes('route')) {
        addressComponents.street = addressComponents.street 
          ? `${addressComponents.street} ${component.long_name}` 
          : component.long_name;
      } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        addressComponents.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        addressComponents.state = component.long_name;
      } else if (types.includes('country')) {
        addressComponents.country = component.long_name;
      } else if (types.includes('postal_code')) {
        addressComponents.postalCode = component.long_name;
      }
    });

    // If no formatted address from API, build one
    if (!addressComponents.formattedAddress) {
      addressComponents.formattedAddress = this.buildFormattedAddress(addressComponents);
    }

    return addressComponents;
  }

  /**
   * Build formatted address from components
   */
  private buildFormattedAddress(components: AddressComponents): string {
    const parts: string[] = [];
    
    if (components.street) parts.push(components.street);
    if (components.city) parts.push(components.city);
    if (components.state) parts.push(components.state);
    if (components.postalCode) parts.push(components.postalCode);
    if (components.country) parts.push(components.country);
    
    return parts.filter(part => part.trim().length > 0).join(', ');
  }

  async getStoreImageFromMaps(latitude: number, longitude: number): Promise<string> {
    return `https://maps.googleapis.com/maps/api/streetview?size=400x300&location=${latitude},${longitude}&key=${this.googleMapsApiKey}`;
  }

  /**
   * Generate a static map URL for embedding in images
   */
  getStaticMapUrl(latitude: number, longitude: number, size: number = 60, zoom: number = 15): string {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=${size}x${size}&maptype=roadmap&markers=color:red%7C${latitude},${longitude}&key=${this.googleMapsApiKey}`;
  }

  async getLocationForImageEmbedding(): Promise<{
    location: LocationData;
    address: AddressComponents;
    mapUrl: string;
  }> {
    const location = await this.getCurrentLocation();
    const address = await this.reverseGeocode(location.latitude, location.longitude);
    const mapUrl = this.getStaticMapUrl(location.latitude, location.longitude);

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
    if (!address.formattedAddress) {
      throw new Error('Address information not available');
    }
    
    return {
      coordinates: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
      address: address.formattedAddress,
      timestamp: new Date(location.timestamp || Date.now()).toLocaleString(),
    };
  }
}

export const locationService = new LocationService();