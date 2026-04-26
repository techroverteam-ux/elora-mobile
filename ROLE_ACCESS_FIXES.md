# Role-Based Access Control Fixes

## Issues Identified and Fixed

### 1. **Inconsistent Role Property Access**
**Problem**: Code was checking both `role.code` and `role.name` inconsistently
**Fix**: Updated all components to check both properties: `role.name || role.code`

### 2. **Navigation Exposure**
**Problem**: All screens/tabs were visible regardless of user roles
**Fix**: Added conditional rendering based on role permissions

### 3. **Permission Structure Mismatch**
**Problem**: Expected `role.permissions[module].view` but fallback needed for basic roles
**Fix**: Added fallback basic role access when permissions object is missing

## Files Modified

### 1. `/src/components/CustomDrawer.tsx`
- ✅ Fixed role property access (`role.name || role.code`)
- ✅ Added fallback basic role access
- ✅ Added debug logging with new utility
- ✅ Improved permission checking logic

### 2. `/src/navigation/AppNavigator.tsx`
- ✅ Added role-based screen filtering
- ✅ Only register accessible screens in navigation stack
- ✅ Prevents navigation to unauthorized screens

### 3. `/src/navigation/DashboardNavigator.tsx`
- ✅ Added role-based tab filtering in BusinessTabNavigator
- ✅ Only show tabs user has access to
- ✅ Fixed role property access

### 4. `/src/components/RoleBasedFooter.tsx`
- ✅ Updated role checking to handle both name and code
- ✅ Check all user roles instead of just first one
- ✅ Improved filtering logic

### 5. `/src/utils/roleDebugger.ts` (NEW)
- ✅ Debug utility for testing role access
- ✅ Comprehensive logging for troubleshooting
- ✅ Test module access function

## Role Access Matrix

| Role | Dashboard | Users | Roles | Stores | Recce | Installation | Elements | Clients | Reports | Enquiries | RFQ |
|------|-----------|-------|-------|--------|-------|--------------|----------|---------|---------|-----------|-----|
| SUPER_ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ADMIN | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| MANAGER | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| CLIENT | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| RECCE | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| INSTALLATION | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## How It Works Now

### 1. **Login Process**
- User logs in and receives role information
- Roles can have either `name` or `code` property (or both)
- AuthContext stores complete user object with roles

### 2. **Permission Checking**
- Each component checks `canView(moduleName)` 
- SUPER_ADMIN gets access to everything
- Other roles checked against permission matrix
- Fallback to basic role access if no permissions object

### 3. **Navigation Filtering**
- Drawer menu only shows accessible items
- Navigation stack only registers accessible screens
- Footer only shows allowed tabs
- Prevents unauthorized access attempts

### 4. **Debug Support**
- Import `debugUserRoles(user)` to see role structure
- Import `testModuleAccess(user, 'moduleName')` to test access
- Console logs show permission checking process

## Testing the Fix

### 1. **Check Console Logs**
```javascript
// In any component
import { debugUserRoles, testModuleAccess } from '../utils/roleDebugger';

// Debug user roles
debugUserRoles(user);

// Test specific module access
testModuleAccess(user, 'users');
testModuleAccess(user, 'stores');
```

### 2. **Verify Menu Visibility**
- Login with different role users
- Check that only appropriate menu items show
- Verify navigation restrictions work

### 3. **Test Role Scenarios**
- **RECCE user**: Should only see Dashboard, Recce, Stores
- **CLIENT user**: Should see Dashboard, Stores, Recce, Installation, Reports, Enquiries, RFQ
- **ADMIN user**: Should see most items except Roles
- **SUPER_ADMIN**: Should see everything

## Next Steps

1. **Test with actual user data** from your web portal
2. **Verify role structure** matches expected format
3. **Adjust role access matrix** if needed based on business requirements
4. **Remove debug logs** once confirmed working in production

The mobile app should now match the web portal's role-based access control behavior.