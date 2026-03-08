#!/bin/bash

echo "🚀 Building Release APK for Client..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean

# Build release APK
echo "📦 Building release APK..."
./gradlew assembleRelease

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📱 APK location: android/app/build/outputs/apk/release/app-release.apk"
    
    # Copy APK to root with version name
    cp app/build/outputs/apk/release/app-release.apk ../EloraMob-v1.3-release.apk
    echo "📋 APK copied to: EloraMob-v1.3-release.apk"
    
    # Show APK info
    echo "📊 APK Info:"
    ls -lh ../EloraMob-v1.3-release.apk
else
    echo "❌ Build failed!"
    exit 1
fi