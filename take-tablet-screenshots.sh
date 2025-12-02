#!/bin/bash

# Script to take 10-inch tablet screenshots for Play Store
# Requirements: 16:9 or 9:16, 1080-7680px per side, PNG/JPEG, max 8MB

SCREENSHOT_DIR="./screenshots/tablet-10inch"
mkdir -p "$SCREENSHOT_DIR"

echo "📱 Taking 10-inch Tablet Screenshots..."
echo "Make sure your Pixel Tablet emulator is running!"
echo ""

# Check if device is connected
adb devices | grep -q "device$"
if [ $? -ne 0 ]; then
    echo "❌ No device connected. Please start the Pixel Tablet emulator first."
    exit 1
fi

echo "✅ Device connected"
echo ""
echo "Screenshots will be saved to: $SCREENSHOT_DIR"
echo ""
echo "Press ENTER to take each screenshot (or Ctrl+C to stop):"

for i in {1..8}; do
    read -p "Screenshot $i/8 - Press ENTER when ready..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    TEMP_FILE="/sdcard/screenshot_${TIMESTAMP}.png"
    LOCAL_FILE="$SCREENSHOT_DIR/tablet_screenshot_${i}.png"
    
    # Take screenshot
    adb shell screencap -p "$TEMP_FILE"
    
    # Pull screenshot
    adb pull "$TEMP_FILE" "$LOCAL_FILE"
    
    # Delete from device
    adb shell rm "$TEMP_FILE"
    
    # Crop to 16:9 (2560x1440) from center of 2560x1600
    # This removes 80px from top and 80px from bottom
    if command -v sips &> /dev/null; then
        echo "  Cropping to 16:9 aspect ratio (2560x1440)..."
        sips -c 1440 2560 "$LOCAL_FILE" --out "$LOCAL_FILE" > /dev/null 2>&1
    elif command -v convert &> /dev/null; then
        echo "  Cropping to 16:9 aspect ratio (2560x1440)..."
        convert "$LOCAL_FILE" -gravity center -crop 2560x1440+0+0 +repage "$LOCAL_FILE"
    else
        echo "  ⚠️  Install ImageMagick or use macOS sips for auto-cropping"
    fi
    
    # Check file size
    SIZE=$(du -h "$LOCAL_FILE" | cut -f1)
    echo "  ✅ Screenshot $i saved: $LOCAL_FILE ($SIZE)"
    echo ""
done

echo "🎉 All screenshots captured!"
echo "📁 Location: $SCREENSHOT_DIR"
echo ""
echo "Screenshot specifications:"
echo "  - Resolution: 2560 x 1440 (16:9)"
echo "  - Format: PNG"
echo "  - Ready for Play Store upload"
