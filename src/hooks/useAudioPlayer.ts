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
    if (isPlaying || !audioBuffer.current) return;

    setIsPlaying(true);
    if (audioContext.current.state === 'suspended') await audioContext.current.resume();

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

    sourceNode.current.start(audioContext.current.currentTime, offset.current);
    AudioManager.setLockScreenInfo({ state: 'state_playing' });
  }, [isPlaying]);

  const pause = useCallback(async () => {
    if (!isPlaying) return;

    sourceNode.current?.stop(audioContext.current.currentTime);
    await audioContext.current.suspend();
    AudioManager.setLockScreenInfo({ state: 'state_paused' });
    setIsPlaying(false);
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

  const loadBuffer = useCallback(async (url: string) => {
    const buffer = await fetch(url)
      .then(res => res.arrayBuffer())
      .then(arrBuf => audioContext.current.decodeAudioData(arrBuf))
      .catch(err => {
        console.error('Error decoding audio:', err);
        return null;
      });

    if (buffer) {
      audioBuffer.current = buffer;
      offset.current = 0;
      seekOffset.current = 0;
      playbackRate.current = 1;
      setDuration(buffer.duration);
      setCurrentTime(0);
    }
  }, []);

  const reset = useCallback(() => {
    if (sourceNode.current) {
      sourceNode.current.onEnded = null;
      sourceNode.current.onPositionChanged = null;
      sourceNode.current.stop(audioContext.current.currentTime);
    }
    sourceNode.current = null;
    audioBuffer.current = null;
    offset.current = 0;
    seekOffset.current = 0;
    playbackRate.current = 1;
    setIsPlaying(false);
    setCurrentTime(0);
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
    loadBuffer,
    reset,
    setOnPositionChanged,
    isPlaying,
    duration,
    currentTime,
    formatTime,
  };
}
