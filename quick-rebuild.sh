#!/bin/bash

echo "🔧 Quick rebuild with status bar fix..."

# Source SDKMAN and use Java 17
source ~/.sdkman/bin/sdkman-init.sh
sdk use java 17.0.2-open

# Set environment variables
export JAVA_HOME=$(sdk home java 17.0.2-open)
export ANDROID_HOME=/Users/ashokverma/Library/Android/sdk

# Build release APK
cd android
./gradlew assembleRelease

# Copy APK with timestamp
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    TIMESTAMP=$(date +"%Y%m%d_%H%M")
    cp app/build/outputs/apk/release/app-release.apk ../EloraMob_StatusBarFix_${TIMESTAMP}.apk
    cp ../EloraMob_StatusBarFix_${TIMESTAMP}.apk ~/Desktop/
    echo "✅ APK with status bar fix ready: EloraMob_StatusBarFix_${TIMESTAMP}.apk"
    echo "📱 Copied to Desktop"
else
    echo "❌ Build failed"
fi