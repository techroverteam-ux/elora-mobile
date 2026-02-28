#!/bin/bash

# CLI iOS Build Script
set -e

PROJECT_DIR="/Users/ashokverma/Documents/TechRover/GBS/GeetaFinal"
cd "$PROJECT_DIR"

echo "🚀 CLI iOS Build Starting..."

# Check if pod exists
if ! command -v pod &> /dev/null; then
    echo "❌ CocoaPods not found. Install with: gem install cocoapods --user-install"
    echo "Then add ~/.gem/ruby/*/bin to your PATH"
    exit 1
fi

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install --legacy-peer-deps

# Install pods
echo "🔧 Installing CocoaPods..."
cd ios
pod install --repo-update
cd ..

# Create build directory
mkdir -p build

# Build archive
echo "🏗️ Building iOS archive..."
cd ios
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