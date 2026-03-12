import { Alert } from 'react-native';

// Global error handler to prevent app crashes
export const setupCrashHandler = () => {
  // Handle unhandled promise rejections
  const originalHandler = global.Promise.prototype.catch;
  global.Promise.prototype.catch = function(onRejected) {
    return originalHandler.call(this, (error) => {
      console.warn('Unhandled promise rejection:', error);
      if (onRejected) {
        return onRejected(error);
      }
      // Don't crash the app
      return Promise.resolve();
    });
  };

  // Handle React Native errors
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Log the error but don't crash
    originalConsoleError(...args);
    
    // Check if it's a critical error that might crash the app
    const errorMessage = args.join(' ');
    if (errorMessage.includes('Permission') || 
        errorMessage.includes('Camera') || 
        errorMessage.includes('Storage')) {
      console.warn('Permission-related error caught and handled');
    }
  };
};

// Safe wrapper for async operations
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage?: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.warn(errorMessage || 'Safe async operation failed:', error);
    return fallback;
  }
};

// Safe wrapper for permission requests
export const safePermissionRequest = async (
  permissionRequest: () => Promise<boolean>
): Promise<boolean> => {
  try {
    return await permissionRequest();
  } catch (error) {
    console.warn('Permission request failed safely:', error);
    return false; // Return false instead of crashing
  }
};