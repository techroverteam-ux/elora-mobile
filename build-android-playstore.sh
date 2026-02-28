#!/bin/bash

# Android Play Store Build Script
set -e

PROJECT_DIR="/Users/ashokverma/Documents/TechRover/GBS/GeetaFinal"
cd "$PROJECT_DIR"

echo "🤖 Building Android APK/AAB for Play Store..."

# Clean and install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Clean Android build
echo "🧹 Cleaning Android build..."
cd android
./gradlew clean
cd ..

# Build release APK
echo "🏗️ Building release APK..."
cd android
./gradlew assembleRelease

# Build release AAB (for Play Store)
echo "📦 Building release AAB..."
./gradlew bundleRelease

cd ..

echo "✅ Build complete!"
echo ""
echo "📱 Files generated:"
echo "APK: android/app/build/outputs/apk/release/app-release.apk"
echo "AAB: android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "📤 Upload the AAB file to Google Play Console for closed testing"