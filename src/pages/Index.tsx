import { DanceVideoPlayer } from "@/components/player/DanceVideoPlayer";
import { VideoSection } from "@/types/player";


// Sample sections for demo
const demoSections: VideoSection[] = [
  {
    id: "intro",
    title: "Introduction",
    startTime: 0,
    endTime: 15,
  },
  {
    id: "warmup",
    title: "Warm Up",
    startTime: 15,
    endTime: 35,
  },
  {
    id: "basic-step",
    title: "Basic Step",
    startTime: 35,
    endTime: 60,
  },
  {
    id: "chorus-1",
    title: "Chorus Part 1",
    startTime: 60,
    endTime: 90,
  },
  {
    id: "chorus-2",
    title: "Chorus Part 2",
    startTime: 90,
    endTime: 120,
  },
  {
    id: "breakdown",
    title: "Breakdown",
    startTime: 120,
    endTime: 150,
  },
  {
    id: "full-routine",
    title: "Full Routine",
    startTime: 150,
    endTime: 180,
  },
];

// Demo video sources - Using longer sample videos (~3-4 minutes)
const demoSources = {
  front:
    "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4",
  back: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4",
};

const Index = () => {
  return (
    <>
      <div className="h-[calc(100vh-4rem)] bg-background flex flex-col">
        {/* Main content */}
        <main className="flex-1">
          <DanceVideoPlayer
            sources={demoSources}
            sections={demoSections}
            title="Hip Hop Basics - Groove Foundations"
            poster="https://images.unsplash.com/photo-1547153760-18fc86324498?w=1280"
          />
        </main>
      </div>
    </>
  );
};

export default Index;
