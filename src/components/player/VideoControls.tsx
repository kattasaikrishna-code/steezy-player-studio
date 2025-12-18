import React from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  FlipHorizontal,
  Camera,
  CameraOff,
  Repeat,
  RefreshCw,
  SkipBack,
  SkipForward,
  Gauge,
} from "lucide-react";
import { ControlButton } from "./ControlButton";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ViewMode } from "@/types/player";

interface VideoControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isFullscreen: boolean;
  isMirrored: boolean;
  isCameraOn: boolean;
  viewMode: ViewMode;
  loopEnabled: boolean;
  isSettingLoop: boolean;
  playbackRate: number;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  onVolumeChange: (value: number) => void;
  onFullscreenToggle: () => void;
  onMirrorToggle: () => void;
  onCameraToggle: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onLoopToggle: () => void;
  onClearLoop: () => void;
  onSetLoopPoint: () => void;
  onPlaybackRateChange: (rate: number) => void;
  onSeekRelative: (seconds: number) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

export const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  isMuted,
  volume,
  isFullscreen,
  isMirrored,
  isCameraOn,
  viewMode,
  loopEnabled,
  isSettingLoop,
  playbackRate,
  currentTime,
  duration,
  onPlayPause,
  onMuteToggle,
  onVolumeChange,
  onFullscreenToggle,
  onMirrorToggle,
  onCameraToggle,
  onViewModeChange,
  onLoopToggle,
  onClearLoop,
  onSetLoopPoint,
  onPlaybackRateChange,
  onSeekRelative,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 px-2">
      {/* Left controls */}
      <div className="flex items-center gap-2">
        <ControlButton
          icon={<SkipBack className="w-4 h-4" />}
          label="Back 5s"
          onClick={() => onSeekRelative(-5)}
        />

        <ControlButton
          icon={
            isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )
          }
          label={isPlaying ? "Pause" : "Play"}
          onClick={onPlayPause}
          size="lg"
        />

        <ControlButton
          icon={<SkipForward className="w-4 h-4" />}
          label="Forward 5s"
          onClick={() => onSeekRelative(5)}
        />

        {/* Volume */}
        <div className="flex items-center gap-2 ml-2">
          <ControlButton
            icon={
              isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )
            }
            label={isMuted ? "Unmute" : "Mute"}
            onClick={onMuteToggle}
          />
          <Slider
            value={[isMuted ? 0 : volume * 100]}
            max={100}
            step={1}
            className="w-20"
            onValueChange={([v]) => onVolumeChange(v / 100)}
          />
        </div>

        {/* Time */}
        <div className="text-sm text-muted-foreground ml-4 font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Center controls - Dance specific */}
      <div className="flex items-center gap-5 mr-[15rem]">
        {/* Loop controls */}
        <ControlButton
          icon={<Repeat className="w-4 h-4" />}
          label={
            loopEnabled
              ? "Disable Loop"
              : isSettingLoop
              ? "Set End Point"
              : "Enable Loop"
          }
          onClick={loopEnabled ? onClearLoop : onLoopToggle}
          active={loopEnabled || isSettingLoop}
        />

        {(loopEnabled || isSettingLoop) && (
          <ControlButton
            icon={<RotateCcw className="w-4 h-4" />}
            label="Clear Loop"
            onClick={onClearLoop}
          />
        )}

        {isSettingLoop && (
          <Button
            variant="glow"
            size="sm"
            onClick={onSetLoopPoint}
            className="text-xs"
          >
            Set {loopEnabled ? "End" : "Start"} Point
          </Button>
        )}

        {/* Mirror */}
        <ControlButton
          icon={<FlipHorizontal className="w-4 h-4" />}
          label="Mirror Video"
          onClick={onMirrorToggle}
          active={isMirrored}
        />

        {/* View Mode */}
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="control" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-card border-border">
            <DropdownMenuItem
              onClick={() => onViewModeChange("front")}
              className={viewMode === "front" ? "bg-primary/20" : ""}
            >
              Front View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onViewModeChange("back")}
              className={viewMode === "back" ? "bg-primary/20" : ""}
            >
              Back View
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
        <ControlButton
          icon={<RefreshCw className="w-4 h-4" />}
          label={
            viewMode === "front"
              ? "Change to Back View"
              : "Change to Front View"
          }
          onClick={() =>
            onViewModeChange(viewMode === "front" ? "back" : "front")
          }
          active={false}
        />

        {/* Camera */}
        <ControlButton
          icon={
            isCameraOn ? (
              <CameraOff className="w-4 h-4" />
            ) : (
              <Camera className="w-4 h-4" />
            )
          }
          label={isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
          onClick={onCameraToggle}
          active={isCameraOn}
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Playback Speed */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="control"
              size="sm"
              className="flex flex-row items-center gap-1 min-w-[70px] leading-none"
            >
              <Gauge className="w-4 h-4" />
              {playbackRate}x
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-card border-border">
            {playbackRates.map((rate) => (
              <DropdownMenuItem
                key={rate}
                onClick={() => onPlaybackRateChange(rate)}
                className={playbackRate === rate ? "bg-primary/20" : ""}
              >
                {rate}x
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Fullscreen */}
        <ControlButton
          icon={
            isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )
          }
          label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          onClick={onFullscreenToggle}
        />
      </div>
    </div>
  );
};
