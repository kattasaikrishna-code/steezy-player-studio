import { useState, useCallback, useEffect, useRef } from "react";
import { QualitySources, ViewMode, VideoQuality } from "@/types/player";
import { useNetworkSpeed } from "./useNetworkStatus";
import { toast } from "sonner";

interface UseAdaptiveQualityProps {
  sources: QualitySources;
  videoRefFront: React.RefObject<HTMLVideoElement>;
  videoRefBack: React.RefObject<HTMLVideoElement>;
  viewMode: ViewMode;
  isPlaying: boolean;
}

export const useAdaptiveQuality = ({
  sources,
  videoRefFront,
  videoRefBack,
  viewMode,
  isPlaying,
}: UseAdaptiveQualityProps) => {
  const [currentQualityIndex, setCurrentQualityIndex] = useState(0);
  const [autoQuality, setAutoQuality] = useState(true);
  const networkInfo = useNetworkSpeed();
  const lastQualityChangeRef = useRef<number>(0);

  const qualities = viewMode === "front" ? sources.front : sources.back;
  const currentQualityLabel = qualities[currentQualityIndex]?.label || "Auto";

  const setQuality = useCallback(
    (index: number) => {
      setAutoQuality(false);
      setCurrentQualityIndex(index);
      toast.info(`Quality set to ${qualities[index].label}`);
    },
    [qualities]
  );

  const toggleAutoQuality = useCallback(() => {
    setAutoQuality((prev) => !prev);
    toast.info(`Auto quality ${!autoQuality ? "enabled" : "disabled"}`);
  }, [autoQuality]);

  // Synchronize playback between videos when switching quality is NOT needed here
  // but we might need to sync the CURRENT video when quality changes if we were
  // changing the SRC attribute. DanceVideoPlayer already handles src change
  // and syncs in handleViewModeChange, but what about quality change?
  // When src changes, the video element will reload. We need to preserve currentTime.

  const prevSrcRef = useRef<string>("");
  const activeVideoRef = viewMode === "front" ? videoRefFront : videoRefBack;

  useEffect(() => {
    const currentSrc = qualities[currentQualityIndex]?.src;
    if (currentSrc && currentSrc !== prevSrcRef.current) {
      const video = activeVideoRef.current;
      if (video && prevSrcRef.current !== "") {
        const time = video.currentTime;
        const wasPlaying = !video.paused;

        // The src change happens via props in DanceVideoPlayer,
        // but we need to ensure we restore state.
        // Actually, DanceVideoPlayer handles currentFrontSrc/currentBackSrc.
        // We just need to make sure the video element doesn't reset to 0.

        const handleLoadedMetadata = () => {
          video.currentTime = time;
          if (wasPlaying) video.play().catch(console.error);
          video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        };

        video.addEventListener("loadedmetadata", handleLoadedMetadata);
      }
      prevSrcRef.current = currentSrc;
    }
  }, [currentQualityIndex, qualities, activeVideoRef]);

  // Adaptive logic
  useEffect(() => {
    if (!autoQuality || !isPlaying) return;

    // Throttle quality changes to avoid flickering (every 5 seconds)
    const now = Date.now();
    if (now - lastQualityChangeRef.current < 5000) return;

    const currentBitrate = networkInfo.speed * 1000; // Mbps to kbps

    // Find best quality for current speed
    let bestIndex = qualities.length - 1; // Default to lowest
    for (let i = 0; i < qualities.length; i++) {
      // Bitrate is defined in the source, if current speed > bitrate * 1.5 (safety margin)
      if (currentBitrate > qualities[i].bitrate * 1.2) {
        bestIndex = i;
        break;
      }
    }

    if (bestIndex !== currentQualityIndex) {
      setCurrentQualityIndex(bestIndex);
      lastQualityChangeRef.current = now;
      console.log(
        `Auto-switched quality to ${qualities[bestIndex].label} based on speed ${networkInfo.speed}Mbps`
      );
    }
  }, [
    autoQuality,
    networkInfo.speed,
    isPlaying,
    qualities,
    currentQualityIndex,
  ]);

  return {
    currentQualityIndex,
    currentQualityLabel,
    autoQuality,
    qualities,
    setQuality,
    toggleAutoQuality,
  };
};
