#!/bin/bash

# GBS Mobile App - APK Build Script
# This script builds the APK file for distribution

echo "🚀 Starting GBS Mobile App APK Build Process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Check if Android SDK is available
if [ ! -d "$ANDROID_HOME" ]; then
    echo "❌ Error: ANDROID_HOME not set. Please install Android SDK and set ANDROID_HOME environment variable."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean
cd ..

# Install dependencies with legacy peer deps to resolve React version conflicts
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Generate Android bundle
echo "🔨 Building Android bundle..."
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# Build APK
echo "📱 Building APK..."
cd android
./gradlew assembleRelease

# Check if build was successful
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    echo "✅ APK build successful!"
    
    # Create output directory
    mkdir -p ../build-output
    
    # Copy APK to output directory with timestamp
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    APK_NAME="GBS_Mobile_${TIMESTAMP}.apk"
    cp app/build/outputs/apk/release/app-release.apk "../build-output/${APK_NAME}"
    
    echo "📁 APK saved as: build-output/${APK_NAME}"
    echo "📊 APK size: $(du -h "../build-output/${APK_NAME}" | cut -f1)"
    
    # Generate QR code for easy sharing (if qrencode is available)
    if command -v qrencode &> /dev/null; then
        echo "📱 Generating QR code for sharing..."
        echo "file://$(pwd)/../build-output/${APK_NAME}" | qrencode -t PNG -o "../build-output/${APK_NAME%.apk}_QR.png"
        echo "📱 QR code saved as: build-output/${APK_NAME%.apk}_QR.png"
    fi
    
else
    echo "❌ APK build failed!"
    exit 1
fi

cd ..

echo "🎉 Build process completed successfully!"
echo ""
echo "📋 Build Summary:"
echo "   APK Location: build-output/${APK_NAME}"
echo "   APK Size: $(du -h "build-output/${APK_NAME}" | cut -f1)"
echo "   Build Date: $(date)"
echo ""
echo "📤 To share the APK:"
echo "   1. Upload to cloud storage (Google Drive, Dropbox, etc.)"
echo "   2. Use file sharing apps"
echo "   3. Send via email/messaging apps"
echo "   4. Use the generated QR code for easy download"