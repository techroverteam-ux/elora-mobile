import { locationService, LocationData, AddressComponents } from './locationService';
import { Dimensions } from 'react-native';
import RNFS from 'react-native-fs';

export interface LocationOverlayConfig {
  enabled: boolean;
  mapSize: number;
  showAddress: boolean;
  showCoordinates: boolean;
  showTimestamp: boolean;
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

export interface LocationOverlayData {
  location: LocationData;
  address: AddressComponents;
  mapUrl: string;
  timestamp: string;
  coordinates: string;
}

class ImageLocationOverlay {
  private defaultConfig: LocationOverlayConfig = {
    enabled: true,
    mapSize: 80,
    showAddress: true,
    showCoordinates: true,
    showTimestamp: true,
    position: 'bottom-left',
  };

  async getLocationDataForOverlay(): Promise<LocationOverlayData> {
    try {
      const { location, address, mapUrl } = await locationService.getLocationForImageEmbedding();
      const formatted = locationService.formatLocationForDisplay(location, address);
      
      return {
        location,
        address,
        mapUrl,
        timestamp: formatted.timestamp,
        coordinates: formatted.coordinates,
      };
    } catch (error) {
      return {
        location: { latitude: 0, longitude: 0, timestamp: Date.now() },
        address: { formattedAddress: 'Location unavailable' },
        mapUrl: '',
        timestamp: new Date().toLocaleString(),
        coordinates: '0.000000, 0.000000',
      };
    }
  }

  async shouldEnableLocationOverlay(clientId?: string): Promise<boolean> {
    // For recce photos, always enable location overlay
    if (!clientId) return true;
    
    try {
      const { clientService } = await import('./clientService');
      const config = await clientService.getLocationConfig(clientId);
      return config.enableLocationOverlay;
    } catch (error) {
      // Default to enabled for recce photos
      return true;
    }
  }

  async getClientLocationConfig(clientId?: string): Promise<Partial<LocationOverlayConfig>> {
    if (!clientId) return {};
    
    try {
      const { clientService } = await import('./clientService');
      const config = await clientService.getLocationConfig(clientId);
      
      return {
        enabled: config.enableLocationOverlay,
        mapSize: config.mapSize || this.defaultConfig.mapSize,
        showAddress: config.showAddress ?? this.defaultConfig.showAddress,
        showCoordinates: config.showCoordinates ?? this.defaultConfig.showCoordinates,
        showTimestamp: config.showTimestamp ?? this.defaultConfig.showTimestamp,
        position: config.position || this.defaultConfig.position,
      };
    } catch (error) {
      return {};
    }
  }

  /**
   * Generate SVG overlay for location information
   */
  generateLocationOverlaySVG(
    locationData: LocationOverlayData,
    config: LocationOverlayConfig,
    imageWidth: number,
    imageHeight: number
  ): string {
    const { mapSize, position, showAddress, showCoordinates, showTimestamp } = config;
    const margin = 10;
    
    // Calculate position
    let x = margin;
    let y = imageHeight - mapSize - margin;
    
    switch (position) {
      case 'top-left':
        x = margin;
        y = margin;
        break;
      case 'top-right':
        x = imageWidth - mapSize - margin - 200; // Account for text width
        y = margin;
        break;
      case 'bottom-right':
        x = imageWidth - mapSize - margin - 200;
        y = imageHeight - mapSize - margin;
        break;
      case 'bottom-left':
      default:
        x = margin;
        y = imageHeight - mapSize - margin;
        break;
    }

    // Prepare text lines
    const textLines: string[] = [];
    if (showCoordinates) {
      textLines.push(locationData.coordinates);
    }
    if (showAddress && locationData.address.formattedAddress) {
      const address = locationData.address.formattedAddress;
      if (address.length > 30) {
        // Split long addresses
        const parts = address.split(',');
        parts.forEach(part => {
          if (part.trim().length > 0) {
            textLines.push(part.trim());
          }
        });
      } else {
        textLines.push(address);
      }
    }
    if (showTimestamp) {
      textLines.push(locationData.timestamp);
    }

    const textBoxHeight = textLines.length * 16 + 10;
    const textBoxWidth = 200;
    
    // Adjust text position based on map position
    let textX = x + mapSize + 5;
    let textY = y;
    
    // If text would go off screen, position it differently
    if (textX + textBoxWidth > imageWidth) {
      textX = x - textBoxWidth - 5;
    }
    if (textX < 0) {
      textX = x;
      textY = y - textBoxHeight - 5;
    }

    return `
      <svg width="${imageWidth}" height="${imageHeight}" xmlns="http://www.w3.org/2000/svg">
        <!-- Map placeholder (would be replaced with actual map image) -->
        <rect x="${x}" y="${y}" width="${mapSize}" height="${mapSize}" 
              fill="rgba(255,255,255,0.9)" stroke="#333" stroke-width="2" rx="4"/>
        <circle cx="${x + mapSize/2}" cy="${y + mapSize/2}" r="8" fill="#FF0000"/>
        <text x="${x + mapSize/2}" y="${y + mapSize/2 + 4}" text-anchor="middle" 
              font-family="Arial" font-size="10" fill="white">📍</text>
        
        <!-- Text background -->
        <rect x="${textX}" y="${textY}" width="${textBoxWidth}" height="${textBoxHeight}" 
              fill="rgba(0,0,0,0.8)" rx="4"/>
        
        <!-- Text content -->
        ${textLines.map((line, index) => 
          `<text x="${textX + 5}" y="${textY + 15 + (index * 16)}" 
                 font-family="Arial" font-size="12" fill="white">${line}</text>`
        ).join('')}
      </svg>
    `;
  }

  /**
   * Create location overlay data for ViewShot
   */
  createLocationOverlayComponent(
    locationData: LocationOverlayData,
    config: LocationOverlayConfig,
    imageWidth: number,
    imageHeight: number
  ) {
    const { mapSize, position } = config;
    const margin = 10;
    
    // Calculate position
    let mapX = margin;
    let mapY = imageHeight - mapSize - margin;
    
    switch (position) {
      case 'top-left':
        mapX = margin;
        mapY = margin;
        break;
      case 'top-right':
        mapX = imageWidth - mapSize - margin;
        mapY = margin;
        break;
      case 'bottom-right':
        mapX = imageWidth - mapSize - margin;
        mapY = imageHeight - mapSize - margin;
        break;
      case 'bottom-left':
      default:
        mapX = margin;
        mapY = imageHeight - mapSize - margin;
        break;
    }

    return {
      mapPosition: { x: mapX, y: mapY },
      mapSize,
      locationData,
      config,
    };
  }

  /**
   * Process image with location overlay with improved error handling
   */
  async processImageWithLocation(
    imageUri: string,
    clientId?: string,
    customConfig?: Partial<LocationOverlayConfig>
  ): Promise<{
    shouldAddOverlay: boolean;
    locationData?: LocationOverlayData;
    config?: LocationOverlayConfig;
  }> {
    try {
      const shouldEnable = await this.shouldEnableLocationOverlay(clientId);
      
      if (!shouldEnable) {
        return { shouldAddOverlay: false };
      }

      const hasPermission = await locationService.checkLocationPermission();
      if (!hasPermission) {
        const granted = await locationService.requestLocationPermission();
        if (!granted) {
          return { shouldAddOverlay: false };
        }
      }

      const clientConfig = await this.getClientLocationConfig(clientId);
      const config = { ...this.defaultConfig, ...clientConfig, ...customConfig };

      const locationData = await Promise.race([
        this.getLocationDataForOverlay(),
        new Promise<LocationOverlayData>((_, reject) => 
          setTimeout(() => reject(new Error('Location timeout')), 10000)
        )
      ]);

      return {
        shouldAddOverlay: true,
        locationData,
        config,
      };
    } catch (error) {
      return { shouldAddOverlay: false };
    }
  }

  /**
   * Download map image for overlay with retry logic
   */
  async downloadMapImage(mapUrl: string): Promise<string> {
    if (!mapUrl) {
      return '';
    }

    try {
      const fileName = `map_${Date.now()}.png`;
      const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
      
      const downloadResult = await RNFS.downloadFile({
        fromUrl: mapUrl,
        toFile: filePath,
        connectionTimeout: 10000,
        readTimeout: 15000,
      }).promise;

      if (downloadResult.statusCode === 200) {
        const fileExists = await RNFS.exists(filePath);
        if (fileExists) {
          const stat = await RNFS.stat(filePath);
          if (stat.size > 0) {
            return `file://${filePath}`;
          }
        }
        throw new Error('Downloaded file is empty or corrupted');
      } else {
        throw new Error(`HTTP ${downloadResult.statusCode}: Failed to download map image`);
      }
    } catch (error) {
      return '';
    }
  }

  async cleanupMapCache(): Promise<void> {
    try {
      const cacheDir = RNFS.CachesDirectoryPath;
      const files = await RNFS.readDir(cacheDir);
      
      const mapFiles = files.filter(file => file.name.startsWith('map_'));
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      for (const file of mapFiles) {
        if (file.mtime && new Date(file.mtime).getTime() < oneHourAgo) {
          await RNFS.unlink(file.path);
        }
      }
    } catch (error) {
      // Silently fail
    }
  }
}

export const imageLocationOverlay = new ImageLocationOverlay();