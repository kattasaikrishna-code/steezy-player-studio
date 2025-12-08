import React, { forwardRef } from 'react';
import { X, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CameraPreviewProps {
  isMirrored: boolean;
  onClose: () => void;
}

export const CameraPreview = forwardRef<HTMLVideoElement, CameraPreviewProps>(
  ({ isMirrored, onClose }, ref) => {
    return (
      <div 
        className={cn(
          "absolute bottom-24 right-4 w-48 h-36 rounded-xl overflow-hidden",
          "border-2 border-accent shadow-lg z-30",
          "bg-black animate-fade-in",
          "group cursor-move"
        )}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-2 bg-gradient-to-b from-black/70 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1 text-xs text-white/80">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
            <span>CAMERA</span>
          </div>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={onClose}
            className="h-6 w-6 text-white/80 hover:text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Video */}
        <video
          ref={ref}
          autoPlay
          playsInline
          muted
          className={cn(
            "w-full h-full object-cover",
            isMirrored && "scale-x-[-1]"
          )}
        />

        {/* Drag handle indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Move className="w-4 h-4 text-white/60" />
        </div>
      </div>
    );
  }
);

CameraPreview.displayName = 'CameraPreview';
