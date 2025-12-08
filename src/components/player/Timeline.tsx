import React, { useRef, useCallback } from 'react';
import { LoopRange, VideoSection } from '@/types/player';
import { cn } from '@/lib/utils';

interface TimelineProps {
  currentTime: number;
  duration: number;
  loopRange: LoopRange | null;
  loopEnabled: boolean;
  sections: VideoSection[];
  onSeek: (time: number) => void;
  onLoopRangeChange: (range: LoopRange) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  currentTime,
  duration,
  loopRange,
  loopEnabled,
  sections,
  onSeek,
  onLoopRangeChange,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragType = useRef<'seek' | 'loop-start' | 'loop-end' | null>(null);

  const getTimeFromPosition = useCallback((clientX: number) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return percentage * duration;
  }, [duration]);

  const handleMouseDown = (e: React.MouseEvent, type: 'seek' | 'loop-start' | 'loop-end') => {
    e.preventDefault();
    isDragging.current = true;
    dragType.current = type;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const time = getTimeFromPosition(moveEvent.clientX);
      
      if (dragType.current === 'seek') {
        onSeek(time);
      } else if (dragType.current === 'loop-start' && loopRange) {
        const newStart = Math.min(time, loopRange.end - 1);
        onLoopRangeChange({ ...loopRange, start: Math.max(0, newStart) });
      } else if (dragType.current === 'loop-end' && loopRange) {
        const newEnd = Math.max(time, loopRange.start + 1);
        onLoopRangeChange({ ...loopRange, end: Math.min(duration, newEnd) });
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      dragType.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Initial click
    const time = getTimeFromPosition(e.clientX);
    if (type === 'seek') {
      onSeek(time);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const loopStartPercent = loopRange ? (loopRange.start / duration) * 100 : 0;
  const loopEndPercent = loopRange ? (loopRange.end / duration) * 100 : 0;

  return (
    <div className="relative w-full px-2 py-3 group">
      {/* Section markers */}
      {sections.map((section) => {
        const position = (section.startTime / duration) * 100;
        return (
          <div
            key={section.id}
            className="absolute top-0 w-0.5 h-2 bg-primary/60 cursor-pointer hover:bg-primary transition-colors z-10"
            style={{ left: `${position}%` }}
            onClick={() => onSeek(section.startTime)}
            title={section.title}
          />
        );
      })}

      {/* Track */}
      <div
        ref={trackRef}
        className="relative h-2 bg-muted rounded-full cursor-pointer group-hover:h-3 transition-all duration-200"
        onMouseDown={(e) => handleMouseDown(e, 'seek')}
      >
        {/* Loop region */}
        {loopRange && loopEnabled && (
          <div
            className="absolute top-0 h-full bg-primary/20 rounded-full"
            style={{
              left: `${loopStartPercent}%`,
              width: `${loopEndPercent - loopStartPercent}%`,
            }}
          />
        )}

        {/* Progress */}
        <div
          className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-100"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Playhead */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progressPercent}% - 8px)` }}
        />

        {/* Loop handles */}
        {loopRange && (
          <>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-6 bg-loop-start rounded cursor-ew-resize hover:scale-110 transition-transform z-20"
              style={{ left: `calc(${loopStartPercent}% - 6px)` }}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, 'loop-start');
              }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-6 bg-loop-end rounded cursor-ew-resize hover:scale-110 transition-transform z-20"
              style={{ left: `calc(${loopEndPercent}% - 6px)` }}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, 'loop-end');
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};
