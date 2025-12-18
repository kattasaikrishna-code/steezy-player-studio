import { useState, useEffect, useRef, useCallback } from "react";

const click1Url = "//daveceddia.com/freebies/react-metronome/click1.wav";
const click2Url = "//daveceddia.com/freebies/react-metronome/click2.wav";

const click1Audio = typeof window !== "undefined" ? new Audio(click1Url) : null;
const click2Audio = typeof window !== "undefined" ? new Audio(click2Url) : null;

if (click1Audio) click1Audio.preload = "auto";
if (click2Audio) click2Audio.preload = "auto";

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

  const playClick = useCallback(
    (beatCount: number) => {
      if (!click1Audio || !click2Audio) return;

      if (beatCount % beatsPerMeasure === 0 && stressFirstBeat) {
        click2Audio.currentTime = 0;
        click2Audio.play().catch((e) => console.error(e));
      } else {
        click1Audio.currentTime = 0;
        click1Audio.play().catch((e) => console.error(e));
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIDRef.current) window.clearTimeout(timerIDRef.current);
    };
  }, []);

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
