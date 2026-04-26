#!/bin/bash

echo "🧪 Testing Modern Download System"
echo "================================="

# Clear all caches
echo "1. Clearing caches..."
pkill -f "metro" || true
rm -rf /tmp/metro-* /tmp/react-native-* /tmp/haste-map-* ~/.metro || true
rm -rf node_modules/.cache || true

# Start Metro with reset cache
echo "2. Starting Metro with reset cache..."
npx react-native start --reset-cache &
METRO_PID=$!

echo "✅ Metro started (PID: $METRO_PID)"
echo ""
echo "📱 Now test the download functionality:"
echo ""
echo "1. Open your app and navigate to Clients screen"
echo "2. Click the green download button (should show modern UI)"
echo "3. Check for:"
echo "   - Toast notification at top: '📥 Starting Download'"
echo "   - Progress indicator on button"
echo "   - Success toast: '✅ Download Complete'"
echo "   - Modern success dialog with Open/Share options"
echo "   - File saved in Downloads folder"
echo ""
echo "🔍 Check console logs for:"
echo "   - 'SimpleDownloadService: Starting download'"
echo "   - Progress updates (25%, 50%, 75%, 100%)"
echo "   - 'Download complete: /path/to/file.xlsx'"
echo ""
echo "❌ If you see errors:"
echo "   - 'can only download http/https' = Fixed! (using blob handler)"
echo "   - Permission errors = Check Android permissions"
echo "   - File not found = Check Downloads folder"
echo ""
echo "Press Ctrl+C to stop Metro when done testing"

# Wait for user to stop
wait $METRO_PID