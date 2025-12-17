import React, { useRef, useState, useCallback, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { VideoSection, ViewMode, LoopRange } from "@/types/player";
import { Timeline } from "./Timeline";
import { VideoControls } from "./VideoControls";
import { SectionsSidebar } from "./SectionsSidebar";
import { CameraPreview } from "./CameraPreview";
import { useCamera } from "@/hooks/useCamera";
import { useVideoLoop } from "@/hooks/useVideoLoop";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import CountMeter2 from "./CountMeter2";

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
  // 1. Refs
  const videoRefFront = useRef<HTMLVideoElement>(null);
  const videoRefBack = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 2. State
  const [isLoading, setIsLoading] = useState(false);
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
  const [showCountMeter2, setShowCountMeter2] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  // 3. Derived
  const videoRef = viewMode === "front" ? videoRefFront : videoRefBack;

  // 4. Hooks
  const { isCameraOn, toggleCamera, cameraError, attachStreamToVideo } =
    useCamera();
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

  // 5. Handlers
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, [videoRef]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, [videoRef]);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [videoRef, isPlaying]);

  const handleSeek = useCallback(
    (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        setCurrentTime(time);
      }
    },
    [videoRef]
  );

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
    [duration, videoRef]
  );

  const handleVolumeChange = useCallback((value: number) => {
    if (videoRefFront.current) videoRefFront.current.volume = value;
    if (videoRefBack.current) videoRefBack.current.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  }, []);

  const handleMuteToggle = useCallback(() => {
    const newMuted = !isMuted;
    if (videoRefFront.current) videoRefFront.current.muted = newMuted;
    if (videoRefBack.current) videoRefBack.current.muted = newMuted;
    setIsMuted(newMuted);
  }, [isMuted]);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (videoRefFront.current) videoRefFront.current.playbackRate = rate;
    if (videoRefBack.current) videoRefBack.current.playbackRate = rate;
    setPlaybackRate(rate);
    toast.success(`Playback speed: ${rate}x`);
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

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      const currentVideo = videoRef.current;
      const nextVideo =
        mode === "front" ? videoRefFront.current : videoRefBack.current;

      if (currentVideo && nextVideo) {
        // Sync State
        const currentTime = currentVideo.currentTime;
        const shouldPlay = !currentVideo.paused;

        // Apply to next video
        nextVideo.currentTime = currentTime;
        nextVideo.playbackRate = playbackRate;
        nextVideo.volume = volume;
        nextVideo.muted = isMuted;

        if (shouldPlay) {
          currentVideo.pause();
          nextVideo.play().catch(console.error);
        } else {
          currentVideo.pause();
          nextVideo.pause();
        }
      }

      setViewMode(mode);
      setIsLoading(false);
      toast.success(`Switched to ${mode} view`);
    },
    [videoRef, playbackRate, volume, isMuted]
  );

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
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

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
        {!showSidebar && (
          <button
            className="absolute top-6 right-6 z-10 px-4 py-2 bg-card/80 backdrop-blur-sm rounded-lg text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            View Sections
          </button>
        )}

        {!showSidebar && (
          <div className="absolute top-6 right-8 mr-[8rem] z-10 flex gap-2">
            <button
              className={cn(
                "px-4 py-2 bg-card/80 backdrop-blur-sm rounded-lg text-sm font-medium transition-colors",
                showCountMeter2
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-primary/20 text-primary hover:bg-primary/30"
              )}
              onClick={() => setShowCountMeter2(!showCountMeter2)}
            >
              Metronome
            </button>
          </div>
        )}

        {/* Video container */}
        <div
          ref={containerRef}
          className={cn(
            "relative bg-player-bg overflow-hidden flex",
            "group",
            "h-[calc(100vh-6rem)]"
          )}
        >
          {/* Split Screen Application */}

          {/* LEFT SIDE: CAMERA (If On) */}
          {isCameraOn && (
            <div className="w-1/2 h-full bg-black border-r border-border/20 z-10 transition-all duration-300 ease-in-out">
              <CameraPreview
                isMirrored={true}
                onClose={handleCameraToggle}
                onVideoRef={attachStreamToVideo}
                mode="split"
              />
            </div>
          )}

          {/* RIGHT SIDE (or Full): VIDEO PLAYER */}
          <div
            className={cn(
              "relative h-full transition-all duration-300 ease-in-out",
              isCameraOn ? "w-1/2" : "w-full"
            )}
          >
            {/* Front Video */}
            <video
              ref={videoRefFront}
              src={sources.front}
              poster={poster}
              className={cn(
                "w-full h-full object-contain absolute inset-0 transition-opacity duration-300",
                isMirrored && "scale-x-[-1]",
                viewMode === "front"
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0 pointer-events-none"
              )}
              onTimeUpdate={(e) => {
                if (viewMode === "front") handleTimeUpdate();
              }}
              onLoadedMetadata={(e) => {
                if (viewMode === "front") handleLoadedMetadata();
              }}
              onCanPlay={(e) => {
                // If it's the active video, we might want to ensure loading state clears
                // But generally we handle seamless switching manually in switch handler.
                // We'll keep default events mostly for the initial load and standard tracking.
              }}
              onPlay={() => {
                if (viewMode === "front") setIsPlaying(true);
              }}
              onPause={() => {
                if (viewMode === "front") setIsPlaying(false);
              }}
              onWaiting={() => {
                if (viewMode === "front") setIsLoading(true);
              }}
              onPlaying={() => {
                if (viewMode === "front") setIsLoading(false);
              }}
              onClick={handlePlayPause}
            />

            {/* Back Video */}
            <video
              ref={videoRefBack}
              src={sources.back}
              // No poster for back to avoid flash? Or same poster?
              // Usually backup video doesn't need poster if hidden initially
              className={cn(
                "w-full h-full object-contain absolute inset-0 transition-opacity duration-300",
                isMirrored && "scale-x-[-1]",
                viewMode === "back"
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0 pointer-events-none"
              )}
              onTimeUpdate={(e) => {
                if (viewMode === "back") handleTimeUpdate();
              }}
              onLoadedMetadata={(e) => {
                if (viewMode === "back") handleLoadedMetadata();
              }}
              onPlay={() => {
                if (viewMode === "back") setIsPlaying(true);
              }}
              onPause={() => {
                if (viewMode === "back") setIsPlaying(false);
              }}
              onWaiting={() => {
                if (viewMode === "back") setIsLoading(true);
              }}
              onPlaying={() => {
                if (viewMode === "back") setIsLoading(false);
              }}
              onClick={handlePlayPause}
            />

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 pointer-events-none">
                <Loader2 className="w-24 h-24 text-gray-400 animate-spin" />
              </div>
            )}

            {/* View mode indicator */}
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-card/80 backdrop-blur-sm rounded-lg text-sm font-medium z-20">
              {viewMode.toUpperCase()} VIEW
            </div>

            {/* Loop indicator */}
            {loopEnabled && (
              <div className="absolute top-4 right-4 px-3 py-1.5 bg-primary/80 backdrop-blur-sm rounded-lg text-sm font-medium text-primary-foreground flex items-center gap-2 z-20">
                <span className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
                LOOP
              </div>
            )}

            {/* Controls overlay */}
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent",
                "p-4 transition-opacity duration-300 z-30",
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
      {showCountMeter2 && (
        <CountMeter2 setShowCountMeter={setShowCountMeter2} />
      )}
    </div>
  );
};
