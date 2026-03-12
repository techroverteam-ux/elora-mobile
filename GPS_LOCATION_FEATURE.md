# GPS Location Overlay Feature

## Overview
The GPS Location Overlay feature automatically embeds GPS location information directly onto captured images in the measurement camera. This feature is configurable per client and includes a map preview, coordinates, address, and timestamp.

## Features

### ✅ Automatic GPS Capture
- Automatically captures device GPS location when taking photos
- Requests location permissions if not granted
- Falls back gracefully if location is unavailable

### ✅ Client-Based Configuration
- Each client can have location overlay enabled/disabled
- Configuration stored in client master data
- Easy toggle in client management screen

### ✅ Rich Location Information
- **Map Preview**: 60x60px static map from Google Maps API
- **Coordinates**: Precise latitude/longitude coordinates
- **Address**: Reverse geocoded address information
- **Timestamp**: Date and time when photo was captured

### ✅ Customizable Overlay
- **Position**: Bottom-left, bottom-right, top-left, top-right
- **Map Size**: Small (60px), Medium (80px), Large (100px)
- **Information Display**: Toggle address, coordinates, timestamp
- **Styling**: Professional overlay with proper contrast

### ✅ Mobile Optimized
- Efficient GPS detection and caching
- Optimized image processing
- Minimal performance impact
- Works on both Android and iOS

## Implementation

### Core Components

#### 1. Location Services (`locationService.ts`)
```typescript
// Enhanced location service with GPS embedding
- getCurrentLocation(): Promise<LocationData>
- reverseGeocode(lat, lng): Promise<AddressComponents>
- getStaticMapUrl(lat, lng, size): string
- getLocationForImageEmbedding(): Promise<LocationOverlayData>
```

#### 2. Image Location Overlay (`imageLocationOverlay.ts`)
```typescript
// Handles location overlay processing
- processImageWithLocation(imageUri, clientId): Promise<ProcessResult>
- shouldEnableLocationOverlay(clientId): Promise<boolean>
- getClientLocationConfig(clientId): Promise<LocationOverlayConfig>
```

#### 3. Location Overlay Component (`LocationOverlay.tsx`)
```typescript
// React Native component for rendering overlay
- Renders map image and location information
- Positioned absolutely over captured image
- Captured with ViewShot for final image
```

#### 4. Client Configuration (`ClientsScreen.tsx`)
```typescript
// Client management with location settings
- Toggle for enabling/disabling location overlay
- Visual indicator showing GPS status per client
- Integrated into existing client creation/editing flow
```

### Integration Points

#### 1. MeasurementCamera Component
- Enhanced to support location overlay
- Automatic GPS capture when enabled
- Visual GPS indicator in camera UI
- Seamless integration with existing drawing features

#### 2. Client Service
- Extended to handle location configuration
- Caching for performance optimization
- Backward compatible with existing clients

#### 3. Form Screens (Recce/Installation)
- Pass client ID to camera component
- Handle location metadata in photo capture
- Success notifications for GPS-enabled photos

## Configuration

### Client-Level Settings
Each client can be configured with:

```typescript
interface ClientLocationConfig {
  enableLocationOverlay: boolean;    // Main toggle
  mapSize?: number;                  // 60, 80, or 100 pixels
  showAddress?: boolean;             // Show reverse geocoded address
  showCoordinates?: boolean;         // Show lat/lng coordinates
  showTimestamp?: boolean;           // Show capture timestamp
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}
```

### Default Configuration
```typescript
const defaultConfig = {
  enabled: false,                    // Disabled by default
  mapSize: 80,                      // Medium size map
  showAddress: true,                // Show address
  showCoordinates: true,            // Show coordinates
  showTimestamp: true,              // Show timestamp
  position: 'bottom-left',          // Bottom-left position
};
```

## Usage

### 1. Enable for Client
1. Go to Client Management screen
2. Create new client or edit existing client
3. Toggle "GPS Location in Photos" switch
4. Save client configuration

### 2. Taking Photos
1. Open measurement camera (Recce/Installation)
2. GPS indicator shows if location overlay is active
3. Take photo normally
4. Location overlay is automatically embedded
5. Final image includes map and location information

### 3. Viewing Results
- Photos are saved with embedded location overlay
- Location information is permanently part of the image
- No additional processing needed for uploads/sharing

## Technical Details

### Permissions Required
```xml
<!-- Android -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

```xml
<!-- iOS -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to embed GPS information in photos.</string>
```

### Dependencies
```json
{
  "@react-native-community/geolocation": "^3.4.0",
  "react-native-fs": "^2.20.0",
  "react-native-view-shot": "^4.0.3"
}
```

### API Integration
- **Google Static Maps API**: For map preview generation
- **BigDataCloud Geocoding API**: For reverse geocoding (free tier)
- **Client API**: For storing/retrieving location configuration

## Performance Considerations

### Optimization Strategies
1. **GPS Caching**: Location cached for 10 seconds to avoid repeated requests
2. **Map Image Caching**: Downloaded maps cached locally for 1 hour
3. **Client Config Caching**: Client settings cached for 5 minutes
4. **Lazy Loading**: Location services only initialized when needed

### Memory Management
- Automatic cleanup of cached map images
- Efficient image processing with ViewShot
- Minimal memory footprint for overlay rendering

## Error Handling

### Graceful Degradation
- **No GPS Permission**: Feature disabled, normal photo capture continues
- **No GPS Signal**: Uses last known location or skips overlay
- **Network Issues**: Falls back to coordinates-only display
- **API Failures**: Continues with basic location information

### User Feedback
- Clear indicators when GPS is active/inactive
- Success notifications for GPS-enabled photos
- Error messages for permission/location issues

## Security & Privacy

### Data Handling
- GPS coordinates captured only when explicitly enabled
- Location data embedded directly in image (no separate storage)
- No location tracking or persistent storage
- Client controls when location is captured

### Compliance
- Respects user location permissions
- Clear indication when location is being captured
- Option to disable per client for privacy-sensitive projects

## Future Enhancements

### Planned Features
1. **Advanced Map Styles**: Satellite, terrain, hybrid views
2. **Custom Markers**: Client-specific map markers
3. **Offline Maps**: Cached maps for offline operation
4. **Location History**: Optional location tracking for projects
5. **Geofencing**: Automatic location validation for project sites

### Integration Opportunities
1. **Project Boundaries**: Validate photos are taken within project area
2. **Route Optimization**: Suggest optimal routes between sites
3. **Location Analytics**: Insights on photo capture locations
4. **Compliance Reporting**: Location-based compliance reports

## Troubleshooting

### Common Issues

#### GPS Not Working
1. Check location permissions in device settings
2. Ensure GPS is enabled on device
3. Try taking photo in open area with clear sky view
4. Restart app if location services seem stuck

#### Map Not Showing
1. Verify Google Maps API key is configured
2. Check internet connection
3. Ensure API key has Static Maps API enabled
4. Check API usage limits

#### Location Overlay Not Appearing
1. Verify client has location overlay enabled
2. Check that clientId is being passed to camera
3. Ensure location permissions are granted
4. Check console logs for error messages

### Debug Mode
Enable debug logging by setting `__DEV__` flag:
```typescript
if (__DEV__) {
  console.log('Location overlay status:', locationData);
}
```

## Support

For technical support or feature requests related to the GPS Location Overlay feature, please contact the development team with:

1. Device information (iOS/Android version)
2. App version and build number
3. Client configuration details
4. Steps to reproduce any issues
5. Console logs if available

---

**Note**: This feature requires active internet connection for map generation and address lookup. Ensure proper API keys are configured for production use.