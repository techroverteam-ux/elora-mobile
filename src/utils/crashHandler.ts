// Global error handler.
//
// Previously this monkey-patched Promise.prototype.catch (which silently
// swallowed rejections and logged every *handled* error as "Unhandled promise
// rejection") and wrapped console.error (which made every error in DevTools
// point at this file instead of the real source). Both removed.
//
// Now: log uncaught JS errors to the console, then hand them to React
// Native's default handler so the red-box / LogBox still shows in dev.
export const setupCrashHandler = () => {
  const ErrorUtilsRef = (globalThis as any).ErrorUtils;
  if (!ErrorUtilsRef?.getGlobalHandler) return;

  const defaultHandler = ErrorUtilsRef.getGlobalHandler();
  ErrorUtilsRef.setGlobalHandler((error: any, isFatal?: boolean) => {
    console.error(`[GlobalError]${isFatal ? ' (fatal)' : ''}`, error);
    defaultHandler?.(error, isFatal);
  });
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