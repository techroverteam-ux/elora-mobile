# iOS App Store Deployment Checklist

## Pre-Build Configuration

### 1. Apple Developer Account Setup
- [ ] Valid Apple Developer Program membership ($99/year)
- [ ] App Store Connect access
- [ ] Bundle ID registered: `com.yourcompany.geetabalsanskar`
- [ ] App Store Connect app created

### 2. Code Signing & Certificates
- [ ] Distribution Certificate created
- [ ] App Store Provisioning Profile created
- [ ] Team ID configured in build script
- [ ] Automatic signing enabled in Xcode

### 3. App Information
- [ ] App version updated in `package.json`
- [ ] Build number incremented
- [ ] App icons (all sizes) added to `Images.xcassets`
- [ ] Launch screen configured
- [ ] App Store metadata prepared

### 4. Required Updates Before Build

#### Update Team ID in build script:
```bash
# Edit build-ios-appstore.sh
# Replace YOUR_TEAM_ID with your actual Apple Developer Team ID
DEVELOPMENT_TEAM="YOUR_ACTUAL_TEAM_ID"
```

#### Update Bundle Identifier:
```bash
# In Xcode project settings, set:
# Bundle Identifier: com.yourcompany.geetabalsanskar
```

#### Update App Store Connect API (Optional but recommended):
```bash
# For automated uploads, configure:
# API Key ID, Issuer ID, and .p8 key file
```

## Build Process

### Step 1: Run the build script
```bash
cd /Users/ashokverma/Documents/TechRover/GBS/GeetaFinal
./build-ios-appstore.sh
```

### Step 2: Manual verification
- [ ] Archive created successfully
- [ ] IPA file generated
- [ ] App size is reasonable (< 4GB)
- [ ] No build errors or warnings

### Step 3: TestFlight Upload
```bash
# Using Xcode (Recommended for first time)
# 1. Open Xcode
# 2. Window > Organizer
# 3. Select your archive
# 4. Click "Distribute App"
# 5. Choose "App Store Connect"

# Or using command line (after configuring API key)
xcrun altool --upload-app -f "build/export/GeetaBalSanskar.ipa" -t ios --apiKey YOUR_API_KEY --apiIssuer YOUR_ISSUER_ID
```

## App Store Submission Requirements

### Technical Requirements
- [ ] iOS 12.0+ minimum deployment target
- [ ] 64-bit architecture support
- [ ] All required app icons included
- [ ] Privacy policy URL (if collecting data)
- [ ] App Transport Security configured

### Content Requirements
- [ ] App description (up to 4000 characters)
- [ ] Keywords (up to 100 characters)
- [ ] Screenshots for all device sizes
- [ ] App preview videos (optional)
- [ ] Age rating completed

### Privacy & Permissions
- [ ] Privacy nutrition labels completed
- [ ] Data collection practices declared
- [ ] Third-party SDKs privacy compliance
- [ ] Location permission usage description (if used)

## Common Issues & Solutions

### Build Errors
1. **Code signing issues**: Ensure certificates and provisioning profiles are valid
2. **Missing dependencies**: Run `pod install` in ios directory
3. **Archive not found**: Check build logs for compilation errors

### Upload Issues
1. **Invalid binary**: Ensure all required architectures are included
2. **Missing compliance**: Complete export compliance in App Store Connect
3. **Metadata rejection**: Review App Store Review Guidelines

## Post-Upload Steps

### TestFlight
1. Wait for processing (5-30 minutes)
2. Add internal testers
3. Provide test information
4. Distribute to testers

### App Store Review
1. Complete all metadata
2. Set pricing and availability
3. Submit for review
4. Respond to any review feedback

## Useful Commands

```bash
# Check current certificates
security find-identity -v -p codesigning

# List available simulators
xcrun simctl list devices

# Check app size
du -h build/export/GeetaBalSanskar.ipa

# Validate archive before upload
xcrun altool --validate-app -f build/export/GeetaBalSanskar.ipa -t ios
```

## Support Resources
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)