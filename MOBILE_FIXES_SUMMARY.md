# Mobile App Issues Fixed

## Issue 1: Total Cost Visibility in Store Screen

### Problem
In the store screen list card, the total cost was showing for all users including recce and installation roles, but it should only be visible to super admins and managers.

### Root Cause
The store screen was not using the `canViewCommercialInfo()` function to check if the user has permission to view commercial information.

### Solution
- Added `canViewCommercialInfo` from the `useAuth` hook
- Wrapped the total cost display section with a conditional check: `{canViewCosts && (...)}` 
- Now only users with ADMIN, SUPER_ADMIN, or MANAGER roles can see the total cost information

### Files Modified
- `/src/screens/stores/StoresScreen.tsx`

### Code Changes
```typescript
// Added permission check
const { theme } = useTheme();
const { isAdmin, canViewCommercialInfo } = useAuth();
const isAdminUser = isAdmin();
const canViewCosts = canViewCommercialInfo();

// Wrapped total cost display with permission check
{canViewCosts && (
  <View>
    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Total Cost</Text>
    <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '600' }}>
      ₹{item.commercials?.totalCost?.toLocaleString() || '0'}
    </Text>
  </View>
)}
```

## Issue 2: Camera Selection and Icon Visibility in Recce Screen

### Problems
1. White background made some camera icons invisible due to poor contrast
2. No option to select which camera (front/back) to use
3. Camera opened directly to device camera without user choice

### Root Cause
The MeasurementCamera component:
- Used fixed back camera without user selection
- Had white/transparent icons on white background causing visibility issues
- Lacked camera selection UI

### Solutions

#### 2.1 Added Camera Selection Feature
- Added state for camera selector modal: `showCameraSelector` and `selectedCameraType`
- Modified `handleCapture` to show camera selector first before opening camera
- Added `handleCameraSelect` function to handle camera type selection
- Created camera selector modal with options for back and front camera

#### 2.2 Improved Icon Visibility
- Changed button backgrounds from `rgba(255,255,255,0.2)` to `rgba(0,0,0,0.8)` for better contrast
- Added stronger borders with `borderWidth: 2` and better border colors
- Enhanced button styling for better visibility on all backgrounds

### Files Modified
- `/src/components/MeasurementCamera.tsx`

### Code Changes

#### Camera Selection State
```typescript
const [showCameraSelector, setShowCameraSelector] = useState(false);
const [selectedCameraType, setSelectedCameraType] = useState<'back' | 'front'>('back');
```

#### Camera Selection Logic
```typescript
const handleCameraSelect = (cameraType: 'back' | 'front') => {
  setSelectedCameraType(cameraType);
  setShowCameraSelector(false);
  handleCapture();
};

const handleCapture = async () => {
  if (isCapturing) return;
  
  // Show camera selector first
  if (!showCameraSelector) {
    setShowCameraSelector(true);
    return;
  }
  
  setIsCapturing(true);
  // ... rest of capture logic
};
```

#### Camera Selector Modal
```typescript
{showCameraSelector && (
  <Modal visible={true} transparent={true} animationType="slide">
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' }}>
      <View style={{ backgroundColor: '#1F2937', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
          Select Camera
        </Text>
        
        <View style={{ flexDirection: 'row', gap: 16, justifyContent: 'center' }}>
          <TouchableOpacity onPress={() => handleCameraSelect('back')} style={{ backgroundColor: '#10B981', ... }}>
            <Camera size={20} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Back Camera</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => handleCameraSelect('front')} style={{ backgroundColor: '#3B82F6', ... }}>
            <Camera size={20} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Front Camera</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity onPress={() => setShowCameraSelector(false)} style={{ ... }}>
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
)}
```

#### Improved Button Styling
```typescript
// Before: Poor visibility
backgroundColor: 'rgba(255,255,255,0.2)',
borderWidth: 1,
borderColor: 'rgba(255,255,255,0.3)'

// After: Better visibility
backgroundColor: 'rgba(0,0,0,0.8)',
borderWidth: 2,
borderColor: 'rgba(255,255,255,0.3)'
```

## User Experience Improvements

### For Store Screen
- **RECCE/INSTALLATION users**: No longer see confusing cost information they don't need
- **ADMIN/MANAGER users**: Continue to see all commercial information as before
- **Better role-based access control**: Follows the same permissions as the web portal

### For Camera Functionality
- **Camera Selection**: Users can now choose between front and back camera before taking photos
- **Better Visibility**: All camera controls are now clearly visible with improved contrast
- **User Choice**: No more direct camera opening - users get to select their preferred camera first
- **Consistent UI**: Camera selector modal matches the app's design language

## Testing Recommendations

1. **Role-based Testing**: Test with different user roles (RECCE, INSTALLATION, ADMIN, MANAGER) to verify cost visibility
2. **Camera Testing**: Test camera selection on different devices to ensure both front and back cameras work
3. **UI Testing**: Test camera interface in different lighting conditions to verify icon visibility
4. **Permission Testing**: Verify that `canViewCommercialInfo()` function works correctly for all roles

## Impact

- **Security**: Sensitive commercial information is now properly protected based on user roles
- **Usability**: Camera functionality is more user-friendly with clear selection options
- **Accessibility**: Better contrast and visibility for all UI elements
- **Consistency**: Mobile app now matches web portal's permission system