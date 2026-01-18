# Play Store Release Guide

## 1. Build Configuration

### android/app/build.gradle
```gradle
android {
    compileSdkVersion 34
    buildToolsVersion "34.0.0"
    
    defaultConfig {
        applicationId "com.geetabalsanskar"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
    
    signingConfigs {
        release {
            storeFile file('your-release-key.keystore')
            storePassword 'your-store-password'
            keyAlias 'your-key-alias'
            keyPassword 'your-key-password'
        }
    }
    
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
            signingConfig signingConfigs.release
        }
    }
}
```

## 2. Generate Signed APK/AAB

```bash
# Clean and build release
cd android
./gradlew clean
./gradlew bundleRelease

# APK (if needed)
./gradlew assembleRelease
```

## 3. App Store Assets Required

### App Icons (all sizes)
- 48x48, 72x72, 96x96, 144x144, 192x192, 512x512

### Screenshots
- Phone: 1080x1920 (minimum 2, maximum 8)
- Tablet: 1200x1920 (optional)

### Feature Graphic
- 1024x500 pixels

## 4. App Metadata

### Short Description (80 chars)
"Spiritual content app with audio, video, PDF books and daily wisdom"

### Full Description (4000 chars max)
```
Geeta Bal Sanskar - Your spiritual companion for daily wisdom and learning.

Features:
• Audio lectures and spiritual talks
• Video content and teachings  
• PDF books and scriptures
• Daily wisdom gallery
• Bookmark favorite content
• Recently played history
• Multi-language support

Perfect for spiritual seekers wanting to access authentic content anytime, anywhere.
```

## 5. Privacy Policy & Permissions

### Required Permissions
- INTERNET (for content streaming)
- READ_EXTERNAL_STORAGE (for downloads)
- WRITE_EXTERNAL_STORAGE (for caching)

### Privacy Policy URL
Must be hosted and accessible

## 6. Release Checklist

- [ ] Remove all console.log statements
- [ ] Test on multiple devices
- [ ] Verify all features work offline
- [ ] Check app performance
- [ ] Test deep linking
- [ ] Verify push notifications
- [ ] Test payment flows (if any)
- [ ] Check crash reporting
- [ ] Verify analytics tracking
- [ ] Test app updates

## 7. Build Commands

```bash
# Development
npx react-native run-android

# Release build
cd android && ./gradlew bundleRelease

# Install release APK
adb install app/build/outputs/apk/release/app-release.apk
```

## 8. Version Management

Update these before each release:
- `versionCode` (increment by 1)
- `versionName` (semantic versioning)
- `package.json` version

## 9. Testing Checklist

- [ ] App launches successfully
- [ ] All screens load properly
- [ ] PDF viewer works
- [ ] Audio/video playback
- [ ] Network error handling
- [ ] Offline functionality
- [ ] Back button behavior
- [ ] Memory usage optimization