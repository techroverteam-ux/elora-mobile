#!/bin/bash

echo "🚀 Force Building APK for Client Share"

# Clean and prepare
rm -rf android/app/.cxx
rm -rf android/app/build
mkdir -p build-output

# Generate bundle
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

cd android

# Force build without native modules
./gradlew assembleRelease \
  -x configureCMakeRelWithDebInfo \
  -x configureCMakeDebug \
  -x externalNativeBuildRelease \
  -x buildCMakeRelWithDebInfo \
  --continue

# Check for APK
APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    APK_NAME="EloraCreativeArts-Client-$(date +%Y%m%d).apk"
    cp "$APK_PATH" "../build-output/$APK_NAME"
    echo "✅ APK ready: build-output/$APK_NAME"
    echo "📱 Size: $(du -h "../build-output/$APK_NAME" | cut -f1)"
else
    echo "❌ Build failed, trying debug version..."
    ./gradlew assembleDebug --continue
    DEBUG_APK="app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$DEBUG_APK" ]; then
        APK_NAME="EloraCreativeArts-Client-Debug-$(date +%Y%m%d).apk"
        cp "$DEBUG_APK" "../build-output/$APK_NAME"
        echo "✅ Debug APK ready: build-output/$APK_NAME"
    fi
fi

cd ..