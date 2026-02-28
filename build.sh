#!/bin/bash

echo "🚀 Building Elora Mobile App..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf node_modules
rm -f package-lock.json
npx react-native-clean-project --remove-iOS-build --remove-android-build

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# For iOS
if [[ "$1" == "ios" ]]; then
    echo "🍎 Building for iOS..."
    cd ios
    pod install
    cd ..
    npx react-native run-ios --configuration Release
fi

# For Android
if [[ "$1" == "android" ]]; then
    echo "🤖 Building for Android..."
    npx react-native run-android --variant=release
fi

# Build APK
if [[ "$1" == "apk" ]]; then
    echo "📱 Building APK..."
    cd android
    ./gradlew assembleRelease
    echo "✅ APK built at: android/app/build/outputs/apk/release/app-release.apk"
fi

echo "✅ Build completed!"