import React, { createContext, useContext, ReactNode } from "react";
import { useMetronome } from "@/hooks/useMetronome";

interface MetronomeContextType {
  isPlaying: boolean;
  bpm: number;
  setBpm: (bpm: number) => void;
  beatsPerMeasure: number;
  setBeatsPerMeasure: (beats: number) => void;
  count: number;
  stressFirstBeat: boolean;
  setStressFirstBeat: (stress: boolean) => void;
  startStop: () => void;
}

const MetronomeContext = createContext<MetronomeContextType | undefined>(
  undefined
);

export const MetronomeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const metronome = useMetronome();

  return (
    <MetronomeContext.Provider value={metronome}>
      {children}
    </MetronomeContext.Provider>
  );
};

export const useMetronomeContext = () => {
  const context = useContext(MetronomeContext);
  if (context === undefined) {
    throw new Error(
      "useMetronomeContext must be used within a MetronomeProvider"
    );
  }
  return context;
};
