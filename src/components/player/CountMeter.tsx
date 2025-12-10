import { CircleX } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const click1 = "//daveceddia.com/freebies/react-metronome/click1.wav";
const click2 = "//daveceddia.com/freebies/react-metronome/click2.wav";

interface MetronomeProps {
  setShowCountMeter: (show: boolean) => void;
}

export default function Metronome({ setShowCountMeter }: MetronomeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [count, setCount] = useState(0);
  const [bpm, setBpm] = useState(100);
  const [beatsPerMeasure] = useState(4);

  const click1Ref = useRef(new Audio(click1));
  const click2Ref = useRef(new Audio(click2));
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleBpmChange = (value: number[]) => {
    const newBpm = value[0];

    if (isPlaying && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(playClick, (60 / newBpm) * 1000);
      setCount(0);
    }

    setBpm(newBpm);
  };

  const playClick = () => {
    setCount((prev) => {
      if (prev % beatsPerMeasure === 0) {
        click2Ref.current.currentTime = 0;
        click2Ref.current.play();
      } else {
        click1Ref.current.currentTime = 0;
        click1Ref.current.play();
      }
      return (prev + 1) % beatsPerMeasure;
    });
  };

  const startStop = () => {
    if (isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPlaying(false);
    } else {
      timerRef.current = setInterval(playClick, (60 / bpm) * 1000);
      setCount(0);
      setIsPlaying(true);
      playClick();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="w-72 bg-card border-l border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="font-display text-sm tracking-wider text-foreground">
          COUNT METER
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
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        {/* Beat indicator */}
        <div className="flex gap-3">
          {Array.from({ length: beatsPerMeasure }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-4 h-4 rounded-full transition-all duration-100",
                isPlaying && count === i
                  ? "bg-primary shadow-[0_0_12px_hsl(var(--primary))]"
                  : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* BPM display */}
        <div className="text-center">
          <span className="font-display text-4xl text-foreground">{bpm}</span>
          <span className="text-sm text-muted-foreground ml-2">BPM</span>
        </div>

        {/* Slider */}
        <div className="w-full px-2">
          <Slider
            value={[bpm]}
            min={60}
            max={240}
            step={1}
            onValueChange={handleBpmChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>60</span>
            <span>240</span>
          </div>
        </div>

        {/* Start/Stop button */}
        <Button
          variant={isPlaying ? "destructive" : "default"}
          size="lg"
          onClick={startStop}
          className="w-full font-medium tracking-wide"
        >
          {isPlaying ? "STOP" : "START"}
        </Button>
      </div>
    </div>
  );
}
