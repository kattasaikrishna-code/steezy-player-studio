import { CircleX } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const click1 = "//daveceddia.com/freebies/react-metronome/click1.wav";
const click2 = "//daveceddia.com/freebies/react-metronome/click2.wav";

interface MetronomeProps {
  setShowCountMeter: (show: boolean) => void;
}

type CountType = 8 | 16;

export default function Metronome({ setShowCountMeter }: MetronomeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [count, setCount] = useState(0);
  const [countType, setCountType] = useState<CountType>(8);
  const [bpm] = useState(120);

  const click1Ref = useRef(new Audio(click1));
  const click2Ref = useRef(new Audio(click2));
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const beatsPerMeasure = countType;

  const playClick = () => {
    setCount((prev) => {
      if (prev % 4 === 0) {
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

  const handleCountTypeChange = (type: CountType) => {
    setCountType(type);
    setCount(0);
    if (isPlaying && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(playClick, (60 / bpm) * 1000);
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
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {/* Count Type Selector */}
        <div className="flex gap-2 w-full">
          <button
            onClick={() => handleCountTypeChange(8)}
            className={cn(
              "flex-1 py-4 rounded-xl font-display text-2xl transition-all duration-200",
              countType === 8
                ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
            )}
          >
            8
          </button>
          <button
            onClick={() => handleCountTypeChange(16)}
            className={cn(
              "flex-1 py-4 rounded-xl font-display text-2xl transition-all duration-200",
              countType === 16
                ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
            )}
          >
            16
          </button>
        </div>

        {/* Beat indicator */}
        <div className="flex flex-wrap justify-center gap-2 mt-[50px] max-w-[200px]">
          {Array.from({ length: beatsPerMeasure }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-4 h-4 rounded-full transition-all duration-100",
                isPlaying && count === i
                  ? "bg-primary shadow-[0_0_12px_hsl(var(--primary))]"
                  : i % 4 === 0
                  ? "bg-muted-foreground/50"
                  : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Current count display */}
        {/* <div className="text-center">
          <span className="font-display text-5xl text-foreground">
            {isPlaying ? count + 1 : "-"}
          </span>
          <span className="text-sm text-muted-foreground ml-2">
            / {countType}
          </span>
        </div> */}

        {/* Start/Stop button */}
        <Button
          variant={isPlaying ? "destructive" : "glow"}
          size="lg"
          onClick={startStop}
          className="w-full font-medium tracking-wide text-lg mt-[50px] py-6"
        >
          {isPlaying ? "STOP" : "START"}
        </Button>
      </div>
    </div>
  );
}
