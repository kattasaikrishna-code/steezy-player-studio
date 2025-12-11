import { DanceVideoPlayer } from "@/components/player/DanceVideoPlayer";
import { VideoSection } from "@/types/player";
import { Helmet } from "react-helmet-async";

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

// Demo video sources (using a public sample video)
const demoSources = {
  front:
    "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4",
  back: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
};

const Index = () => {
  return (
    <>
      {/* <Helmet>
        <title>Dance Studio | Learn Dance Online</title>
        <meta
          name="description"
          content="Learn dance with our interactive video player featuring loop sections, mirror mode, and camera preview."
        />
      </Helmet> */}

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        {/* <header className="border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl tracking-wider text-foreground">
              DANCE<span className="text-primary">STUDIO</span>
            </h1>
          </div>

          <nav className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Classes
            </a>
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Programs
            </a>
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              My Progress
            </a>
          </nav>
        </header> */}

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
