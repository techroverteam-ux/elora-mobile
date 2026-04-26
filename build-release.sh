#!/bin/bash

echo "🚀 Building Elora Mobile Release APK"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Check if android directory exists
if [ ! -d "android" ]; then
    print_error "Android directory not found. This doesn't appear to be a React Native project."
    exit 1
fi

print_status "Starting release build process..."

# Step 1: Clean previous builds
print_status "1. Cleaning previous builds..."
rm -rf android/app/build/
rm -rf android/build/
rm -rf node_modules/.cache/
rm -rf /tmp/metro-*
rm -rf /tmp/react-native-*

print_success "Previous builds cleaned"

# Step 2: Install dependencies
print_status "2. Installing dependencies..."
if command -v bun &> /dev/null; then
    print_status "Using Bun for dependency installation..."
    bun install
else
    print_status "Using npm for dependency installation..."
    npm install
fi

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

print_success "Dependencies installed"

# Step 3: Check for keystore
print_status "3. Checking for release keystore..."
KEYSTORE_PATH="android/app/GBS_KEY.jks"

if [ ! -f "$KEYSTORE_PATH" ]; then
    print_warning "Release keystore not found at $KEYSTORE_PATH"
    print_status "Creating debug build instead..."
    BUILD_TYPE="debug"
else
    print_success "Release keystore found"
    BUILD_TYPE="release"
fi

# Step 4: Check gradle.properties for signing config
print_status "4. Checking signing configuration..."
GRADLE_PROPS="android/gradle.properties"

if [ "$BUILD_TYPE" = "release" ]; then
    if ! grep -q "MYAPP_UPLOAD_STORE_FILE" "$GRADLE_PROPS"; then
        print_warning "Release signing configuration not found in gradle.properties"
        print_status "Building debug version instead..."
        BUILD_TYPE="debug"
    else
        print_success "Release signing configuration found"
    fi
fi

# Step 5: Build the APK
print_status "5. Building $BUILD_TYPE APK..."
cd android

if [ "$BUILD_TYPE" = "release" ]; then
    print_status "Building release APK with signing..."
    ./gradlew assembleRelease --no-daemon --warning-mode all
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
    APK_NAME="elora-mobile-release.apk"
else
    print_status "Building debug APK..."
    ./gradlew assembleDebug --no-daemon --warning-mode all
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    APK_NAME="elora-mobile-debug.apk"
fi

BUILD_EXIT_CODE=$?
cd ..

if [ $BUILD_EXIT_CODE -ne 0 ]; then
    print_error "Build failed with exit code $BUILD_EXIT_CODE"
    exit 1
fi

# Step 6: Check if APK was created
if [ ! -f "android/$APK_PATH" ]; then
    print_error "APK file not found at android/$APK_PATH"
    exit 1
fi

print_success "APK built successfully!"

# Step 7: Copy APK to project root with meaningful name
print_status "6. Copying APK to project root..."
cp "android/$APK_PATH" "./$APK_NAME"

if [ $? -eq 0 ]; then
    print_success "APK copied to ./$APK_NAME"
else
    print_error "Failed to copy APK"
    exit 1
fi

# Step 8: Get APK information
print_status "7. Getting APK information..."
APK_SIZE=$(du -h "./$APK_NAME" | cut -f1)
APK_FULL_PATH=$(realpath "./$APK_NAME")

# Step 9: Display build summary
echo ""
echo "🎉 BUILD COMPLETED SUCCESSFULLY!"
echo "================================"
echo ""
echo "📱 APK Details:"
echo "   Type: $BUILD_TYPE"
echo "   File: $APK_NAME"
echo "   Size: $APK_SIZE"
echo "   Path: $APK_FULL_PATH"
echo ""

if [ "$BUILD_TYPE" = "release" ]; then
    echo "✅ This is a RELEASE build - ready for distribution"
    echo "   - Signed with release keystore"
    echo "   - Optimized and minified"
    echo "   - Production ready"
else
    echo "⚠️  This is a DEBUG build"
    echo "   - Not signed with release keystore"
    echo "   - For testing purposes only"
    echo "   - To create release build, ensure keystore is properly configured"
fi

echo ""
echo "📋 Next Steps:"
echo "   1. Test the APK on a device: adb install $APK_NAME"
echo "   2. Share the APK file for distribution"
if [ "$BUILD_TYPE" = "debug" ]; then
    echo "   3. Configure release keystore for production builds"
fi
echo ""

# Step 10: Optional - Install on connected device
read -p "🔌 Install APK on connected device? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Installing APK on connected device..."
    adb install -r "./$APK_NAME"
    
    if [ $? -eq 0 ]; then
        print_success "APK installed successfully on device!"
    else
        print_warning "Failed to install APK. Make sure device is connected and USB debugging is enabled."
    fi
fi

print_success "Release build process completed!"
echo "APK Location: $APK_FULL_PATH"