#!/bin/bash

# Quick fix for mobile API connection
echo "🔧 Fixing mobile API connection..."

# Clean and rebuild
echo "📱 Cleaning iOS build..."
cd ios && rm -rf build && cd ..

# Reset Metro cache
echo "🧹 Clearing Metro cache..."
npx react-native start --reset-cache &

# Wait for Metro to start
sleep 5

# Run iOS
echo "🚀 Starting iOS app..."
npx react-native run-ios

echo "✅ Mobile API fix applied!"