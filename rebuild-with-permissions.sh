#!/bin/bash

echo "🔧 Rebuilding app with proper permissions..."

# Navigate to project directory
cd /Users/ashokverma/Documents/TechRover/elora-mobile

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean
cd ..

# Clean React Native cache
echo "🗑️ Clearing React Native cache..."
npx react-native start --reset-cache &
sleep 5
pkill -f "react-native start"

# Clean npm cache
echo "📦 Clearing npm cache..."
npm start -- --reset-cache &
sleep 5
pkill -f "npm start"

# Rebuild Android app
echo "🏗️ Building Android APK with permissions..."
cd android
./gradlew assembleRelease

echo "✅ Build complete! APK location:"
echo "📱 android/app/build/outputs/apk/release/app-release.apk"

echo ""
echo "📋 Permissions now included in manifest:"
echo "   ✅ Camera"
echo "   ✅ Storage (Read/Write)"
echo "   ✅ Media (Images/Video for Android 13+)"
echo "   ✅ Location"
echo ""
echo "🔄 Install the new APK to see permissions in device settings"