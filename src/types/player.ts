export interface VideoSection {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  thumbnail?: string;
}

export interface LoopRange {
  start: number;
  end: number;
}

export interface VideoQualitySources {
  high: string;
  low: string;
}

export interface VideoSource {
  front: VideoQualitySources;
  back: VideoQualitySources;
}

export type VideoQuality = "high" | "low";

export type ViewMode = "front" | "back";

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
  isMirrored: boolean;
  isCameraOn: boolean;
  viewMode: ViewMode;
  loopEnabled: boolean;
  loopRange: LoopRange | null;
  activeSection: string | null;
}
