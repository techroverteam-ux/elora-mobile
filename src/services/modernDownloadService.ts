import { simpleDownloadService } from './simpleDownloadService';

interface DownloadRequest {
  blob?: Blob;
  url?: string;
  filename: string;
  title?: string;
  description?: string;
}

class ModernDownloadService {
  /**
   * Download Excel file with modern native experience
   */
  async downloadExcel(request: DownloadRequest): Promise<string> {
    const { filename, title, description } = request;
    
    // Only ensure .xlsx extension for Excel files
    const excelFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    
    return simpleDownloadService.downloadFile({
      ...request,
      filename: excelFilename,
    });
  }

  /**
   * Download any file type (preserves original extension)
   */
  async downloadFile(request: DownloadRequest): Promise<string> {
    // Use the filename as-is without modifying the extension
    return simpleDownloadService.downloadFile(request);
  }

  /**
   * Download from API endpoint (for existing API calls)
   */
  async downloadFromApi(apiCall: () => Promise<Blob>, filename: string, title?: string): Promise<string> {
    try {
      const blob = await apiCall();
      
      // Use downloadFile to preserve the original extension
      return this.downloadFile({
        blob,
        filename, // Keep original filename with extension
      });
    } catch (error) {
      console.error('API download error:', error);
      throw error;
    }
  }

  /**
   * Download from URL (for direct file URLs)
   */
  async downloadFromUrl(url: string, filename: string, title?: string): Promise<string> {
    // Use downloadFile to preserve the original extension
    return this.downloadFile({
      url,
      filename, // Keep original filename with extension
    });
  }

  /**
   * Check if file is currently downloading (simplified - always false for now)
   */
  isDownloading(filename: string): boolean {
    return false; // Simplified implementation
  }

  /**
   * Cancel active download (simplified - always false for now)
   */
  cancelDownload(filename: string): boolean {
    return false; // Simplified implementation
  }

  /**
   * Get active downloads count (simplified - always 0 for now)
   */
  getActiveDownloadsCount(): number {
    return 0; // Simplified implementation
  }
}

export const modernDownloadService = new ModernDownloadService();