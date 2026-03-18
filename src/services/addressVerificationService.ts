import { locationService, AddressComponents } from './locationService';

export interface AddressVerification {
  isVerified: boolean;
  confidence: number;
  sources: string[];
  detailedAddress: {
    streetNumber?: string;
    streetName?: string;
    neighborhood?: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    formattedAddress: string;
  };
  nearbyLandmarks?: string[];
  addressType?: 'residential' | 'commercial' | 'industrial' | 'mixed' | 'unknown';
}

class AddressVerificationService {
  private googleMapsApiKey = 'AIzaSyBvOkBwgGlbUiuS-oSim-_hVautcHiOidc';

  /**
   * Verify and enhance address information from multiple sources
   */
  async verifyAddress(latitude: number, longitude: number): Promise<AddressVerification> {
    const sources: string[] = [];
    let bestAddress: AddressComponents | null = null;
    let confidence = 0;

    try {
      // Get address from primary location service
      const primaryAddress = await locationService.reverseGeocode(latitude, longitude);
      if (primaryAddress.formattedAddress) {
        bestAddress = primaryAddress;
        sources.push('Google Maps');
        confidence += 0.4;
      }
    } catch (error) {
      console.warn('Primary address lookup failed:', error);
    }

    try {
      // Get additional verification from OpenStreetMap Nominatim
      const osmAddress = await this.getAddressFromOSM(latitude, longitude);
      if (osmAddress) {
        sources.push('OpenStreetMap');
        confidence += 0.3;
        
        // Use OSM address if primary failed
        if (!bestAddress) {
          bestAddress = osmAddress;
        }
      }
    } catch (error) {
      console.warn('OSM address lookup failed:', error);
    }

    try {
      // Get nearby places for additional context
      const nearbyPlaces = await this.getNearbyPlaces(latitude, longitude);
      if (nearbyPlaces.length > 0) {
        sources.push('Places API');
        confidence += 0.2;
      }
    } catch (error) {
      console.warn('Nearby places lookup failed:', error);
    }

    // Final confidence adjustment
    if (sources.length >= 2) confidence += 0.1;

    return {
      isVerified: confidence > 0.5,
      confidence: Math.min(confidence, 1.0),
      sources,
      detailedAddress: this.buildDetailedAddress(bestAddress),
      nearbyLandmarks: await this.getNearbyLandmarks(latitude, longitude),
      addressType: await this.determineAddressType(latitude, longitude)
    };
  }

  /**
   * Get address from OpenStreetMap Nominatim (free alternative)
   */
  private async getAddressFromOSM(latitude: number, longitude: number): Promise<AddressComponents | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'TechRover-Mobile-App/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || !data.address) {
        return null;
      }

      const addr = data.address;
      return {
        street: `${addr.house_number || ''} ${addr.road || ''}`.trim(),
        city: addr.city || addr.town || addr.village || addr.municipality || '',
        state: addr.state || addr.province || '',
        country: addr.country || '',
        postalCode: addr.postcode || '',
        formattedAddress: data.display_name || ''
      };
    } catch (error) {
      console.error('OSM geocoding error:', error);
      return null;
    }
  }

  /**
   * Get nearby places for context
   */
  private async getNearbyPlaces(latitude: number, longitude: number): Promise<string[]> {
    try {
      if (!this.googleMapsApiKey || this.googleMapsApiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
        return [];
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=100&key=${this.googleMapsApiKey}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'OK' && data.results) {
        return data.results
          .slice(0, 3) // Top 3 nearby places
          .map((place: any) => place.name)
          .filter((name: string) => name && name.length > 0);
      }

      return [];
    } catch (error) {
      console.error('Nearby places error:', error);
      return [];
    }
  }

  /**
   * Get nearby landmarks for additional location proof
   */
  private async getNearbyLandmarks(latitude: number, longitude: number): Promise<string[]> {
    try {
      // Use Overpass API to get landmarks from OpenStreetMap
      const query = `
        [out:json][timeout:10];
        (
          node["amenity"~"^(hospital|school|university|bank|post_office|police|fire_station)$"](around:500,${latitude},${longitude});
          node["tourism"~"^(attraction|museum|monument)$"](around:500,${latitude},${longitude});
          node["shop"~"^(mall|supermarket)$"](around:500,${latitude},${longitude});
        );
        out body;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
        headers: {
          'Content-Type': 'text/plain'
        }
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      
      if (data.elements) {
        return data.elements
          .filter((element: any) => element.tags && element.tags.name)
          .slice(0, 3)
          .map((element: any) => element.tags.name);
      }

      return [];
    } catch (error) {
      console.warn('Landmarks lookup failed:', error);
      return [];
    }
  }

  /**
   * Determine address type based on nearby amenities
   */
  private async determineAddressType(latitude: number, longitude: number): Promise<'residential' | 'commercial' | 'industrial' | 'mixed' | 'unknown'> {
    try {
      if (!this.googleMapsApiKey || this.googleMapsApiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
        return 'unknown';
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=200&key=${this.googleMapsApiKey}`
      );

      if (!response.ok) {
        return 'unknown';
      }

      const data = await response.json();
      
      if (data.status === 'OK' && data.results) {
        const types = data.results.flatMap((place: any) => place.types || []);
        
        const commercialTypes = ['store', 'restaurant', 'bank', 'gas_station', 'shopping_mall'];
        const residentialTypes = ['lodging', 'real_estate_agency'];
        const industrialTypes = ['storage', 'moving_company'];
        
        const commercialCount = types.filter((type: string) => commercialTypes.includes(type)).length;
        const residentialCount = types.filter((type: string) => residentialTypes.includes(type)).length;
        const industrialCount = types.filter((type: string) => industrialTypes.includes(type)).length;
        
        if (commercialCount > residentialCount && commercialCount > industrialCount) {
          return 'commercial';
        } else if (residentialCount > commercialCount && residentialCount > industrialCount) {
          return 'residential';
        } else if (industrialCount > 0) {
          return 'industrial';
        } else if (commercialCount > 0 && residentialCount > 0) {
          return 'mixed';
        }
      }

      return 'unknown';
    } catch (error) {
      console.error('Address type determination error:', error);
      return 'unknown';
    }
  }

  /**
   * Build detailed address structure
   */
  private buildDetailedAddress(address: AddressComponents | null): AddressVerification['detailedAddress'] {
    if (!address) {
      return {
        city: 'Unknown',
        state: 'Unknown',
        country: 'Unknown',
        formattedAddress: 'Address unavailable'
      };
    }

    // Parse street into number and name if possible
    const streetParts = (address.street || '').split(' ');
    const streetNumber = streetParts.length > 0 && /^\d+/.test(streetParts[0]) ? streetParts[0] : undefined;
    const streetName = streetNumber ? streetParts.slice(1).join(' ') : address.street;

    return {
      streetNumber,
      streetName,
      city: address.city || 'Unknown',
      state: address.state || 'Unknown',
      country: address.country || 'Unknown',
      postalCode: address.postalCode,
      formattedAddress: address.formattedAddress || 'Address unavailable'
    };
  }

  /**
   * Format address for display with verification status
   */
  formatAddressForDisplay(verification: AddressVerification): {
    primaryLine: string;
    secondaryLines: string[];
    verificationStatus: string;
  } {
    const addr = verification.detailedAddress;
    const primaryLine = addr.formattedAddress;
    
    const secondaryLines: string[] = [];
    
    // Add verification info
    const confidencePercent = Math.round(verification.confidence * 100);
    secondaryLines.push(`✓ Verified ${confidencePercent}% (${verification.sources.join(', ')})`);
    
    // Add landmarks if available
    if (verification.nearbyLandmarks && verification.nearbyLandmarks.length > 0) {
      secondaryLines.push(`📍 Near: ${verification.nearbyLandmarks.join(', ')}`);
    }
    
    // Add address type
    if (verification.addressType && verification.addressType !== 'unknown') {
      secondaryLines.push(`🏢 Type: ${verification.addressType.charAt(0).toUpperCase() + verification.addressType.slice(1)}`);
    }

    return {
      primaryLine,
      secondaryLines,
      verificationStatus: verification.isVerified ? 'VERIFIED' : 'UNVERIFIED'
    };
  }
}

export const addressVerificationService = new AddressVerificationService();