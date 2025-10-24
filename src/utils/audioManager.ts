// Simple audio manager to prevent 409 conflicts
class AudioManager {
  private static instance: AudioManager;
  private currentAudioUrl: string | null = null;
  private isLoading: boolean = false;

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  canLoadAudio(url: string): boolean {
    // Prevent loading if already loading the same URL
    if (this.isLoading && this.currentAudioUrl === url) {
      console.log('Audio already loading:', url);
      return false;
    }
    return true;
  }

  setLoading(url: string, loading: boolean) {
    this.currentAudioUrl = url;
    this.isLoading = loading;
    console.log('Audio loading state:', { url, loading });
  }

  reset() {
    this.currentAudioUrl = null;
    this.isLoading = false;
    console.log('Audio manager reset');
  }
}

export default AudioManager;