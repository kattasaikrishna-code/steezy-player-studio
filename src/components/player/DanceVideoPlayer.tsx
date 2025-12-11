import React, { useRef, useState, useCallback, useEffect } from "react";
import ReactAllPlayer from "react-all-player";
import { VideoSection, ViewMode, LoopRange } from "@/types/player";
import { Timeline } from "./Timeline";
import { VideoControls } from "./VideoControls";
import { SectionsSidebar } from "./SectionsSidebar";
import { CameraPreview } from "./CameraPreview";
import { useCamera } from "@/hooks/useCamera";
import { useVideoLoop } from "@/hooks/useVideoLoop";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Metronome from "./CountMeter";

interface DanceVideoPlayerProps {
  sources: { front: string; back: string };
  sections: VideoSection[];
  poster?: string;
  title?: string;
}

export const DanceVideoPlayer: React.FC<DanceVideoPlayerProps> = ({
  sources,
  sections,
  poster,
  title,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("front");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCountMeter, setShowCountMeter] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  // Camera hook
  const {
    isCameraOn,
    toggleCamera,
    cameraError,
    attachStreamToVideo,
  } = useCamera();

  // Loop hook
  const {
    loopEnabled,
    loopRange,
    isSettingLoop,
    setLoopRange,
    clearLoop,
    toggleLoop,
    setLoopFromCurrentTime,
    setLoopEnabled,
  } = useVideoLoop({ videoRef, duration });

  // Handle video events
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleSeekRelative = useCallback(
    (seconds: number) => {
      if (videoRef.current) {
        const newTime = Math.max(
          0,
          Math.min(duration, videoRef.current.currentTime + seconds)
        );
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    },
    [duration]
  );

  const handleVolumeChange = useCallback((value: number) => {
    if (videoRef.current) {
      videoRef.current.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      toast.success(`Playback speed: ${rate}x`);
    }
  }, []);

  const handleFullscreenToggle = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  }, []);

  const handleMirrorToggle = useCallback(() => {
    setIsMirrored(!isMirrored);
    toast.success(isMirrored ? "Mirror mode off" : "Mirror mode on");
  }, [isMirrored]);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    if (!videoRef.current) return;
    
    const savedTime = videoRef.current.currentTime;
    const wasPlaying = !videoRef.current.paused;
    
    setViewMode(mode);
    
    // After source changes, restore the time position
    const video = videoRef.current;
    const handleLoadedData = () => {
      video.currentTime = savedTime;
      if (wasPlaying) {
        video.play();
      }
      video.removeEventListener('loadeddata', handleLoadedData);
    };
    video.addEventListener('loadeddata', handleLoadedData);
    
    toast.success(`Switched to ${mode} view`);
  }, []);

  const handleSectionClick = useCallback(
    (section: VideoSection) => {
      handleSeek(section.startTime);
      setActiveSection(section.id);
    },
    [handleSeek]
  );

  const handleLoopRangeChange = useCallback(
    (range: LoopRange) => {
      setLoopRange(range);
    },
    [setLoopRange]
  );

  const handleCameraToggle = useCallback(async () => {
    await toggleCamera();
    if (!isCameraOn) {
      toast.success("Camera turned on");
    }
  }, [toggleCamera, isCameraOn]);

  // Camera error toast
  useEffect(() => {
    if (cameraError) {
      toast.error(cameraError);
    }
  }, [cameraError]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          handlePlayPause();
          break;
        case "arrowleft":
          handleSeekRelative(-5);
          break;
        case "arrowright":
          handleSeekRelative(5);
          break;
        case "m":
          handleMuteToggle();
          break;
        case "f":
          handleFullscreenToggle();
          break;
        case "l":
          toggleLoop();
          break;
        case "h":
          handleMirrorToggle();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handlePlayPause,
    handleSeekRelative,
    handleMuteToggle,
    handleFullscreenToggle,
    toggleLoop,
    handleMirrorToggle,
  ]);

  // Controls visibility
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const showControls = () => {
      setControlsVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying) {
          setControlsVisible(false);
        }
      }, 3000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", showControls);
      container.addEventListener("mouseenter", showControls);
    }

    return () => {
      clearTimeout(timeout);
      if (container) {
        container.removeEventListener("mousemove", showControls);
        container.removeEventListener("mouseenter", showControls);
      }
    };
  }, [isPlaying]);

  const currentSource = viewMode === "front" ? sources.front : sources.back;

  return (
    <div className="flex h-full bg-background">
      {/* Main player area */}
      <div className="flex-1 flex flex-col">
        {/* Title bar */}
        {title && (
          <div className="px-6 py-6 border-b border-border">
            <h1 className="font-display text-2xl tracking-wide">{title}</h1>
          </div>
        )}
        {!showSidebar && !showCountMeter && (
          <button
            className="absolute top-6 right-6 z-10 px-4 py-2 bg-card/80 backdrop-blur-sm rounded-lg text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            View Sections
          </button>
        )}

        {!showCountMeter && !showSidebar && (
          <button
            className="absolute top-6 right-8 mr-[8rem] z-10 px-4 py-2 bg-card/80 backdrop-blur-sm rounded-lg text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
            onClick={() => setShowCountMeter(!showCountMeter)}
          >
            Count Meter
          </button>
        )}

        {/* Video container */}
        <div
          ref={containerRef}
          className={cn(
            "relative flex-1 bg-player-bg overflow-hidden",
            "group"
          )}
        >
          {/* Video element */}
          <video
            ref={videoRef}
            src={currentSource}
            poster={poster}
            className={cn(
              "w-full h-full object-contain",
              isMirrored && "scale-x-[-1]"
            )}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={handlePlayPause}
          />

          {/* Camera preview */}
          {isCameraOn && (
            <CameraPreview
              isMirrored={isMirrored}
              onClose={handleCameraToggle}
              onVideoRef={attachStreamToVideo}
            />
          )}

          {/* View mode indicator */}
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-card/80 backdrop-blur-sm rounded-lg text-sm font-medium">
            {viewMode.toUpperCase()} VIEW
          </div>

          {/* Loop indicator */}
          {loopEnabled && (
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-primary/80 backdrop-blur-sm rounded-lg text-sm font-medium text-primary-foreground flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
              LOOP
            </div>
          )}

          {/* Controls overlay */}
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent",
              "p-4 transition-opacity duration-300",
              controlsVisible ? "opacity-100" : "opacity-0"
            )}
          >
            {/* Timeline */}
            <Timeline
              currentTime={currentTime}
              duration={duration}
              loopRange={loopRange}
              loopEnabled={loopEnabled}
              sections={sections}
              onSeek={handleSeek}
              onLoopRangeChange={handleLoopRangeChange}
            />

            {/* Control buttons */}
            <VideoControls
              isPlaying={isPlaying}
              isMuted={isMuted}
              volume={volume}
              isFullscreen={isFullscreen}
              isMirrored={isMirrored}
              isCameraOn={isCameraOn}
              viewMode={viewMode}
              loopEnabled={loopEnabled}
              isSettingLoop={isSettingLoop}
              playbackRate={playbackRate}
              currentTime={currentTime}
              duration={duration}
              onPlayPause={handlePlayPause}
              onMuteToggle={handleMuteToggle}
              onVolumeChange={handleVolumeChange}
              onFullscreenToggle={handleFullscreenToggle}
              onMirrorToggle={handleMirrorToggle}
              onCameraToggle={handleCameraToggle}
              onViewModeChange={handleViewModeChange}
              onLoopToggle={toggleLoop}
              onClearLoop={clearLoop}
              onSetLoopPoint={setLoopFromCurrentTime}
              onPlaybackRateChange={handlePlaybackRateChange}
              onSeekRelative={handleSeekRelative}
            />
          </div>
        </div>
      </div>

      {/* Sections sidebar */}
      {showSidebar && (
        <SectionsSidebar
          sections={sections}
          currentTime={currentTime}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
          setShowSidebar={setShowSidebar}
        />
      )}
      {showCountMeter && <Metronome setShowCountMeter={setShowCountMeter} />}
    </div>
  );
};
