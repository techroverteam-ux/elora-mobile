#!/bin/bash

# Update App Icons Script for Elora
echo "🔄 Updating app icons to Elora..."

# Source icon path
SOURCE_ICON="src/assets/images/appicon.png"

# Check if source icon exists
if [ ! -f "$SOURCE_ICON" ]; then
    echo "❌ Source icon not found: $SOURCE_ICON"
    exit 1
fi

echo "✅ Found source icon: $SOURCE_ICON"

# Install imagemagick if not available (for resizing)
if ! command -v convert &> /dev/null; then
    echo "📦 Installing ImageMagick for icon resizing..."
    if command -v brew &> /dev/null; then
        brew install imagemagick
    else
        echo "❌ Please install ImageMagick manually"
        exit 1
    fi
fi

# iOS App Icons
echo "🍎 Updating iOS app icons..."
IOS_ICON_DIR="ios/GeetaBalSanskar/Images.xcassets/AppIcon.appiconset"

# iOS icon sizes
declare -A ios_sizes=(
    ["AppIcon-20.png"]="20x20"
    ["AppIcon-29.png"]="29x29"
    ["AppIcon-40.png"]="40x40"
    ["AppIcon-58.png"]="58x58"
    ["AppIcon-60.png"]="60x60"
    ["AppIcon-80.png"]="80x80"
    ["AppIcon-87.png"]="87x87"
    ["AppIcon-120.png"]="120x120"
    ["AppIcon-180.png"]="180x180"
    ["AppIcon-1024.png"]="1024x1024"
)

for filename in "${!ios_sizes[@]}"; do
    size="${ios_sizes[$filename]}"
    echo "  📱 Creating $filename ($size)"
    convert "$SOURCE_ICON" -resize "$size" "$IOS_ICON_DIR/$filename"
done

# Android App Icons
echo "🤖 Updating Android app icons..."

# Android icon sizes and directories
declare -A android_sizes=(
    ["mipmap-mdpi"]="48x48"
    ["mipmap-hdpi"]="72x72"
    ["mipmap-xhdpi"]="96x96"
    ["mipmap-xxhdpi"]="144x144"
    ["mipmap-xxxhdpi"]="192x192"
)

for dir in "${!android_sizes[@]}"; do
    size="${android_sizes[$dir]}"
    android_dir="android/app/src/main/res/$dir"
    
    echo "  📱 Creating icons for $dir ($size)"
    
    # Main launcher icon
    convert "$SOURCE_ICON" -resize "$size" "$android_dir/ic_launcher.png"
    
    # Round launcher icon
    convert "$SOURCE_ICON" -resize "$size" "$android_dir/ic_launcher_round.png"
    
    # Foreground icon (for adaptive icons)
    convert "$SOURCE_ICON" -resize "$size" "$android_dir/ic_launcher_foreground.png"
    
    # Monochrome icon (for themed icons)
    convert "$SOURCE_ICON" -resize "$size" -colorspace Gray "$android_dir/ic_launcher_monochrome.png"
done

# Create background for adaptive icons (solid color)
echo "🎨 Creating adaptive icon backgrounds..."
for dir in "${!android_sizes[@]}"; do
    size="${android_sizes[$dir]}"
    android_dir="android/app/src/main/res/$dir"
    
    # Create a solid color background (you can change the color)
    convert -size "$size" xc:"#FFFFFF" "$android_dir/ic_launcher_background.png"
done

echo "✅ App icons updated successfully!"
echo "🔄 Please clean and rebuild your project:"
echo "   iOS: cd ios && rm -rf build && cd .."
echo "   Android: cd android && ./gradlew clean && cd .."
echo "   React Native: npx react-native run-ios / npx react-native run-android"