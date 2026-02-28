#!/bin/bash

# Simple CLI Build Command
PROJECT_DIR="/Users/ashokverma/Documents/TechRover/GBS/GeetaFinal"
cd "$PROJECT_DIR"

echo "🏗️ Building iOS app via CLI..."

# Build directly with xcodebuild
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
xcodebuild -exportArchive \
  -archivePath ../build/GeetaBalSanskar.xcarchive \
  -exportPath ../build/export \
  -exportOptionsPlist ../AdHocExportOptions.plist

echo "✅ Build complete!"
echo "📱 IPA: build/export/GeetaBalSanskar.ipa"