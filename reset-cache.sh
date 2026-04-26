#!/bin/bash

echo "🧹 Clearing all React Native caches..."

# Kill all Metro processes
echo "Killing Metro processes..."
pkill -f "metro" || true
pkill -f "react-native" || true

# Clear Metro cache
echo "Clearing Metro cache..."
rm -rf /tmp/metro-* || true
rm -rf /tmp/react-native-* || true
rm -rf /tmp/haste-map-* || true
rm -rf ~/.metro || true

# Clear node modules cache
echo "Clearing node modules cache..."
rm -rf node_modules/.cache || true

# Clear React Native cache
echo "Clearing React Native cache..."
npx react-native start --reset-cache --verbose &

echo "✅ Cache cleared! Metro is starting with reset cache..."
echo "📱 Now completely close and restart your app to see the changes!"
echo ""
echo "🔄 To see the changes:"
echo "1. Force close the app (don't just minimize)"
echo "2. Reopen the app"
echo "3. Try downloading a file"
echo ""
echo "🔍 Check the console logs for:"
echo "- 'FileService v2.1 - Starting download'"
echo "- 'ThemedAlertService v2.1 - Showing alert'"