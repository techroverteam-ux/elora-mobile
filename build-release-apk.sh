#!/bin/bash

# Elora Mobile - Release APK Build Script
# This script builds a signed release APK with proper naming

echo "🚀 Starting Elora Mobile Release Build..."

# Get current date for filename
DATE=$(date +%Y%m%d)
TIME=$(date +%H%M)
VERSION="1.4-fixed"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android && ./gradlew clean && cd ..

# Create React Native bundle
echo "📦 Creating React Native bundle..."
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# Build release APK
echo "🔨 Building release APK..."
cd android && ./gradlew assembleRelease && cd ..

# Copy APK with descriptive name
if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
    APK_NAME="elora-mobile-v${VERSION}-${DATE}-${TIME}.apk"
    cp android/app/build/outputs/apk/release/app-release.apk "./${APK_NAME}"
    
    # Get APK size
    APK_SIZE=$(ls -lh "${APK_NAME}" | awk '{print $5}')
    
    echo "✅ Build successful!"
    echo "📱 APK: ${APK_NAME}"
    echo "📏 Size: ${APK_SIZE}"
    echo "📍 Location: $(pwd)/${APK_NAME}"
    
    # Optional: Open folder
    # open .
else
    echo "❌ Build failed - APK not found"
    exit 1
fi