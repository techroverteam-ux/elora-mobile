#!/bin/bash

# CLI Build Fix Script
set -e

PROJECT_DIR="/Users/ashokverma/Documents/TechRover/GBS/GeetaFinal"
cd "$PROJECT_DIR"

echo "🔧 Fixing iOS build dependencies..."

# Clean everything
echo "🧹 Cleaning project..."
rm -rf node_modules
rm -rf ios/Pods
rm -rf ios/build
rm -rf build
rm -f ios/Podfile.lock

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install --legacy-peer-deps

# Install CocoaPods if not available
if ! command -v pod &> /dev/null; then
    echo "📥 Installing CocoaPods..."
    gem install cocoapods --user-install
    export PATH="$HOME/.gem/ruby/*/bin:$PATH"
fi

# Install pods
echo "🔧 Installing CocoaPods dependencies..."
cd ios
pod deintegrate || true
pod install --repo-update
cd ..

# Clean Xcode derived data
echo "🗑️ Cleaning Xcode cache..."
rm -rf ~/Library/Developer/Xcode/DerivedData/GeetaBalSanskar-*

# Build for device (Release)
echo "🏗️ Building for iOS device..."
cd ios
xcodebuild clean -workspace GeetaBalSanskar.xcworkspace -scheme GeetaBalSanskar
xcodebuild archive \
  -workspace GeetaBalSanskar.xcworkspace \
  -scheme GeetaBalSanskar \
  -configuration Release \
  -archivePath ../build/GeetaBalSanskar.xcarchive \
  -destination "generic/platform=iOS" \
  -allowProvisioningUpdates \
  CODE_SIGN_STYLE=Automatic

# Export IPA
echo "📤 Exporting IPA..."
xcodebuild -exportArchive \
  -archivePath ../build/GeetaBalSanskar.xcarchive \
  -exportPath ../build/export \
  -exportOptionsPlist ../AdHocExportOptions.plist

echo "✅ Build complete!"
echo "📱 IPA: build/export/GeetaBalSanskar.ipa"
ls -la ../build/export/