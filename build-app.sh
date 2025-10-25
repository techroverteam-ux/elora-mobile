#!/bin/bash

echo "🚀 Building Geeta Bal Sanskaar Application..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf android/app/build
rm -rf android/build
rm -rf ios/build

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Build Android APK
echo "🤖 Building Android APK..."
cd android
./gradlew assembleRelease
cd ..

echo "✅ Build completed!"
echo ""
echo "📱 APK Location: android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "🔧 For iOS build:"
echo "1. Install CocoaPods: sudo gem install cocoapods"
echo "2. Install pods: cd ios && pod install && cd .."
echo "3. Open ios/GeetaFinal.xcworkspace in Xcode"
echo "4. Build and archive from Xcode"