import { PermissionsAndroid, Platform } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
}

export interface AddressComponents {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
}

class LocationService {
  async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true;
  }

  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      // Mock location for now - replace with actual implementation
      setTimeout(() => {
        resolve({
          latitude: 28.6139,
          longitude: 77.2090,
          accuracy: 10,
        });
      }, 1000);
    });
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<AddressComponents> {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const data = await response.json();
      
      return {
        street: data.locality || '',
        city: data.city || '',
        state: data.principalSubdivision || '',
        country: data.countryName || '',
        postalCode: data.postcode || '',
        formattedAddress: data.display_name || `${latitude}, ${longitude}`
      };
    } catch (error) {
      return {
        formattedAddress: `${latitude}, ${longitude}`
      };
    }
  }

  async getStoreImageFromMaps(latitude: number, longitude: number): Promise<string> {
    return `https://maps.googleapis.com/maps/api/streetview?size=400x300&location=${latitude},${longitude}&key=YOUR_API_KEY`;
  }
}

export const locationService = new LocationService();