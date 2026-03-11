// Logger utility to manage console logs
class Logger {
  private static isDevelopment = __DEV__;
  
  static log(...args: any[]) {
    if (this.isDevelopment) {
      console.log(...args);
    }
  }
  
  static error(...args: any[]) {
    if (this.isDevelopment) {
      console.error(...args);
    }
  }
  
  static warn(...args: any[]) {
    if (this.isDevelopment) {
      console.warn(...args);
    }
  }
  
  static info(...args: any[]) {
    if (this.isDevelopment) {
      console.info(...args);
    }
  }
  
  static debug(...args: any[]) {
    if (this.isDevelopment) {
      console.debug(...args);
    }
  }
  
  // Disable all console logs (useful for production or when debugging LogBox issues)
  static disableAll() {
    console.log = () => {};
    console.error = () => {};
    console.warn = () => {};
    console.info = () => {};
    console.debug = () => {};
  }
  
  // Re-enable console logs
  static enableAll() {
    // Console methods are global, no need to require
    // Just remove the disable overrides if any
  }
}

export default Logger;