#!/bin/bash

# EloraMob APK Build Script
# This script builds the APK for sharing on WhatsApp

echo "🚀 Starting EloraMob APK Build Process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Check if Android SDK is available
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ Error: ANDROID_HOME environment variable is not set."
    echo "Please set ANDROID_HOME to your Android SDK path."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean
cd ..

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate bundle
echo "📱 Generating React Native bundle..."
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# Create assets directory if it doesn't exist
mkdir -p android/app/src/main/assets

# Build APK
echo "🔨 Building APK..."
cd android
./gradlew assembleRelease

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ APK build successful!"
    
    # Find the APK file
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
    
    if [ -f "$APK_PATH" ]; then
        # Get app version from build.gradle
        VERSION=$(grep "versionName" app/build.gradle | sed 's/.*versionName "\(.*\)".*/\1/')
        
        # Create a more descriptive filename
        NEW_APK_NAME="EloraMob-v${VERSION}-$(date +%Y%m%d).apk"
        
        # Copy APK to project root with new name
        cp "$APK_PATH" "../$NEW_APK_NAME"
        
        echo "📱 APK created successfully: $NEW_APK_NAME"
        echo "📍 Location: $(pwd)/../$NEW_APK_NAME"
        echo "📊 File size: $(du -h "../$NEW_APK_NAME" | cut -f1)"
        
        # Show APK info
        echo ""
        echo "📋 APK Information:"
        echo "   App Name: EloraMob"
        echo "   Version: $VERSION"
        echo "   Package: com.eloramob"
        echo "   Build Date: $(date)"
        echo ""
        echo "✅ Ready to share on WhatsApp!"
        echo "💡 You can now share the file: $NEW_APK_NAME"
        
    else
        echo "❌ Error: APK file not found at expected location."
        echo "Expected: $APK_PATH"
    fi
else
    echo "❌ APK build failed. Please check the error messages above."
    exit 1
fi

cd ..