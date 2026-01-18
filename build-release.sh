#!/bin/bash

# Production Build Script for Play Store Release

echo "🚀 Starting Play Store Release Build..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean
cd ..

# Remove node_modules and reinstall (optional but recommended)
echo "📦 Reinstalling dependencies..."
rm -rf node_modules
npm install

# Generate release bundle (AAB - recommended for Play Store)
echo "📱 Building release bundle..."
cd android
./gradlew bundleRelease

# Generate release APK (for testing)
echo "📱 Building release APK..."
./gradlew assembleRelease

echo "✅ Build completed!"
echo ""
echo "📁 Files generated:"
echo "   AAB: android/app/build/outputs/bundle/release/app-release.aab"
echo "   APK: android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "🎯 Next steps:"
echo "   1. Test the APK on multiple devices"
echo "   2. Upload AAB to Play Console"
echo "   3. Fill in store listing details"
echo "   4. Submit for review"