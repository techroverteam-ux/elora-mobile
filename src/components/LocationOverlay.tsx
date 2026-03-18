import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LocationOverlayData, LocationOverlayConfig } from '../services/imageLocationOverlay';
import { addressVerificationService, AddressVerification } from '../services/addressVerificationService';

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
  const [addressVerification, setAddressVerification] = useState<AddressVerification | null>(null);
  const margin = 10;

  // Verify address on component mount
  useEffect(() => {
    if (showAddress && locationData.location.latitude && locationData.location.longitude) {
      addressVerificationService
        .verifyAddress(locationData.location.latitude, locationData.location.longitude)
        .then(setAddressVerification)
        .catch(error => {
          console.warn('Address verification failed:', error);
          setAddressVerification(null);
        });
    }
  }, [locationData.location.latitude, locationData.location.longitude, showAddress]);

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

  // Prepare text content with enhanced address verification
  const textLines: string[] = [];
  
  // Always show coordinates first for technical reference
  if (showCoordinates) {
    textLines.push(`📍 ${locationData.coordinates}`);
  }
  
  // Show verified address as proof of location
  if (showAddress) {
    if (addressVerification) {
      const addressDisplay = addressVerificationService.formatAddressForDisplay(addressVerification);
      
      // Add verification status header
      const statusIcon = addressVerification.isVerified ? '✅' : '⚠️';
      const confidencePercent = Math.round(addressVerification.confidence * 100);
      textLines.push(`${statusIcon} ${addressDisplay.verificationStatus} (${confidencePercent}%)`);
      
      // Add primary address
      const address = addressDisplay.primaryLine;
      if (address.length > 30) {
        const parts = address.split(',');
        parts.forEach(part => {
          const trimmed = part.trim();
          if (trimmed.length > 0) {
            if (trimmed.length > 28) {
              const words = trimmed.split(' ');
              let currentLine = '';
              words.forEach(word => {
                if ((currentLine + word).length > 28) {
                  if (currentLine) textLines.push(currentLine.trim());
                  currentLine = word + ' ';
                } else {
                  currentLine += word + ' ';
                }
              });
              if (currentLine) textLines.push(currentLine.trim());
            } else {
              textLines.push(trimmed);
            }
          }
        });
      } else {
        textLines.push(address);
      }
      
      // Add verification sources
      if (addressVerification.sources.length > 0) {
        textLines.push(`📊 Sources: ${addressVerification.sources.join(', ')}`);
      }
      
      // Add nearby landmarks for additional proof
      if (addressVerification.nearbyLandmarks && addressVerification.nearbyLandmarks.length > 0) {
        textLines.push(`🏢 Near: ${addressVerification.nearbyLandmarks.slice(0, 2).join(', ')}`);
      }
      
    } else if (locationData.address.formattedAddress) {
      // Fallback to basic address if verification is not available
      textLines.push('📍 ADDRESS:');
      const address = locationData.address.formattedAddress;
      
      if (address.length > 30) {
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
  }
  
  // Show timestamp for verification
  if (showTimestamp) {
    const shortTimestamp = new Date(locationData.location.timestamp || Date.now())
      .toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    textLines.push(`🕒 ${shortTimestamp}`);
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Darker background for better readability
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 180,
    maxWidth: 220, // Increased width for longer addresses
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textLine: {
    color: '#FFFFFF',
    fontSize: 10, // Slightly smaller to fit more text
    fontWeight: '500',
    marginBottom: 1,
    fontFamily: 'System',
    lineHeight: 12,
  },
});