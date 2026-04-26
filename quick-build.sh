#!/bin/bash

echo "⚡ Quick Release Build"
echo "===================="

# Navigate to project directory
cd /Users/ashokverma/Documents/TechRover/elora-mobile

# Clean and build
echo "🧹 Cleaning..."
cd android && ./gradlew clean

echo "🔨 Building release APK..."
./gradlew assembleRelease

# Check if build was successful
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    echo "✅ Build successful!"
    
    # Copy to project root with timestamp
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    APK_NAME="elora-mobile-${TIMESTAMP}.apk"
    
    cd ..
    cp "android/app/build/outputs/apk/release/app-release.apk" "./${APK_NAME}"
    
    echo "📱 APK created: ${APK_NAME}"
    echo "📍 Location: $(pwd)/${APK_NAME}"
    echo "📏 Size: $(du -h "${APK_NAME}" | cut -f1)"
    
    # Show full path
    echo "🔗 Full path: $(realpath "${APK_NAME}")"
    
else
    echo "❌ Build failed!"
    exit 1
fi