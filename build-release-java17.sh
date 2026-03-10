#!/bin/bash

echo "Building Release APK with Java 17..."

# Source SDKMAN and use Java 17
source ~/.sdkman/bin/sdkman-init.sh
sdk use java 17.0.2-open

# Verify Java version
echo "Using Java version:"
java -version

# Set JAVA_HOME for Gradle
export JAVA_HOME=$(sdk home java 17.0.2-open)
echo "JAVA_HOME set to: $JAVA_HOME"

# Clean and build
cd android
echo "Cleaning previous build..."
./gradlew clean

echo "Building release APK..."
./gradlew assembleRelease

# Copy APK to root with timestamp
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    TIMESTAMP=$(date +"%Y%m%d_%H%M")
    cp app/build/outputs/apk/release/app-release.apk ../EloraMob_Release_${TIMESTAMP}.apk
    echo "✅ APK ready: EloraMob_Release_${TIMESTAMP}.apk"
    echo "📱 File size: $(du -h ../EloraMob_Release_${TIMESTAMP}.apk | cut -f1)"
    echo "📲 Ready for distribution"
else
    echo "❌ Build failed - APK not found"
    exit 1
fi