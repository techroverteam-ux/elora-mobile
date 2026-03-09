#!/bin/bash

echo "🚀 Building Release APK for WhatsApp Sharing..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean
cd ..

# Build release APK
echo "📦 Building release APK..."
cd android
./gradlew assembleRelease

# Check if build was successful
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    echo "✅ APK built successfully!"
    
    # Copy APK to root directory with timestamp
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    cp app/build/outputs/apk/release/app-release.apk ../EloraMob_${TIMESTAMP}.apk
    
    echo "📱 APK saved as: EloraMob_${TIMESTAMP}.apk"
    echo ""
    echo "📲 WhatsApp Sharing Instructions:"
    echo "1. Transfer the APK file to your phone"
    echo "2. Open WhatsApp and go to the client chat"
    echo "3. Tap the attachment (📎) icon"
    echo "4. Select 'Document' and choose the APK file"
    echo "5. Add message: 'Here's the latest Elora Mobile App with camera functionality'"
    echo ""
    echo "⚠️  Note: Client needs to enable 'Install from Unknown Sources' in Android settings"
    
else
    echo "❌ Build failed! Check the error messages above."
    exit 1
fi