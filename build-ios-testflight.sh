#!/bin/bash

# iOS TestFlight Build Script
set -e

PROJECT_DIR="/Users/ashokverma/Documents/TechRover/GBS/GeetaFinal"
cd "$PROJECT_DIR"

echo "🍎 Building iOS IPA for TestFlight..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Install iOS dependencies
echo "🔗 Installing iOS dependencies..."
export PATH="$HOME/.gem/ruby/2.6.0/bin:$PATH"
export LANG=en_US.UTF-8
cd ios && pod install && cd ..

# Build iOS archive
echo "🏗️ Building iOS archive..."
cd ios
xcodebuild -workspace GeetaBalSanskar.xcworkspace \
  -scheme GeetaBalSanskar \
  -configuration Release \
  -destination generic/platform=iOS \
  -archivePath build/GeetaBalSanskar.xcarchive \
  archive

# Export IPA
echo "📦 Exporting IPA..."
xcodebuild -exportArchive \
  -archivePath build/GeetaBalSanskar.xcarchive \
  -exportPath build \
  -exportOptionsPlist ExportOptions.plist

cd ..

echo "✅ Build complete!"
echo ""
echo "📱 IPA file location:"
echo "ios/build/GeetaBalSanskar.ipa"
echo ""
echo "📤 Upload this IPA file to TestFlight via App Store Connect"