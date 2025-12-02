#!/bin/bash
echo "=== Checking for common React Native errors ==="
echo ""
echo "1. Checking for syntax errors in modified files..."
npx tsc --noEmit 2>&1 | head -20
echo ""
echo "2. To see live logs, run:"
echo "   iOS: npx react-native log-ios"
echo "   Android: npx react-native log-android"
