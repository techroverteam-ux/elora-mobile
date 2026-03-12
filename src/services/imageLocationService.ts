import { Canvas, createCanvas, loadImage } from 'react-native-canvas';
import { locationService, LocationData, AddressComponents, LocationOverlayConfig } from './locationService';

export interface LocationOverlayData {
  location: LocationData;
  address: AddressComponents;
  mapUrl: string;
  timestamp: string;
}

class ImageLocationService {
  private defaultConfig: LocationOverlayConfig = {
    enabled: true,
    mapSize: 60,
    showAddress: true,
    showCoordinates: true,
    showTimestamp: true,
    position: 'bottom-left',
  };

  /**
   * Add GPS location overlay to an image
   */
  async addLocationOverlay(
    imageUri: string,
    locationData: LocationOverlayData,
    config: Partial<LocationOverlayConfig> = {}
  ): Promise<string> {
    const overlayConfig = { ...this.defaultConfig, ...config };
    
    if (!overlayConfig.enabled) {
      return imageUri;
    }

    try {
      // Create canvas and load the original image
      const canvas = createCanvas(800, 600); // Will be resized based on image
      const ctx = canvas.getContext('2d');
      
      // Load the original image
      const originalImage = await loadImage(imageUri);
      const imageWidth = originalImage.width;
      const imageHeight = originalImage.height;
      
      // Resize canvas to match image
      canvas.width = imageWidth;
      canvas.height = imageHeight;
      
      // Draw the original image
      ctx.drawImage(originalImage, 0, 0, imageWidth, imageHeight);
      
      // Load and draw the map
      const mapImage = await loadImage(locationData.mapUrl);
      const mapSize = overlayConfig.mapSize;
      
      // Calculate overlay position
      const { x: mapX, y: mapY } = this.calculateOverlayPosition(
        overlayConfig.position,
        imageWidth,
        imageHeight,
        mapSize
      );
      
      // Draw map with border
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(mapX - 2, mapY - 2, mapSize + 4, mapSize + 4);
      ctx.drawImage(mapImage, mapX, mapY, mapSize, mapSize);
      
      // Draw border around map
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      ctx.strokeRect(mapX - 1, mapY - 1, mapSize + 2, mapSize + 2);
      
      // Prepare text information
      const textLines = this.prepareTextLines(locationData, overlayConfig);
      const textBoxWidth = 200;
      const textBoxHeight = textLines.length * 16 + 10;
      
      // Calculate text box position (next to or below map)
      const { x: textX, y: textY } = this.calculateTextBoxPosition(
        overlayConfig.position,
        mapX,
        mapY,
        mapSize,
        textBoxWidth,
        textBoxHeight,
        imageWidth,
        imageHeight
      );
      
      // Draw text background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(textX, textY, textBoxWidth, textBoxHeight);
      
      // Draw text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      textLines.forEach((line, index) => {
        ctx.fillText(line, textX + 5, textY + 15 + (index * 16));
      });
      
      // Convert canvas to data URL
      return canvas.toDataURL('image/jpeg', 0.9);
    } catch (error) {
      console.error('Error adding location overlay:', error);
      return imageUri; // Return original image if overlay fails
    }
  }

  /**
   * Calculate overlay position based on configuration
   */
  private calculateOverlayPosition(
    position: string,
    imageWidth: number,
    imageHeight: number,
    mapSize: number
  ): { x: number; y: number } {
    const margin = 10;
    
    switch (position) {
      case 'top-left':
        return { x: margin, y: margin };
      case 'top-right':
        return { x: imageWidth - mapSize - margin, y: margin };
      case 'bottom-right':
        return { x: imageWidth - mapSize - margin, y: imageHeight - mapSize - margin };
      case 'bottom-left':
      default:
        return { x: margin, y: imageHeight - mapSize - margin };
    }
  }

  /**
   * Calculate text box position relative to map
   */
  private calculateTextBoxPosition(
    position: string,
    mapX: number,
    mapY: number,
    mapSize: number,
    textBoxWidth: number,
    textBoxHeight: number,
    imageWidth: number,
    imageHeight: number
  ): { x: number; y: number } {
    const margin = 5;
    
    switch (position) {
      case 'top-left':
        // Text below map if space available, otherwise to the right
        if (mapY + mapSize + textBoxHeight + margin < imageHeight) {
          return { x: mapX, y: mapY + mapSize + margin };
        } else {
          return { x: mapX + mapSize + margin, y: mapY };
        }
      case 'top-right':
        // Text below map if space available, otherwise to the left
        if (mapY + mapSize + textBoxHeight + margin < imageHeight) {
          return { x: Math.max(0, mapX + mapSize - textBoxWidth), y: mapY + mapSize + margin };
        } else {
          return { x: Math.max(0, mapX - textBoxWidth - margin), y: mapY };
        }
      case 'bottom-right':
        // Text above map if space available, otherwise to the left
        if (mapY - textBoxHeight - margin > 0) {
          return { x: Math.max(0, mapX + mapSize - textBoxWidth), y: mapY - textBoxHeight - margin };
        } else {
          return { x: Math.max(0, mapX - textBoxWidth - margin), y: mapY };
        }
      case 'bottom-left':
      default:
        // Text above map if space available, otherwise to the right
        if (mapY - textBoxHeight - margin > 0) {
          return { x: mapX, y: mapY - textBoxHeight - margin };
        } else {
          return { x: mapX + mapSize + margin, y: mapY };
        }
    }
  }

  /**
   * Prepare text lines for display
   */
  private prepareTextLines(
    locationData: LocationOverlayData,
    config: LocationOverlayConfig
  ): string[] {
    const lines: string[] = [];
    
    if (config.showCoordinates) {
      lines.push(`${locationData.location.latitude.toFixed(6)}`);
      lines.push(`${locationData.location.longitude.toFixed(6)}`);
    }
    
    if (config.showAddress && locationData.address.formattedAddress) {
      const address = locationData.address.formattedAddress;
      // Split long addresses into multiple lines
      if (address.length > 25) {
        const words = address.split(' ');
        let currentLine = '';
        words.forEach(word => {
          if ((currentLine + word).length > 25) {
            if (currentLine) lines.push(currentLine.trim());
            currentLine = word + ' ';
          } else {
            currentLine += word + ' ';
          }
        });
        if (currentLine) lines.push(currentLine.trim());
      } else {
        lines.push(address);
      }
    }
    
    if (config.showTimestamp) {
      lines.push(locationData.timestamp);
    }
    
    return lines;
  }

  /**
   * Get location data and create overlay
   */
  async getLocationDataForOverlay(): Promise<LocationOverlayData> {
    const { location, address, mapUrl } = await locationService.getLocationForImageEmbedding();
    const formatted = locationService.formatLocationForDisplay(location, address);
    
    return {
      location,
      address,
      mapUrl,
      timestamp: formatted.timestamp,
    };
  }

  /**
   * Process image with location overlay (main function)
   */
  async processImageWithLocation(
    imageUri: string,
    clientConfig?: Partial<LocationOverlayConfig>
  ): Promise<{
    processedImageUri: string;
    locationData: LocationOverlayData;
  }> {
    try {
      // Check location permissions
      const hasPermission = await locationService.checkLocationPermission();
      if (!hasPermission) {
        const granted = await locationService.requestLocationPermission();
        if (!granted) {
          throw new Error('Location permission denied');
        }
      }

      // Get location data
      const locationData = await this.getLocationDataForOverlay();
      
      // Add overlay to image
      const processedImageUri = await this.addLocationOverlay(
        imageUri,
        locationData,
        clientConfig
      );

      return {
        processedImageUri,
        locationData,
      };
    } catch (error) {
      console.error('Error processing image with location:', error);
      // Return original image if processing fails
      const locationData = await this.getLocationDataForOverlay();
      return {
        processedImageUri: imageUri,
        locationData,
      };
    }
  }
}

export const imageLocationService = new ImageLocationService();