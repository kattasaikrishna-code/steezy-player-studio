import { CircleX, Minus, Plus, Play, Square } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useMetronomeContext } from "@/context/MetronomeContext";

interface MetronomeProps {
  setShowCountMeter: (show: boolean) => void;
}

export default function CountMeter2({ setShowCountMeter }: MetronomeProps) {
  const {
    isPlaying,
    bpm,
    setBpm,
    beatsPerMeasure,
    setBeatsPerMeasure,
    count,
    stressFirstBeat,
    setStressFirstBeat,
    startStop,
  } = useMetronomeContext();

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-full shadow-2xl z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur">
        <h2 className="font-display text-sm tracking-wider text-foreground">
          METRONOME
        </h2>
        <Button
          variant="ghost"
          size="iconSm"
          onClick={() => {
            setShowCountMeter(false);
          }}
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
        >
          <CircleX className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
        {/* BPM Display & Control */}
        <div className="flex flex-col items-center gap-2"></div>

        {/* Visual Beats */}
        <div className="flex flex-col mt-[101px] gap-3 p-4 bg-muted/30 rounded-xl border border-border/50">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-muted-foreground uppercase">
              Beats
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="iconSm"
                onClick={() =>
                  setBeatsPerMeasure(Math.max(1, beatsPerMeasure - 1))
                }
                className="h-6 w-6 rounded-full border border-border"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-4 text-center text-sm font-bold">
                {beatsPerMeasure}
              </span>
              <Button
                variant="ghost"
                size="iconSm"
                onClick={() =>
                  setBeatsPerMeasure(Math.min(16, beatsPerMeasure + 1))
                }
                className="h-6 w-6 rounded-full border border-border"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 min-h-[40px] items-center">
            {Array.from({ length: beatsPerMeasure }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-75",
                  isPlaying && count === i
                    ? "bg-primary scale-125 shadow-[0_0_10px_hsl(var(--primary))]"
                    : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>

        {/* TAP Button */}
        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex items-center justify-between px-1">
            <label
              htmlFor="stress-beat"
              className="text-xs font-medium text-muted-foreground uppercase cursor-pointer select-none"
            >
              Accentuate first beat
            </label>
            <div
              onClick={() => setStressFirstBeat(!stressFirstBeat)}
              className={cn(
                "w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200",
                stressFirstBeat ? "bg-primary" : "bg-muted"
              )}
            >
              <div
                className={cn(
                  "absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-200 shadow-sm",
                  stressFirstBeat ? "left-6" : "left-1"
                )}
              />
            </div>
          </div>
        </div>
        {/* Start/Stop Button */}
        <Button
          variant={isPlaying ? "destructive" : "glow"}
          size="lg"
          onClick={startStop}
          className="w-full font-medium tracking-wide text-lg py-8 rounded-2xl shadow-lg transition-all active:scale-[0.98]"
        >
          {isPlaying ? (
            <div className="flex items-center gap-2">
              <Square className="w-5 h-5 fill-current" />
              STOP
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 fill-current" />
              START
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
