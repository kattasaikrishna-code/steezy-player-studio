import { useState, useCallback, useEffect, useRef } from 'react';
import { LoopRange } from '@/types/player';

interface UseVideoLoopProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  duration: number;
}

export const useVideoLoop = ({ videoRef, duration }: UseVideoLoopProps) => {
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [loopRange, setLoopRange] = useState<LoopRange | null>(null);
  const [isSettingLoop, setIsSettingLoop] = useState(false);
  const loopCheckInterval = useRef<number | null>(null);

  const setLoopStart = useCallback((time: number) => {
    setLoopRange(prev => ({
      start: time,
      end: prev?.end ?? duration,
    }));
  }, [duration]);

  const setLoopEnd = useCallback((time: number) => {
    setLoopRange(prev => ({
      start: prev?.start ?? 0,
      end: time,
    }));
  }, []);

  const clearLoop = useCallback(() => {
    setLoopEnabled(false);
    setLoopRange(null);
    setIsSettingLoop(false);
  }, []);

  const toggleLoop = useCallback(() => {
    if (!videoRef.current) return;
    
    setLoopEnabled(prev => {
      if (prev) {
        // Currently enabled, disable it
        return false;
      } else {
        // Currently disabled, enable with new range
        const currentTime = videoRef.current!.currentTime;
        const endTime = Math.min(currentTime + 15, duration);
        setLoopRange({ start: currentTime, end: endTime });
        setIsSettingLoop(false);
        return true;
      }
    });
  }, [videoRef, duration]);

  const setLoopFromCurrentTime = useCallback(() => {
    if (!videoRef.current) return;
    
    const currentTime = videoRef.current.currentTime;
    const endTime = Math.min(currentTime + 15, duration);
    
    setLoopRange({ start: currentTime, end: endTime });
    setLoopEnabled(true);
    setIsSettingLoop(false);
  }, [videoRef, duration]);

  // Check if current time is outside loop range and loop back
  useEffect(() => {
    if (!loopEnabled || !loopRange || !videoRef.current) {
      if (loopCheckInterval.current) {
        clearInterval(loopCheckInterval.current);
        loopCheckInterval.current = null;
      }
      return;
    }

    loopCheckInterval.current = window.setInterval(() => {
      if (!videoRef.current || !loopRange) return;
      
      const currentTime = videoRef.current.currentTime;
      
      if (currentTime >= loopRange.end || currentTime < loopRange.start) {
        videoRef.current.currentTime = loopRange.start;
      }
    }, 100);

    return () => {
      if (loopCheckInterval.current) {
        clearInterval(loopCheckInterval.current);
      }
    };
  }, [loopEnabled, loopRange, videoRef]);

  return {
    loopEnabled,
    loopRange,
    isSettingLoop,
    setLoopStart,
    setLoopEnd,
    setLoopRange,
    clearLoop,
    toggleLoop,
    setLoopFromCurrentTime,
    setLoopEnabled,
  };
};
