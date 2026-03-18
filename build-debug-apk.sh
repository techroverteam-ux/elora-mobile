#!/bin/bash

# Debug APK Build Script for Camera Testing
# This script builds a debug APK that can be installed on real phones to test camera detection

echo "🔧 Building Debug APK for Camera Testing..."
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Check if Android SDK is available
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ Error: ANDROID_HOME environment variable is not set."
    echo "Please set up Android SDK and add ANDROID_HOME to your environment variables."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean
cd ..

# Clear React Native cache
echo "🗑️  Clearing React Native cache..."
npx react-native start --reset-cache &
RN_PACKAGER_PID=$!
sleep 5
kill $RN_PACKAGER_PID

# Clear Metro cache
echo "🗑️  Clearing Metro cache..."
rm -rf /tmp/metro-*
rm -rf node_modules/.cache

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate debug keystore if it doesn't exist
KEYSTORE_PATH="android/app/debug.keystore"
if [ ! -f "$KEYSTORE_PATH" ]; then
    echo "🔑 Generating debug keystore..."
    keytool -genkey -v -keystore $KEYSTORE_PATH -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
fi

# Build debug APK
echo "🔨 Building debug APK..."
cd android
./gradlew assembleDebug

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Debug APK built successfully!"
    
    # Find the APK file
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$APK_PATH" ]; then
        echo "📱 APK Location: android/$APK_PATH"
        
        # Get APK info
        APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
        echo "📊 APK Size: $APK_SIZE"
        
        # Copy APK to project root for easy access
        cp "$APK_PATH" "../elora-mobile-debug.apk"
        echo "📋 APK copied to: elora-mobile-debug.apk"
        
        # Show installation instructions
        echo ""
        echo "📲 Installation Instructions:"
        echo "1. Enable 'Developer Options' on your Android device"
        echo "2. Enable 'USB Debugging' in Developer Options"
        echo "3. Connect your device via USB"
        echo "4. Run: adb install elora-mobile-debug.apk"
        echo ""
        echo "Or manually install:"
        echo "1. Transfer elora-mobile-debug.apk to your device"
        echo "2. Enable 'Install from Unknown Sources' in Settings"
        echo "3. Open the APK file and install"
        echo ""
        
        # Check for connected devices
        echo "🔍 Checking for connected devices..."
        adb devices
        
        DEVICE_COUNT=$(adb devices | grep -c "device$")
        if [ $DEVICE_COUNT -gt 0 ]; then
            echo ""
            echo "📱 Found $DEVICE_COUNT connected device(s)"
            echo "Would you like to install the APK now? (y/n)"
            read -r response
            if [[ "$response" =~ ^[Yy]$ ]]; then
                echo "📲 Installing APK..."
                adb install -r "../elora-mobile-debug.apk"
                if [ $? -eq 0 ]; then
                    echo "✅ APK installed successfully!"
                    echo "🚀 You can now test camera detection on your device"
                else
                    echo "❌ APK installation failed"
                fi
            fi
        else
            echo "⚠️  No devices connected via USB"
        fi
        
    else
        echo "❌ APK file not found at expected location"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi

cd ..

echo ""
echo "🎯 Camera Testing Features to Test:"
echo "- Device camera detection (front/back)"
echo "- GPS camera app detection"
echo "- Camera selection dialog"
echo "- Photo capture with metadata"
echo "- GPS location embedding"
echo ""
echo "📝 Debug Tips:"
echo "- Check device logs: adb logcat | grep -i camera"
echo "- Test with different GPS camera apps installed"
echo "- Verify camera permissions are granted"
echo "- Test on different Android versions"
echo ""
echo "🔧 Build completed successfully!"