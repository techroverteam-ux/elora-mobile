#!/bin/bash

# TestFlight Build Script for Client Sharing
# GeetaBalSanskar iOS App

set -e

echo "🚀 Building for TestFlight..."

PROJECT_DIR="/Users/ashokverma/Documents/TechRover/GBS/GeetaFinal"
cd "$PROJECT_DIR"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# iOS setup
echo "🔧 Setting up iOS..."
cd ios
pod install
cd ..

# Build for TestFlight
echo "🏗️ Building archive..."
cd ios

xcodebuild archive \
  -workspace GeetaBalSanskar.xcworkspace \
  -scheme GeetaBalSanskar \
  -configuration Release \
  -archivePath ../build/GeetaBalSanskar.xcarchive \
  -destination "generic/platform=iOS" \
  -allowProvisioningUpdates

# Export for TestFlight
echo "📤 Exporting for TestFlight..."
xcodebuild -exportArchive \
  -archivePath ../build/GeetaBalSanskar.xcarchive \
  -exportPath ../build/testflight \
  -exportOptionsPlist ../TestFlightExportOptions.plist

echo "✅ Build complete!"
echo "📱 IPA location: build/testflight/GeetaBalSanskar.ipa"
echo "🔗 Upload to TestFlight to share with client"