# Network Request Failed - Fix

## Problem
Mobile app shows "Network request failed" but API is working (tested with curl).

## Root Cause
React Native network security or emulator configuration issue.

## Solutions

### 1. Clear Metro Cache
```bash
cd /Users/ashokverma/Documents/TechRover/GBS/GeetaFinal
npm start -- --reset-cache
```

### 2. Rebuild Android App
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### 3. Check Emulator Internet
- Open Chrome in emulator
- Try: https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api/mobile/sections
- If it doesn't load, emulator has no internet

### 4. Use Physical Device
- Enable USB debugging
- Connect device
- Run: `npx react-native run-android --device`

### 5. Add Fetch Polyfill (if needed)
```bash
npm install whatwg-fetch
```

Then in `index.js`:
```javascript
import 'whatwg-fetch';
```

## Quick Test
Run this in your app to test network:
```javascript
fetch('https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api/mobile/sections')
  .then(res => res.json())
  .then(data => console.log('✅ API Working:', data))
  .catch(err => console.log('❌ Error:', err));
```

## Verified Working Endpoints
✅ /api/mobile/sections
✅ /api/mobile/sections/{id}/categories  
✅ /api/mobile/dashboard
✅ /api/categories/list/all
✅ /api/mobile/trending

All return valid JSON data when tested with curl.
