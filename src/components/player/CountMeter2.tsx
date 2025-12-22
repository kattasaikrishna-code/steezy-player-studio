import { CircleX, Minus, Plus, Play, Square } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface MetronomeProps {
  setShowCountMeter: (show: boolean) => void;
}

const click1Url = "https://daveceddia.com/freebies/react-metronome/click1.wav";
const click2Url = "https://daveceddia.com/freebies/react-metronome/click2.wav";

export default function CountMeter2({ setShowCountMeter }: MetronomeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(100);

  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const bpmRef = useRef(bpm);
  const [count, setCount] = useState(0);
  const [stressFirstBeat, setStressFirstBeat] = useState(true);

  // Audio pool for Mac compatibility - create multiple audio instances to avoid overlap issues
  const audioPoolSize = 4;
  const click1PoolRef = useRef<HTMLAudioElement[]>([]);
  const click2PoolRef = useRef<HTMLAudioElement[]>([]);
  const click1IndexRef = useRef(0);
  const click2IndexRef = useRef(0);

  // Timer Refs
  const timerIDRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const lookahead = 25.0; // milliseconds
  const scheduleAheadTime = 0.1; // seconds
  const currentBeatIndexRef = useRef(0);

  // Logic Ref
  const playClickRef = useRef((time: number, beatCount: number) => {});

  // Initialize audio pool
  useEffect(() => {
    // Create pool of audio elements to avoid reuse issues on Mac/Safari
    click1PoolRef.current = Array.from({ length: audioPoolSize }, () => {
      const audio = new Audio(click1Url);
      audio.preload = "auto";
      audio.load();
      return audio;
    });
    
    click2PoolRef.current = Array.from({ length: audioPoolSize }, () => {
      const audio = new Audio(click2Url);
      audio.preload = "auto";
      audio.load();
      return audio;
    });

    return () => {
      click1PoolRef.current.forEach(audio => {
        audio.pause();
        audio.src = "";
      });
      click2PoolRef.current.forEach(audio => {
        audio.pause();
        audio.src = "";
      });
    };
  }, []);

  // Sound Generation using pooled Audio elements for Mac compatibility
  const playClick = (time: number, beatCount: number) => {
    if (beatCount % beatsPerMeasure === 0 && stressFirstBeat) {
      const audio = click2PoolRef.current[click2IndexRef.current];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch((e) => console.error("Audio play error:", e));
        click2IndexRef.current = (click2IndexRef.current + 1) % audioPoolSize;
      }
    } else {
      const audio = click1PoolRef.current[click1IndexRef.current];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch((e) => console.error("Audio play error:", e));
        click1IndexRef.current = (click1IndexRef.current + 1) % audioPoolSize;
      }
    }

    // UI Update
    setCount(beatCount % beatsPerMeasure);
  };

  // Update ref
  useEffect(() => {
    playClickRef.current = playClick;
  }, [stressFirstBeat, beatsPerMeasure, playClick]); // Added playClick to dependencies

  // Ensure bpmRef is always in sync with state
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  const nextNote = () => {
    const secondsPerBeat = 60.0 / bpmRef.current;
    nextNoteTimeRef.current += secondsPerBeat;
  };

  const scheduler = () => {
    const currentTime = performance.now() / 1000;
    while (nextNoteTimeRef.current < currentTime + scheduleAheadTime) {
      if (currentTime - nextNoteTimeRef.current < 0.1) {
        playClickRef.current(0, currentBeatIndexRef.current);
      }
      nextNote();
      currentBeatIndexRef.current++;
    }
    timerIDRef.current = window.setTimeout(scheduler, lookahead);
  };

  const startStop = () => {
    if (isPlaying) {
      if (timerIDRef.current) window.clearTimeout(timerIDRef.current);
      setIsPlaying(false);
      setCount(0);
      currentBeatIndexRef.current = 0;
    } else {
      currentBeatIndexRef.current = 0;
      nextNoteTimeRef.current = performance.now() / 1000 + 0.05;
      timerIDRef.current = window.setTimeout(scheduler, lookahead);
      setIsPlaying(true);
    }
  };

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
            if (isPlaying) {
              if (timerIDRef.current) window.clearTimeout(timerIDRef.current);
              setIsPlaying(false);
              setCount(0);
              currentBeatIndexRef.current = 0;
            }
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
