#!/bin/bash

echo "🚀 Building Test APK for EloraMob..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean
cd ..

# Bundle React Native assets
echo "📦 Bundling React Native assets..."
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# Build debug APK
echo "🔨 Building debug APK..."
cd android
./gradlew assembleDebug

# Check if APK was created
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    echo "✅ APK built successfully!"
    echo "📱 APK location: android/$APK_PATH"
    
    # Copy APK to root directory for easy access
    cp "$APK_PATH" "../EloraMob-test.apk"
    echo "📋 APK copied to: EloraMob-test.apk"
    
    # Show APK info
    echo "📊 APK Info:"
    ls -lh "../EloraMob-test.apk"
else
    echo "❌ APK build failed!"
    exit 1
fi

cd ..
echo "🎉 Build complete! You can now install EloraMob-test.apk on your device."