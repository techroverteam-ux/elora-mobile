#!/bin/bash

echo "🚀 Building Elora Creative Art - Stable Release"
echo "=============================================="

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean
cd ..

# Clear React Native cache
echo "🗑️ Clearing React Native cache..."
npx react-native start --reset-cache &
METRO_PID=$!
sleep 5
kill $METRO_PID

# Clear node modules cache
echo "📦 Clearing node modules cache..."
rm -rf node_modules
npm install

# Build the bundle
echo "📱 Building React Native bundle..."
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res

# Build APK
echo "🔨 Building APK..."
cd android
./gradlew assembleRelease
cd ..

# Check if build was successful
if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
    echo "✅ Build successful!"
    echo "📱 APK location: android/app/build/outputs/apk/release/app-release.apk"
    
    # Copy to releases folder with timestamp
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    mkdir -p releases
    cp android/app/build/outputs/apk/release/app-release.apk "releases/EloraMob_Stable_${TIMESTAMP}.apk"
    echo "📁 Copied to: releases/EloraMob_Stable_${TIMESTAMP}.apk"
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Build completed successfully!"