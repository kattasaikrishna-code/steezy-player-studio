import React from "react";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff } from "lucide-react";

interface NetworkIndicatorProps {
  qualityLabel: string;
  quality: string;
  qualityColor: string;
  qualityBgColor: string;
  isOnline: boolean;
  className?: string;
}

export const NetworkIndicator: React.FC<NetworkIndicatorProps> = ({
  qualityLabel,
  quality,
  qualityColor,
  qualityBgColor,
  isOnline,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50",
        qualityBgColor,
        className
      )}
    >
      {isOnline ? (
        <Wifi className={cn("w-4 h-4", qualityColor)} />
      ) : (
        <WifiOff className="w-4 h-4 text-destructive" />
      )}
      <div className="flex flex-col leading-none">
        <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">
          Network
        </span>
        <span className={cn("text-xs font-semibold", qualityColor)}>
          {isOnline ? `${qualityLabel} (${quality})` : "Offline"}
        </span>
      </div>
    </div>
  );
};
