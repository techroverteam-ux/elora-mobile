import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LocationOverlayData, LocationOverlayConfig } from '../services/imageLocationOverlay';

interface LocationOverlayProps {
  locationData: LocationOverlayData;
  config: LocationOverlayConfig;
  imageWidth: number;
  imageHeight: number;
  mapImageUri?: string;
}

export default function LocationOverlay({
  locationData,
  config,
  imageWidth,
  imageHeight,
  mapImageUri,
}: LocationOverlayProps) {
  const { mapSize, position, showAddress, showCoordinates, showTimestamp } = config;
  const margin = 10;

  // Calculate position with proper alignment
  const getPosition = () => {
    const mapWidth = mapSize + 160; // Account for text width
    switch (position) {
      case 'top-left':
        return { left: margin, top: margin };
      case 'top-right':
        return { right: margin, top: margin };
      case 'bottom-right':
        return { right: margin, bottom: margin + 20 }; // Add extra margin for better visibility
      case 'bottom-left':
      default:
        return { left: margin, bottom: margin + 20 }; // Add extra margin for better visibility
    }
  };

  const overlayPosition = getPosition();

  // Prepare text content
  const textLines: string[] = [];
  if (showCoordinates) {
    textLines.push(locationData.coordinates);
  }
  if (showAddress && locationData.address.formattedAddress) {
    const address = locationData.address.formattedAddress;
    if (address.length > 25) {
      // Split long addresses
      const parts = address.split(',');
      parts.forEach(part => {
        const trimmed = part.trim();
        if (trimmed.length > 0) {
          textLines.push(trimmed.length > 25 ? trimmed.substring(0, 22) + '...' : trimmed);
        }
      });
    } else {
      textLines.push(address);
    }
  }
  if (showTimestamp) {
    const shortTimestamp = new Date(locationData.location.timestamp || Date.now())
      .toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    textLines.push(shortTimestamp);
  }

  return (
    <View style={[styles.container, overlayPosition]}>
      {/* Map Container */}
      <View style={[styles.mapContainer, { width: mapSize, height: mapSize }]}>
        {mapImageUri ? (
          <Image
            source={{ uri: mapImageUri }}
            style={styles.mapImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapIcon}>📍</Text>
          </View>
        )}
      </View>

      {/* Text Information */}
      <View style={styles.textContainer}>
        {textLines.map((line, index) => (
          <Text key={index} style={styles.textLine} numberOfLines={1}>
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: 280,
    zIndex: 1000, // Ensure overlay appears on top
  },
  mapContainer: {
    backgroundColor: 'transparent', // Remove background
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
    marginRight: 8,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent', // Remove background
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  mapIcon: {
    fontSize: 24,
  },
  textContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Reduce opacity
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 160,
    maxWidth: 200,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textLine: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
    fontFamily: 'System',
  },
});