# TestFlight Client Sharing Guide

## Quick Steps to Share with Client

### 1. Build the App
```bash
cd /Users/ashokverma/Documents/TechRover/GBS/GeetaFinal
chmod +x build-testflight.sh
./build-testflight.sh
```

### 2. Upload to TestFlight
**Option A: Using Xcode (Easiest)**
1. Open Xcode
2. Window → Organizer
3. Select your archive
4. Click "Distribute App"
5. Choose "App Store Connect"
6. Upload

**Option B: Using Transporter App**
1. Download "Transporter" from Mac App Store
2. Open Transporter
3. Drag your IPA file: `build/testflight/GeetaBalSanskar.ipa`
4. Click "Deliver"

### 3. Add Client as Tester
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Go to TestFlight tab
4. Click "External Testing" or "Internal Testing"
5. Add client's email address
6. Client will receive invitation email

### 4. Client Installation
Client receives email → Installs TestFlight app → Downloads your app

## Prerequisites
- Apple Developer Account ($99/year)
- App created in App Store Connect
- Valid certificates and provisioning profiles

## Alternative: Ad Hoc Distribution
If you don't have TestFlight access, you can create an Ad Hoc build:

1. Get client's device UDID
2. Add device to Apple Developer Portal
3. Create Ad Hoc provisioning profile
4. Build with Ad Hoc configuration
5. Share IPA file directly

## Troubleshooting
- **Build fails**: Check certificates in Xcode
- **Upload fails**: Ensure app version is incremented
- **Client can't install**: Check device compatibility

Need help? The build script will show detailed error messages.