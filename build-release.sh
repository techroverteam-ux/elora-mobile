#!/bin/bash

# Elora Mobile - Release Build Script
echo "🚀 Building Elora Mobile Release APK..."

# Set Java environment
export JAVA_HOME=$(/usr/libexec/java_home -v 17 2>/dev/null || /usr/libexec/java_home -v 15)
echo "📱 Using Java: $JAVA_HOME"

# Navigate to android directory
cd android

# Clean previous builds
echo "🧹 Cleaning previous builds..."
./gradlew clean

# Build release APK
echo "🔨 Building release APK..."
./gradlew assembleRelease

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📦 APK location: android/app/build/outputs/apk/release/"
    
    # List the generated APK files
    echo "📋 Generated files:"
    ls -la app/build/outputs/apk/release/
    
    # Copy APK to releases folder
    mkdir -p ../releases
    cp app/build/outputs/apk/release/app-release.apk ../releases/EloraMob_$(date +%Y%m%d_%H%M).apk
    echo "📁 APK copied to releases folder"
else
    echo "❌ Build failed!"
    exit 1
fi