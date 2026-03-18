# Google Maps API Key Setup and Enhanced Address Verification

## Google Maps API Key: AIzaSyBvOkBwgGlbUiuS-oSim-_hVautcHiOidc

### How to Obtain Google Maps API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create or Select Project**
   - Create a new project or select existing one
   - Enable billing (required for Maps APIs)

3. **Enable Required APIs**
   - Go to "APIs & Services" > "Library"
   - Enable these APIs:
     - **Maps Static API** (for map images)
     - **Geocoding API** (for address lookup)
     - **Places API** (for nearby places)
     - **Street View Static API** (for street view images)

4. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated key

5. **Secure the API Key**
   - Click on the key to edit restrictions
   - Add application restrictions (Android/iOS bundle IDs)
   - Add API restrictions (limit to only needed APIs)

### Current API Key Configuration

The API key `AIzaSyBvOkBwgGlbUiuS-oSim-_hVautcHiOidc` is configured with:
- **Maps Static API**: For generating mini map images
- **Geocoding API**: For reverse geocoding (coordinates to address)
- **Places API**: For nearby places and landmarks
- **Street View Static API**: For street view images

## Enhanced Address Verification System

### Features Implemented

#### 1. Multi-Source Address Verification
- **Primary**: Google Maps Geocoding API
- **Fallback**: BigDataCloud API (free)
- **Additional**: OpenStreetMap Nominatim
- **Confidence Scoring**: 0-100% based on source reliability

#### 2. Detailed Address Components
```typescript
{
  streetNumber: "123",
  streetName: "Main Street",
  neighborhood: "Downtown",
  city: "New York",
  state: "New York",
  country: "United States",
  postalCode: "10001",
  formattedAddress: "123 Main Street, Downtown, New York, NY 10001, USA"
}
```

#### 3. Location Proof Elements
- **Verification Status**: ✅ VERIFIED or ⚠️ UNVERIFIED
- **Confidence Score**: Percentage based on multiple sources
- **Data Sources**: Google Maps, OpenStreetMap, etc.
- **Nearby Landmarks**: Hospitals, schools, banks within 500m
- **Address Type**: Residential, Commercial, Industrial, Mixed

#### 4. Enhanced Display Format
```
✅ VERIFIED (85%)
📍 123 Main Street
Downtown, New York
NY 10001, USA
📊 Sources: Google Maps, OSM
🏢 Near: Central Hospital, City Bank
🕒 Dec 15, 2:30 PM
```

### Address Verification Process

1. **Primary Lookup**: Google Maps Geocoding API
   - Most accurate and detailed
   - Provides structured address components
   - Confidence: +40%

2. **Secondary Verification**: OpenStreetMap Nominatim
   - Free alternative source
   - Cross-verification of address
   - Confidence: +30%

3. **Context Enhancement**: Places API
   - Nearby landmarks and businesses
   - Address type determination
   - Confidence: +20%

4. **Final Scoring**: Combined confidence
   - Multiple sources: +10% bonus
   - Final score: 0-100%
   - Verified if >50%

### Implementation Files

#### 1. Enhanced Location Service
**File**: `src/services/locationService.ts`
- Updated Google Maps API key
- Enhanced reverse geocoding with Google Maps API
- Fallback to BigDataCloud API
- Structured address component parsing

#### 2. Address Verification Service
**File**: `src/services/addressVerificationService.ts` (NEW)
- Multi-source address verification
- Confidence scoring system
- Nearby landmarks detection
- Address type classification
- Formatted display generation

#### 3. Enhanced Location Overlay
**File**: `src/components/LocationOverlay.tsx`
- Integration with address verification
- Enhanced display with verification status
- Confidence scores and source attribution
- Nearby landmarks display

### API Usage and Costs

#### Google Maps APIs Used:
1. **Geocoding API**: $5 per 1,000 requests
2. **Maps Static API**: $2 per 1,000 requests
3. **Places API**: $17 per 1,000 requests
4. **Street View Static API**: $7 per 1,000 requests

#### Free Tier:
- $200 monthly credit (covers ~40,000 geocoding requests)
- First 1,000 requests free for most APIs

#### Cost Optimization:
- Caching of geocoding results
- Fallback to free APIs when possible
- Request batching and deduplication

### Address Proof for Documentation

The enhanced system provides comprehensive location proof:

1. **Technical Verification**
   - GPS coordinates with accuracy
   - Multiple data source confirmation
   - Confidence scoring

2. **Human-Readable Proof**
   - Full formatted address
   - Nearby landmarks for context
   - Timestamp for verification

3. **Visual Proof**
   - Mini map with location marker
   - Street view image (if available)
   - Verification status indicators

### Usage in Recce Photos

When taking recce photos, the system now provides:

1. **Immediate Verification**
   - Real-time address lookup
   - Confidence scoring
   - Multiple source verification

2. **Comprehensive Documentation**
   - Full address details
   - Nearby landmarks
   - Verification status

3. **Legal/Audit Trail**
   - Timestamped location proof
   - Multiple source attribution
   - Confidence metrics

### Troubleshooting

#### API Key Issues:
1. **Invalid Key**: Check key is correctly copied
2. **API Not Enabled**: Enable required APIs in Google Cloud Console
3. **Quota Exceeded**: Check usage limits and billing
4. **Restrictions**: Verify app restrictions match bundle ID

#### Address Verification Issues:
1. **Low Confidence**: Check GPS accuracy and network connection
2. **No Address**: Verify location has proper addressing
3. **Wrong Address**: GPS drift or poor signal quality

### Testing Address Verification

```bash
# Test the enhanced address verification
node test-location-overlay.js
```

The test will verify:
- Google Maps API connectivity
- Address verification accuracy
- Confidence scoring
- Multiple source integration
- Display formatting

### Security Considerations

1. **API Key Protection**
   - Restrict to specific apps/domains
   - Limit to required APIs only
   - Monitor usage regularly

2. **Data Privacy**
   - Location data encrypted in transit
   - Temporary caching only
   - User consent for location access

3. **Fallback Systems**
   - Multiple data sources
   - Graceful degradation
   - Offline capability planning

The enhanced address verification system provides comprehensive location proof suitable for legal documentation, audit trails, and project verification requirements.