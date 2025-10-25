#!/bin/bash

echo "🚀 Setting up iOS development environment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# iOS specific setup
echo "🍎 Setting up iOS..."
cd ios

# Clean iOS build artifacts
rm -rf build
rm -rf Pods
rm -f Podfile.lock

# Check if CocoaPods is installed
if ! command -v pod &> /dev/null; then
    echo "⚠️  CocoaPods not found. Please install it manually:"
    echo "   sudo gem install cocoapods"
    echo "   Then run: cd ios && pod install"
else
    echo "📱 Installing iOS pods..."
    pod install --repo-update
fi

cd ..

# Fix common React Native issues
echo "🔧 Fixing common issues..."

# Clear Metro cache
npx react-native start --reset-cache &
METRO_PID=$!
sleep 3
kill $METRO_PID 2>/dev/null

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. If CocoaPods installation failed, run: sudo gem install cocoapods"
echo "2. Then run: cd ios && pod install"
echo "3. Start Metro: npm start"
echo "4. Run iOS: npm run ios"
echo ""
echo "🔍 Troubleshooting:"
echo "- If you get 500 errors, check your API endpoints"
echo "- If iOS build fails, try: cd ios && xcodebuild clean"
echo "- For permission issues: Check Info.plist permissions"