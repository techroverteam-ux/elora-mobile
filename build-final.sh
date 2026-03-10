#!/bin/bash

echo "🚀 Building Release APK for EloraMob..."

# Source SDKMAN and use Java 17
source ~/.sdkman/bin/sdkman-init.sh
sdk use java 17.0.2-open

# Set environment variables
export JAVA_HOME=$(sdk home java 17.0.2-open)
export ANDROID_HOME=/Users/ashokverma/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

echo "✅ Java version: $(java -version 2>&1 | head -1)"
echo "✅ JAVA_HOME: $JAVA_HOME"
echo "✅ ANDROID_HOME: $ANDROID_HOME"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Clean and build
cd android
echo "🧹 Cleaning previous build..."
./gradlew clean

echo "🏗️ Building release APK..."
./gradlew assembleRelease

# Copy APK to root with timestamp
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    TIMESTAMP=$(date +"%Y%m%d_%H%M")
    cp app/build/outputs/apk/release/app-release.apk ../EloraMob_Release_${TIMESTAMP}.apk
    echo ""
    echo "🎉 SUCCESS! APK built successfully!"
    echo "📱 File: EloraMob_Release_${TIMESTAMP}.apk"
    echo "📊 Size: $(du -h ../EloraMob_Release_${TIMESTAMP}.apk | cut -f1)"
    echo "📲 Ready for distribution!"
    echo ""
    ls -la ../EloraMob_Release_${TIMESTAMP}.apk
else
    echo "❌ Build failed - APK not found"
    exit 1
fi