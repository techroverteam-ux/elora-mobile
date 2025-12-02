#!/bin/bash

echo "🚀 Building Release APK/AAB for Google Play Store"
echo "=================================================="
echo ""

cd android

# Clean previous builds
echo "🧹 Cleaning previous builds..."
./gradlew clean

# Build Release AAB (Android App Bundle - required for Play Store)
echo ""
echo "📦 Building Release AAB..."
./gradlew bundleRelease

# Build Release APK (for testing)
echo ""
echo "📦 Building Release APK..."
./gradlew assembleRelease

echo ""
echo "✅ Build Complete!"
echo ""
echo "📁 Files created:"
echo "   AAB (Upload to Play Store):"
echo "   → android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "   APK (For testing):"
echo "   → android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "📊 File sizes:"
ls -lh app/build/outputs/bundle/release/app-release.aab 2>/dev/null | awk '{print "   AAB: " $5}'
ls -lh app/build/outputs/apk/release/app-release.apk 2>/dev/null | awk '{print "   APK: " $5}'
echo ""
echo "🎯 Next Steps:"
echo "   1. Test the APK on a device"
echo "   2. Upload app-release.aab to Google Play Console"
echo "   3. Fill in store listing details"
echo "   4. Submit for review"
