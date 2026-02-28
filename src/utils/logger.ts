import RNFS from 'react-native-fs';

class Logger {
  private static logFile = `${RNFS.DocumentDirectoryPath}/app_logs.txt`;

  private static async writeToFile(logEntry: string) {
    try {
      const exists = await RNFS.exists(this.logFile);
      if (!exists) {
        await RNFS.writeFile(this.logFile, '', 'utf8');
      }
      await RNFS.appendFile(this.logFile, logEntry + '\n', 'utf8');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  static log(step: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `🔍 [${timestamp}] ${step}: ${message}`;
    console.log(logEntry);
    this.writeToFile(logEntry);
    
    if (data) {
      const dataEntry = `📊 Data: ${JSON.stringify(data, null, 2)}`;
      console.log(dataEntry);
      this.writeToFile(dataEntry);
    }
  }

  static error(step: string, message: string, error?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `❌ [${timestamp}] ${step}: ${message}`;
    console.error(logEntry);
    this.writeToFile(logEntry);
    
    if (error) {
      const errorEntry = `💥 Error: ${error}`;
      const stackEntry = `📋 Stack: ${error?.stack}`;
      const detailsEntry = `🔧 Details: ${JSON.stringify(error, null, 2)}`;
      
      console.error(errorEntry);
      console.error(stackEntry);
      console.error(detailsEntry);
      
      this.writeToFile(errorEntry);
      this.writeToFile(stackEntry);
      this.writeToFile(detailsEntry);
    }
  }

  static success(step: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `✅ [${timestamp}] ${step}: ${message}`;
    console.log(logEntry);
    this.writeToFile(logEntry);
    
    if (data) {
      const dataEntry = `📊 Data: ${JSON.stringify(data, null, 2)}`;
      console.log(dataEntry);
      this.writeToFile(dataEntry);
    }
  }

  static warn(step: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `⚠️ [${timestamp}] ${step}: ${message}`;
    console.warn(logEntry);
    this.writeToFile(logEntry);
    
    if (data) {
      const dataEntry = `📊 Data: ${JSON.stringify(data, null, 2)}`;
      console.warn(dataEntry);
      this.writeToFile(dataEntry);
    }
  }

  static async getLogFile(): Promise<string> {
    return this.logFile;
  }

  static async clearLogs() {
    try {
      await RNFS.writeFile(this.logFile, '', 'utf8');
    } catch (error) {
      console.error('Failed to clear log file:', error);
    }
  }
}

export default Logger;