#!/bin/bash

echo "Building Release APK..."

# Use existing Java 15 (compatible with older Gradle)
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-15.0.2.jdk/Contents/Home

# Build release APK
cd android
./gradlew clean
./gradlew assembleRelease

# Copy APK to root with timestamp
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    TIMESTAMP=$(date +"%Y%m%d_%H%M")
    cp app/build/outputs/apk/release/app-release.apk ../EloraMob_Camera_${TIMESTAMP}.apk
    echo "✅ APK ready: EloraMob_Camera_${TIMESTAMP}.apk"
    echo "📲 Share via WhatsApp using whatsapp-message-template.txt"
else
    echo "❌ Build failed"
fi