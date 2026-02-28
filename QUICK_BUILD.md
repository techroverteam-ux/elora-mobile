# Quick iOS Build for Client Sharing

## Immediate Steps (5 minutes):

### 1. Open Xcode
```bash
cd /Users/ashokverma/Documents/TechRover/GBS/GeetaFinal
open ios/GeetaBalSanskar.xcworkspace
```

### 2. Build Settings
- Select "GeetaBalSanskar" target
- Choose "Any iOS Device" 
- Product → Archive

### 3. Export IPA
- In Organizer → Distribute App
- Choose "Ad Hoc" (for direct sharing)
- Export to Desktop

### 4. Share with Client
The IPA file can be:
- Shared via AirDrop/email
- Uploaded to file sharing service
- Installed via iTunes/Finder

## Alternative: Use Existing Build
If you have a previous build, check:
```bash
ls -la /Users/ashokverma/Documents/TechRover/GBS/GeetaFinal/build/
```

## Quick Fix for CocoaPods
```bash
# Install CocoaPods first
sudo gem install cocoapods
cd /Users/ashokverma/Documents/TechRover/GBS/GeetaFinal/ios
pod install
```

Then use Xcode to build manually.