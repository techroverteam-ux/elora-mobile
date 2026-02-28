#!/bin/bash

# iOS App Store Build Script for GeetaBalSanskar
# This script builds the app for TestFlight and App Store deployment

set -e

echo "🚀 Starting iOS App Store Build Process..."

# Configuration
PROJECT_DIR="/Users/ashokverma/Documents/TechRover/GBS/GeetaFinal"
IOS_DIR="$PROJECT_DIR/ios"
SCHEME="GeetaBalSanskar"
WORKSPACE="GeetaBalSanskar.xcworkspace"
CONFIGURATION="Release"
ARCHIVE_PATH="$PROJECT_DIR/build/GeetaBalSanskar.xcarchive"
EXPORT_PATH="$PROJECT_DIR/build/export"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    print_error "Xcode is not installed or xcodebuild is not in PATH"
    exit 1
fi

# Check if we're in the right directory
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Project directory not found: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

# Check Node.js and npm
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_status "Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps
print_status "Dependencies installed"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf "$PROJECT_DIR/build"
mkdir -p "$PROJECT_DIR/build"

# Clean iOS build
cd "$IOS_DIR"
xcodebuild clean -workspace "$WORKSPACE" -scheme "$SCHEME" -configuration "$CONFIGURATION"
print_status "Previous builds cleaned"

# Pod install
echo "🔧 Installing CocoaPods dependencies..."
pod install --repo-update
print_status "CocoaPods dependencies installed"

# Build the archive
echo "🏗️  Building archive for App Store..."
xcodebuild archive \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration "$CONFIGURATION" \
    -archivePath "$ARCHIVE_PATH" \
    -destination "generic/platform=iOS" \
    -allowProvisioningUpdates \
    CODE_SIGN_STYLE=Automatic \
    DEVELOPMENT_TEAM="YOUR_TEAM_ID" \
    | xcpretty

if [ ! -d "$ARCHIVE_PATH" ]; then
    print_error "Archive creation failed"
    exit 1
fi

print_status "Archive created successfully"

# Create ExportOptions.plist
echo "📝 Creating export options..."
cat > "$PROJECT_DIR/ExportOptions.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>destination</key>
    <string>export</string>
</dict>
</plist>
EOF

# Export IPA for App Store
echo "📤 Exporting IPA for App Store..."
xcodebuild -exportArchive \
    -archivePath "$ARCHIVE_PATH" \
    -exportPath "$EXPORT_PATH" \
    -exportOptionsPlist "$PROJECT_DIR/ExportOptions.plist" \
    -allowProvisioningUpdates \
    | xcpretty

if [ ! -f "$EXPORT_PATH/GeetaBalSanskar.ipa" ]; then
    print_error "IPA export failed"
    exit 1
fi

print_status "IPA exported successfully"

# Get app info
echo "📋 App Information:"
echo "   Archive: $ARCHIVE_PATH"
echo "   IPA: $EXPORT_PATH/GeetaBalSanskar.ipa"
echo "   Size: $(du -h "$EXPORT_PATH/GeetaBalSanskar.ipa" | cut -f1)"

# Optional: Upload to TestFlight
read -p "🚀 Do you want to upload to TestFlight? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 Uploading to TestFlight..."
    
    # Check if altool is available (deprecated) or use xcrun notarytool
    if command -v xcrun &> /dev/null; then
        # Use App Store Connect API key method (recommended)
        echo "Please ensure you have your App Store Connect API key configured"
        echo "Upload command:"
        echo "xcrun altool --upload-app -f \"$EXPORT_PATH/GeetaBalSanskar.ipa\" -t ios --apiKey YOUR_API_KEY --apiIssuer YOUR_ISSUER_ID"
        
        # Uncomment and configure the following line with your credentials:
        # xcrun altool --upload-app -f "$EXPORT_PATH/GeetaBalSanskar.ipa" -t ios --apiKey YOUR_API_KEY --apiIssuer YOUR_ISSUER_ID
        
        print_warning "Please configure your App Store Connect API credentials and uncomment the upload command"
    else
        print_error "xcrun not found. Please upload manually using Xcode or Transporter app"
    fi
fi

echo ""
print_status "Build process completed successfully! 🎉"
echo ""
echo "📱 Next steps:"
echo "   1. Test the IPA file: $EXPORT_PATH/GeetaBalSanskar.ipa"
echo "   2. Upload to TestFlight for internal testing"
echo "   3. Submit for App Store review"
echo ""
echo "📁 Build artifacts location: $PROJECT_DIR/build/"