// Permission configuration for development and production
export const PERMISSION_CONFIG = {
  // Set to true to disable permissions for testing/development
  // Set to false for production builds
  TESTING_MODE: false,
  
  // Individual permission testing overrides
  DISABLE_CAMERA_PERMISSIONS: false,
  DISABLE_STORAGE_PERMISSIONS: false,
  DISABLE_LOCATION_PERMISSIONS: false,
  
  // Logging level
  VERBOSE_LOGGING: true,
};

// Helper function to check if we're in testing mode
export const isTestingMode = () => {
  return __DEV__ && PERMISSION_CONFIG.TESTING_MODE;
};

// Helper function to check if specific permission should be bypassed
export const shouldBypassPermission = (permissionType: 'camera' | 'storage' | 'location') => {
  if (!__DEV__) return false; // Never bypass in production
  
  switch (permissionType) {
    case 'camera':
      return PERMISSION_CONFIG.DISABLE_CAMERA_PERMISSIONS;
    case 'storage':
      return PERMISSION_CONFIG.DISABLE_STORAGE_PERMISSIONS;
    case 'location':
      return PERMISSION_CONFIG.DISABLE_LOCATION_PERMISSIONS;
    default:
      return false;
  }
};