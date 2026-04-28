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
  const { position } = config;
  const margin = 10;

  const getPosition = () => {
    switch (position) {
      case 'top-left':     return { left: margin, top: margin };
      case 'top-right':    return { right: margin, top: margin };
      case 'bottom-right': return { right: margin, bottom: margin };
      case 'bottom-left':
      default:             return { left: margin, bottom: margin };
    }
  };

  const { latitude, longitude } = locationData.location;
  const coords = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

  // Place / store name — from establishment result
  const placeName = locationData.address.placeName || '';

  // Full address lines — split by comma for clean display
  const rawAddress = locationData.address.formattedAddress || '';
  // Remove the place name from the start of the address if it's duplicated
  const cleanAddress = placeName && rawAddress.startsWith(placeName)
    ? rawAddress.slice(placeName.length).replace(/^[,\s]+/, '')
    : rawAddress;

  // Split into max 2 lines at natural comma boundaries
  const addressParts = cleanAddress.split(',').map(s => s.trim()).filter(Boolean);
  const addressLine1 = addressParts.slice(0, 2).join(', ');
  const addressLine2 = addressParts.slice(2).join(', ');

  const timestamp = new Date(locationData.location.timestamp || Date.now())
    .toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  return (
    <View style={[styles.card, getPosition()]}>

      {/* Left — map thumbnail */}
      <View style={styles.mapBox}>
        {mapImageUri ? (
          <Image source={{ uri: mapImageUri }} style={styles.mapImage} resizeMode="cover" />
        ) : (
          <View style={styles.mapFallback}>
            <View style={[styles.road, { top: '48%', left: 0, right: 0, height: 2 }]} />
            <View style={[styles.road, { left: '48%', top: 0, bottom: 0, width: 2 }]} />
            <View style={styles.pinWrap}>
              <View style={styles.pinHead} />
              <View style={styles.pinTail} />
            </View>
          </View>
        )}
        {/* Blue accuracy dot */}
        <View style={styles.accuracyRing}>
          <View style={styles.accuracyDot} />
        </View>
      </View>

      {/* Right — info */}
      <View style={styles.infoBox}>

        {/* Store / place name */}
        {placeName ? (
          <Text style={styles.placeName} numberOfLines={1}>{placeName}</Text>
        ) : null}

        {/* Address line 1 */}
        {addressLine1 ? (
          <Text style={styles.addressLine} numberOfLines={2}>{addressLine1}</Text>
        ) : null}

        {/* Address line 2 */}
        {addressLine2 ? (
          <Text style={styles.addressLine} numberOfLines={2}>{addressLine2}</Text>
        ) : null}

        {/* Coordinates */}
        <View style={styles.coordRow}>
          <View style={styles.redDot} />
          <Text style={styles.coordText}>{coords}</Text>
        </View>

        {/* Timestamp */}
        <Text style={styles.timestamp}>{timestamp}</Text>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 8,
    overflow: 'hidden',
    width: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  mapBox: {
    width: 100,
    backgroundColor: '#E8F5E9',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  road: {
    position: 'absolute',
    backgroundColor: '#BDBDBD',
  },
  pinWrap: {
    alignItems: 'center',
  },
  pinHead: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E53935',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinTail: {
    width: 2,
    height: 6,
    backgroundColor: '#E53935',
    marginTop: -1,
  },
  accuracyRing: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'rgba(66,133,244,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(66,133,244,0.1)',
  },
  accuracyDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#4285F4',
  },
  infoBox: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.07)',
  },
  placeName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 2,
  },
  addressLine: {
    fontSize: 11,
    color: '#3C4043',
    fontWeight: '400',
    lineHeight: 15,
  },
  coordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
  redDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E53935',
    marginRight: 5,
  },
  coordText: {
    fontSize: 10,
    color: '#1A73E8',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  timestamp: {
    fontSize: 10,
    color: '#5F6368',
  },
});
