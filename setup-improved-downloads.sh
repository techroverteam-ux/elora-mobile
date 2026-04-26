#!/bin/bash

echo "🚀 Setting up improved download experience..."

# Navigate to project directory
cd /Users/ashokverma/Documents/TechRover/elora-mobile

# Install notification dependency
echo "📦 Installing notification dependency..."
npm install react-native-push-notification@^8.1.1

# Link native dependencies (for older RN versions)
echo "🔗 Linking native dependencies..."
npx react-native link react-native-push-notification

# Clean and rebuild
echo "🧹 Cleaning project..."
cd android
./gradlew clean
cd ..

# Clear caches
echo "🗑️ Clearing caches..."
npx react-native start --reset-cache &
sleep 3
pkill -f "react-native start"

# Build new APK
echo "🏗️ Building APK with download improvements..."
cd android
./gradlew assembleRelease

echo ""
echo "✅ Setup complete! New features:"
echo "   📊 Download progress in notification bar"
echo "   🎨 Clean banking-style download popups"  
echo "   📱 Better download experience"
echo "   🔔 Notification permissions added"
echo ""
echo "📱 APK location: android/app/build/outputs/apk/release/app-release.apk"
echo "🔄 Install new APK to test improved downloads"