# Manual iOS Build Steps for App Store

Since automated build requires additional setup, here are the manual steps:

## Prerequisites Setup (Run these commands in Terminal)

```bash
# 1. Install CocoaPods (if not installed)
sudo gem install cocoapods

# 2. Navigate to project directory
cd /Users/ashokverma/Documents/TechRover/GBS/GeetaFinal

# 3. Install npm dependencies
npm install --legacy-peer-deps

# 4. Install iOS dependencies
cd ios && pod install && cd ..
```

## Build Process

### Option 1: Using Xcode (Recommended)

1. **Open Xcode Project**
   ```bash
   open ios/GeetaBalSanskar.xcworkspace
   ```

2. **Configure Signing**
   - Select "GeetaBalSanskar" target
   - Go to "Signing & Capabilities"
   - Select your Apple Developer Team
   - Ensure Bundle Identifier is unique (e.g., `com.yourcompany.geetabalsanskar`)

3. **Build Archive**
   - Select "Any iOS Device" as destination
   - Product → Archive
   - Wait for build to complete

4. **Export for App Store**
   - In Organizer window, select your archive
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Follow the wizard

### Option 2: Command Line Build

```bash
# Navigate to iOS directory
cd /Users/ashokverma/Documents/TechRover/GBS/GeetaFinal/ios

# Clean previous builds
xcodebuild clean -workspace GeetaBalSanskar.xcworkspace -scheme GeetaBalSanskar

# Build archive (replace YOUR_TEAM_ID with your actual team ID)
xcodebuild archive \
  -workspace GeetaBalSanskar.xcworkspace \
  -scheme GeetaBalSanskar \
  -configuration Release \
  -archivePath ../build/GeetaBalSanskar.xcarchive \
  -destination "generic/platform=iOS" \
  DEVELOPMENT_TEAM=YOUR_TEAM_ID

# Export IPA
xcodebuild -exportArchive \
  -archivePath ../build/GeetaBalSanskar.xcarchive \
  -exportPath ../build/export \
  -exportOptionsPlist ../ExportOptions.plist
```

## Required Configuration Files

### ExportOptions.plist
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>destination</key>
    <string>export</string>
</dict>
</plist>
```

## Before Building - Checklist

- [ ] Apple Developer Account active
- [ ] Bundle ID registered in Apple Developer Portal
- [ ] App created in App Store Connect
- [ ] Distribution certificate and provisioning profile valid
- [ ] App version and build number updated
- [ ] All app icons added (required sizes)

## Upload to TestFlight

### Using Xcode
1. Open Xcode → Window → Organizer
2. Select your archive
3. Click "Distribute App"
4. Choose "App Store Connect"
5. Upload

### Using Command Line
```bash
# Upload to TestFlight (requires App Store Connect API key)
xcrun altool --upload-app \
  -f build/export/GeetaBalSanskar.ipa \
  -t ios \
  --apiKey YOUR_API_KEY \
  --apiIssuer YOUR_ISSUER_ID
```

## Common Issues

1. **Code Signing Error**: Ensure your Apple Developer account has valid certificates
2. **Bundle ID Conflict**: Use a unique bundle identifier
3. **Missing Provisioning Profile**: Create App Store distribution profile
4. **Build Errors**: Check iOS deployment target (should be 12.0+)

## Next Steps After Upload

1. Wait for processing in App Store Connect (5-30 minutes)
2. Add TestFlight testers
3. Complete App Store metadata
4. Submit for review

Need help with any specific step? Let me know!