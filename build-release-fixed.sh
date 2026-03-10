#!/bin/bash

echo "Building Release APK with Java compatibility fix..."

# Install Java 17 if not available
if ! /usr/libexec/java_home -v 17 >/dev/null 2>&1; then
    echo "Java 17 not found. Installing via Homebrew..."
    if ! command -v brew &> /dev/null; then
        echo "Homebrew not found. Please install Java 17 manually or install Homebrew first."
        exit 1
    fi
    brew install openjdk@17
    sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
fi

# Use Java 17
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
echo "Using Java: $JAVA_HOME"

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