import { useState, useCallback, useEffect } from "react";
import { LoopRange, ViewMode } from "@/types/player";

interface UseVideoLoopProps {
  videoRefFront: React.RefObject<HTMLVideoElement>;
  videoRefBack: React.RefObject<HTMLVideoElement>;
  viewMode: ViewMode;
  duration: number;
}

export const useVideoLoop = ({ videoRefFront, videoRefBack, viewMode, duration }: UseVideoLoopProps) => {
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [loopRange, setLoopRange] = useState<LoopRange | null>(null);
  const [isSettingLoop, setIsSettingLoop] = useState(false);

  // Get the current active video ref
  const getActiveVideo = useCallback(() => {
    return viewMode === "front" ? videoRefFront.current : videoRefBack.current;
  }, [viewMode, videoRefFront, videoRefBack]);

  const setLoopStart = useCallback(
    (time: number) => {
      setLoopRange((prev) => ({
        start: time,
        end: prev?.end ?? duration,
      }));
    },
    [duration]
  );

  const setLoopEnd = useCallback((time: number) => {
    setLoopRange((prev) => ({
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
    const video = getActiveVideo();
    if (!video) return;

    setLoopEnabled((prev) => {
      if (prev) {
        return false;
      } else {
        const currentTime = video.currentTime;
        const endTime = Math.min(currentTime + 10, duration);
        setLoopRange({
          start: currentTime <= 10 ? 0 : currentTime - 10,
          end: endTime,
        });
        setIsSettingLoop(false);
        return true;
      }
    });
  }, [getActiveVideo, duration]);

  const setLoopFromCurrentTime = useCallback(() => {
    const video = getActiveVideo();
    if (!video) return;

    const currentTime = video.currentTime;
    const endTime = Math.min(currentTime + 15, duration);

    setLoopRange({ start: currentTime, end: endTime });
    setLoopEnabled(true);
    setIsSettingLoop(false);
  }, [getActiveVideo, duration]);

  // Use timeupdate event for loop checking - better Mac compatibility
  useEffect(() => {
    if (!loopEnabled || !loopRange) return;

    const handleTimeUpdate = (video: HTMLVideoElement) => {
      if (!loopRange || !video) return;
      
      const currentTime = video.currentTime;
      
      // Only handle loop bounds for the active video
      if (currentTime >= loopRange.end - 0.1) {
        video.currentTime = loopRange.start;
      } else if (currentTime < loopRange.start - 0.5) {
        video.currentTime = loopRange.start;
      }
    };

    const frontVideo = videoRefFront.current;
    const backVideo = videoRefBack.current;

    const frontHandler = () => {
      if (viewMode === "front" && frontVideo) {
        handleTimeUpdate(frontVideo);
      }
    };
    
    const backHandler = () => {
      if (viewMode === "back" && backVideo) {
        handleTimeUpdate(backVideo);
      }
    };

    if (frontVideo) {
      frontVideo.addEventListener("timeupdate", frontHandler);
    }
    if (backVideo) {
      backVideo.addEventListener("timeupdate", backHandler);
    }

    return () => {
      if (frontVideo) {
        frontVideo.removeEventListener("timeupdate", frontHandler);
      }
      if (backVideo) {
        backVideo.removeEventListener("timeupdate", backHandler);
      }
    };
  }, [loopEnabled, loopRange, videoRefFront, videoRefBack, viewMode]);

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
