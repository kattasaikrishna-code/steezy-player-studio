import { CircleX, Minus, Plus, Play, Square } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface MetronomeProps {
  setShowCountMeter: (show: boolean) => void;
}

export default function CountMeter2({ setShowCountMeter }: MetronomeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(100);

  const [beatsPerMeasure, setBeatsPerMeasure] = useState(6);
  const bpmRef = useRef(bpm);
  const [count, setCount] = useState(0);
  const [stressFirstBeat, setStressFirstBeat] = useState(true);

  // Audio Context Ref
  const audioContextRef = useRef<AudioContext | null>(null);

  // Timer Refs
  const timerIDRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const lookahead = 25.0; // milliseconds
  const scheduleAheadTime = 0.1; // seconds
  const currentBeatIndexRef = useRef(0);

  // Logic Ref
  const playClickRef = useRef((time: number, beatCount: number) => {});

  // Tap Tempo Refs
  const tapTimesRef = useRef<number[]>([]);

  // Noise Buffer Ref
  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  // Initialize AudioContext and Noise Buffer
  useEffect(() => {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      // Create Noise Buffer for Snare/Hi-hat
      const bufferSize = ctx.sampleRate * 2; // 2 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noiseBufferRef.current = buffer;
    }
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Sound Generation using AudioContext (Louder and adjustable tune)
  // Sound Generation using AudioContext (Dance Beat: Snare/Rimshot + Violin Layer)
  const playClick = (time: number, beatCount: number) => {
    if (!audioContextRef.current || !noiseBufferRef.current) return;
    const ctx = audioContextRef.current;
    const t = ctx.currentTime;

    // --- Tak Sound Components ---

    // 1. Noise Click (The "T" consonant)
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBufferRef.current;
    const noiseFilter = ctx.createBiquadFilter();
    const noiseGain = ctx.createGain();

    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 3000; // Very high HPF for sharp click
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    // 2. Tonal Knock (The "ak" vowel)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    if (beatCount % beatsPerMeasure === 0 && stressFirstBeat) {
      // Accent: MUCH Louder, Higher pitch "TAK"
      noiseGain.gain.setValueAtTime(1.0, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

      osc.type = "sine";
      osc.frequency.setValueAtTime(2500, t); // High pitch "Ping"
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);

      oscGain.gain.setValueAtTime(1.0, t); // Max volume
      oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    } else {
      // Beat: Softer, Lower pitch "tuk"
      noiseGain.gain.setValueAtTime(1.0, t); // Very Quiet noise
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

      osc.type = "sine";
      osc.frequency.setValueAtTime(1500, t); // Medium pitch
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);

      oscGain.gain.setValueAtTime(1.0, t); // Quiet body
      oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    }

    // Start
    noise.start(t);
    noise.stop(t + 0.1);
    osc.start(t);
    osc.stop(t + 0.1);

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
    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume();
    }

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

  const handleBpmChange = (value: number[]) => {
    setBpm(value[0]);
  };

  const adjustBpm = (amount: number) => {
    setBpm((prev) => Math.max(20, Math.min(300, prev + amount)));
  };

  const handleTap = () => {
    const now = performance.now();
    const times = tapTimesRef.current;

    // Remove taps older than 2 seconds to reset chain
    if (times.length > 0 && now - times[times.length - 1] > 2000) {
      tapTimesRef.current = [now];
      return;
    }

    tapTimesRef.current = [...times, now];

    if (tapTimesRef.current.length > 1) {
      const intervals = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
      }
      const averageInterval =
        intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const newBpm = Math.round(60000 / averageInterval);
      if (newBpm >= 20 && newBpm <= 300) {
        setBpm(newBpm);
      }
    }

    // Keep only last 4 taps
    if (tapTimesRef.current.length > 4) {
      tapTimesRef.current.shift();
    }
  };

  // Tempo markings
  const getTempoMarking = (bpm: number) => {
    if (bpm < 40) return "Grave";
    if (bpm < 60) return "Largo";
    if (bpm < 66) return "Larghetto";
    if (bpm < 76) return "Adagio";
    if (bpm < 108) return "Andante";
    if (bpm < 120) return "Moderato";
    if (bpm < 168) return "Allegro";
    if (bpm < 200) return "Presto";
    return "Prestissimo";
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
          onClick={() => setShowCountMeter(false)}
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
        >
          <CircleX className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
        {/* BPM Display & Control */}
        <div className="flex flex-col items-center gap-2">
          {/* <span className="text-muted-foreground text-sm uppercase tracking-widest font-medium">
            {getTempoMarking(bpm)}
          </span>
          <div className="flex items-center gap-4 w-full justify-center">
            <Button variant="outline" size="icon" onClick={() => adjustBpm(-1)}>
              <Minus className="w-4 h-4" />
            </Button>
            <div className="flex flex-col items-center">
              <span className="font-display text-6xl text-foreground font-bold tabular-nums">
                {bpm}
              </span>
              <span className="text-xs text-muted-foreground tracking-widest">
                BPM
              </span>
            </div>
            <Button variant="outline" size="icon" onClick={() => adjustBpm(1)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div> */}

          {/* <div className="w-full px-2 pt-4">
            <Slider
              value={[bpm]}
              min={20}
              max={260}
              step={1}
              onValueChange={handleBpmChange}
              className="w-full"
            />
          </div> */}
        </div>

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

          {/* <Button
            variant="secondary"
            className="w-full py-8 rounded-xl border-2 border-transparent active:border-primary/50 transition-all active:scale-[0.99]"
            onClick={handleTap}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="font-display font-bold text-lg tracking-widest">
                TAP
              </span>
              <span className="text-[10px] text-muted-foreground uppercase">
                Tap rhythm to set tempo
              </span>
            </div>
          </Button> */}
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
