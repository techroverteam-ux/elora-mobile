import { useRef, useState, useCallback } from 'react';
import { AudioContext, AudioManager } from 'react-native-audio-api';
import type { AudioBufferSourceNode, AudioBuffer } from 'react-native-audio-api';

export default function useAudioPlayer() {
  const audioContext = useRef(new AudioContext({ initSuspended: true }));
  const sourceNode = useRef<AudioBufferSourceNode | null>(null);
  const audioBuffer = useRef<AudioBuffer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const offset = useRef(0);
  const seekOffset = useRef(0);
  const playbackRate = useRef(1);
  const onPositionChanged = useRef<((offset: number) => void) | null>(null);

  const play = useCallback(async () => {
    if (isPlaying || !audioBuffer.current) {
      console.log('Play blocked - isPlaying:', isPlaying, 'hasBuffer:', !!audioBuffer.current);
      return;
    }

    try {
      console.log('Starting audio playback...');
      // Stop any existing source node first
      if (sourceNode.current) {
        sourceNode.current.stop(audioContext.current.currentTime);
        sourceNode.current = null;
      }

      if (audioContext.current.state === 'suspended') {
        console.log('Resuming audio context...');
        await audioContext.current.resume();
      }

      sourceNode.current = audioContext.current.createBufferSource({ pitchCorrection: true });
      sourceNode.current.buffer = audioBuffer.current;
      sourceNode.current.playbackRate.value = playbackRate.current;
      sourceNode.current.connect(audioContext.current.destination);

      if (seekOffset.current !== 0) {
        offset.current = Math.max(seekOffset.current + offset.current, 0);
        seekOffset.current = 0;
      }

      sourceNode.current.onPositionChanged = (event: { value: number }) => {
        offset.current = event.value;
        setCurrentTime(event.value);
        if (onPositionChanged.current && audioBuffer.current) {
          onPositionChanged.current(offset.current / audioBuffer.current.duration);
        }
      };

      sourceNode.current.onEnded = () => {
        console.log('Audio ended');
        setIsPlaying(false);
        offset.current = 0;
        setCurrentTime(0);
        AudioManager.setLockScreenInfo({ state: 'state_paused' });
      };

      sourceNode.current.start(audioContext.current.currentTime, offset.current);
      setIsPlaying(true);
      AudioManager.setLockScreenInfo({ state: 'state_playing' });
      console.log('Audio started successfully');
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const pause = useCallback(async () => {
    if (!isPlaying) {
      console.log('Pause blocked - not playing');
      return;
    }

    try {
      console.log('Pausing audio...');
      if (sourceNode.current) {
        sourceNode.current.onPositionChanged = null;
        sourceNode.current.onEnded = null;
        sourceNode.current.stop(audioContext.current.currentTime);
        sourceNode.current = null;
      }
      await audioContext.current.suspend();
      setIsPlaying(false);
      AudioManager.setLockScreenInfo({ state: 'state_paused' });
      console.log('Audio paused successfully');
    } catch (error) {
      console.error('Error pausing audio:', error);
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const seekBy = useCallback((seconds: number) => {
    const newOffset = offset.current + seconds;

    if (isPlaying) {
      sourceNode.current?.stop(audioContext.current.currentTime);
      offset.current = Math.max(newOffset, 0);
      seekOffset.current = 0;

      sourceNode.current = audioContext.current.createBufferSource({ pitchCorrection: true });
      sourceNode.current.buffer = audioBuffer.current!;
      sourceNode.current.playbackRate.value = playbackRate.current;
      sourceNode.current.connect(audioContext.current.destination);

      sourceNode.current.onPositionChanged = (event: { value: number }) => {
        offset.current = event.value;
        setCurrentTime(event.value);
        if (onPositionChanged.current && audioBuffer.current) {
          onPositionChanged.current(offset.current / audioBuffer.current.duration);
        }
      };

      sourceNode.current.start(audioContext.current.currentTime, offset.current);
    } else {
      offset.current = Math.max(newOffset, 0);
      seekOffset.current = 0;
    }
  }, [isPlaying]);

  const seekTo = useCallback((seconds: number) => {
    const newOffset = Math.max(seconds, 0);

    if (isPlaying) {
      sourceNode.current?.stop(audioContext.current.currentTime);
      offset.current = newOffset;
      seekOffset.current = 0;

      sourceNode.current = audioContext.current.createBufferSource({ pitchCorrection: true });
      sourceNode.current.buffer = audioBuffer.current!;
      sourceNode.current.playbackRate.value = playbackRate.current;
      sourceNode.current.connect(audioContext.current.destination);

      sourceNode.current.onPositionChanged = (event: { value: number }) => {
        offset.current = event.value;
        setCurrentTime(event.value);
        if (onPositionChanged.current && audioBuffer.current) {
          onPositionChanged.current(offset.current / audioBuffer.current.duration);
        }
      };

      sourceNode.current.start(audioContext.current.currentTime, offset.current);
    } else {
      offset.current = newOffset;
      seekOffset.current = 0;
      setCurrentTime(newOffset);
    }
  }, [isPlaying]);


  const loadBuffer = useCallback(async (url: string) => {
    console.log('Loading audio buffer from:', url);
    
    // Reset everything first to prevent conflicts
    try {
      if (sourceNode.current) {
        sourceNode.current.onEnded = null;
        sourceNode.current.onPositionChanged = null;
        sourceNode.current.stop(audioContext.current.currentTime);
      }
    } catch (error) {
      console.log('Stop error (safe to ignore):', error);
    }
    
    sourceNode.current = null;
    audioBuffer.current = null;
    setIsPlaying(false);
    setDuration(null);
    setCurrentTime(0);
    offset.current = 0;
    seekOffset.current = 0;
    
    try {
      // Add headers to handle CORS and authentication if needed
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'audio/*',
          'Cache-Control': 'no-cache',
        },
      });
      
      console.log('Fetch response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log('Array buffer size:', arrayBuffer.byteLength);
      
      if (arrayBuffer.byteLength === 0) {
        throw new Error('Empty audio file received');
      }
      
      const buffer = await audioContext.current.decodeAudioData(arrayBuffer);
      console.log('Audio decoded successfully, duration:', buffer.duration);
      
      audioBuffer.current = buffer;
      offset.current = 0;
      seekOffset.current = 0;
      playbackRate.current = 1;
      setDuration(buffer.duration);
      setCurrentTime(0);
      console.log('Audio buffer loaded and ready');
    } catch (err) {
      console.error('Error loading audio buffer:', err);
      console.error('Failed URL:', url);
      
      // Try fallback URL only if not already using it
      if (!url.includes('soundhelix.com')) {
        console.log('Trying fallback audio URL...');
        await loadBuffer('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
      } else {
        // If even fallback fails, set error state
        setDuration(null);
        setCurrentTime(0);
      }
    }
  }, []);

  const reset = useCallback(() => {
    console.log('Resetting audio player...');
    try {
      if (sourceNode.current) {
        sourceNode.current.onEnded = null;
        sourceNode.current.onPositionChanged = null;
        sourceNode.current.stop(audioContext.current.currentTime);
      }
    } catch (error) {
      console.log('Reset error (safe to ignore):', error);
    }
    sourceNode.current = null;
    audioBuffer.current = null;
    offset.current = 0;
    seekOffset.current = 0;
    playbackRate.current = 1;
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(null);
    console.log('Audio player reset complete');
  }, []);

  const setOnPositionChanged = useCallback((cb: ((offset: number) => void) | null) => {
    onPositionChanged.current = cb;
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return {
    play,
    pause,
    seekBy,
    seekTo,
    loadBuffer,
    reset,
    setOnPositionChanged,
    isPlaying,
    duration,
    currentTime,
    formatTime,
  };
}
