import { EyeClosed, ShieldCloseIcon, CircleX } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const click1 = "//daveceddia.com/freebies/react-metronome/click1.wav";
const click2 = "//daveceddia.com/freebies/react-metronome/click2.wav";

export default function Metronome({ setShowCountMeter }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [count, setCount] = useState(0);
  const [bpm, setBpm] = useState(100);
  const [beatsPerMeasure] = useState(4);

  const click1Ref = useRef(new Audio(click1));
  const click2Ref = useRef(new Audio(click2));
  const timerRef = useRef(null);

  // handle BPM slider changes
  const handleInputChange = (e) => {
    const newBpm = Number(e.target.value);

    if (isPlaying) {
      // restart timer with new BPM
      clearInterval(timerRef.current);
      timerRef.current = setInterval(playClick, (60 / newBpm) * 1000);
      setCount(0);
    }

    setBpm(newBpm);
  };

  const playClick = () => {
    if (count % beatsPerMeasure === 0) {
      click2Ref.current.currentTime = 0;
      click2Ref.current.play();
    } else {
      click1Ref.current.currentTime = 0;
      click1Ref.current.play();
    }

    setCount((prev) => (prev + 1) % beatsPerMeasure);
  };

  const startStop = () => {
    if (isPlaying) {
      clearInterval(timerRef.current);
      setIsPlaying(false);
    } else {
      timerRef.current = setInterval(playClick, (60 / bpm) * 1000);
      setCount(0);
      setIsPlaying(true);
      playClick(); // play immediately
    }
  };

  // Clear timer when component unmounts
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="metronome">
      <div className="bpm-slider">
        <h1 className="mt-1.5 py-1 px-2 text-md tracking-wider text-foreground">
          Count Meter
        </h1>
        <button
          className="absolute top-2 right-2"
          onClick={() => setShowCountMeter(false)}
        >
          <CircleX size={15} style={{ marginTop: "8px" }} />
        </button>

        <p className="text-sm mt-[5rem] text-center text-muted-foreground centered">
          {bpm} BPM
        </p>
        <input
          type="range"
          min="60"
          max="240"
          value={bpm}
          onChange={handleInputChange}
        />
      </div>
      <button className="absolute top-50 right-20" onClick={startStop}>
        {isPlaying ? "Stop" : "Start"}
      </button>
    </div>
  );
}
