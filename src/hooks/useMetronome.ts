import { useState, useEffect, useRef, useCallback } from "react";

const click1Url = "https://daveceddia.com/freebies/react-metronome/click1.wav";
const click2Url = "https://daveceddia.com/freebies/react-metronome/click2.wav";

export function useMetronome() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(100);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [count, setCount] = useState(0);
  const [stressFirstBeat, setStressFirstBeat] = useState(true);

  const bpmRef = useRef(bpm);
  const timerIDRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const lookahead = 25.0; // milliseconds
  const scheduleAheadTime = 0.1; // seconds
  const currentBeatIndexRef = useRef(0);

  // Audio pool for Mac compatibility
  const audioPoolSize = 4;
  const click1PoolRef = useRef<HTMLAudioElement[]>([]);
  const click2PoolRef = useRef<HTMLAudioElement[]>([]);
  const click1IndexRef = useRef(0);
  const click2IndexRef = useRef(0);

  // Initialize audio pool
  useEffect(() => {
    if (typeof window === "undefined") return;

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
      click1PoolRef.current.forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
      click2PoolRef.current.forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
    };
  }, []);

  const playClick = useCallback(
    (beatCount: number) => {
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

      setCount(beatCount % beatsPerMeasure);
    },
    [beatsPerMeasure, stressFirstBeat]
  );

  const nextNote = useCallback(() => {
    const secondsPerBeat = 60.0 / bpmRef.current;
    nextNoteTimeRef.current += secondsPerBeat;
  }, []);

  const scheduler = useCallback(() => {
    const currentTime = performance.now() / 1000;
    while (nextNoteTimeRef.current < currentTime + scheduleAheadTime) {
      if (currentTime - nextNoteTimeRef.current < 0.1) {
        playClick(currentBeatIndexRef.current);
      }
      nextNote();
      currentBeatIndexRef.current++;
    }
    timerIDRef.current = window.setTimeout(scheduler, lookahead);
  }, [playClick, nextNote]);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  const startStop = useCallback(() => {
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
  }, [isPlaying, scheduler]);

  return {
    isPlaying,
    bpm,
    setBpm,
    beatsPerMeasure,
    setBeatsPerMeasure,
    count,
    stressFirstBeat,
    setStressFirstBeat,
    startStop,
  };
}
