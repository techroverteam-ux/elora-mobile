#!/bin/bash

echo "🚀 Quick APK Build for Elora Creative Arts"
echo "📱 Building APK with Elora icon..."

# Create output directory
mkdir -p build-output

# Generate React Native bundle first
echo "📦 Generating React Native bundle..."
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# Create assets directory if it doesn't exist
mkdir -p android/app/src/main/assets

# Build APK using simple gradle command
echo "🔨 Building APK..."
cd android

# Try building without native modules first
./gradlew assembleRelease -x configureCMakeRelWithDebInfo -x configureCMakeDebug

if [ $? -eq 0 ]; then
    echo "✅ APK build successful!"
    
    # Find the APK file
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
    
    if [ -f "$APK_PATH" ]; then
        # Create a descriptive filename
        NEW_APK_NAME="EloraCreativeArts-$(date +%Y%m%d-%H%M).apk"
        
        # Copy APK to build-output with new name
        cp "$APK_PATH" "../build-output/$NEW_APK_NAME"
        
        echo "📱 APK created successfully: $NEW_APK_NAME"
        echo "📍 Location: $(pwd)/../build-output/$NEW_APK_NAME"
        echo "📊 File size: $(du -h "../build-output/$NEW_APK_NAME" | cut -f1)"
        echo ""
        echo "✅ Ready to share on WhatsApp!"
        echo "💡 APK file: build-output/$NEW_APK_NAME"
        
    else
        echo "❌ APK file not found at expected location."
    fi
else
    echo "❌ APK build failed."
    exit 1
fi

cd ..