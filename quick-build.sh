#!/bin/bash

echo "🚀 Quick Release Build..."

cd android && ./gradlew assembleRelease && cp app/build/outputs/apk/release/app-release.apk ../EloraMob-v1.3-release.apk

echo "✅ Done! APK: EloraMob-v1.3-release.apk"