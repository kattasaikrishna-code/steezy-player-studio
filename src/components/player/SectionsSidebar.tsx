import React from 'react';
import { VideoSection } from '@/types/player';
import { cn } from '@/lib/utils';
import { Play, Clock } from 'lucide-react';

interface SectionsSidebarProps {
  sections: VideoSection[];
  currentTime: number;
  activeSection: string | null;
  onSectionClick: (section: VideoSection) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const SectionsSidebar: React.FC<SectionsSidebarProps> = ({
  sections,
  currentTime,
  activeSection,
  onSectionClick,
}) => {
  const getCurrentSection = () => {
    for (let i = sections.length - 1; i >= 0; i--) {
      if (currentTime >= sections[i].startTime) {
        return sections[i].id;
      }
    }
    return sections[0]?.id;
  };

  const currentSectionId = activeSection || getCurrentSection();

  return (
    <div className="w-80 bg-card border-l border-border overflow-hidden flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-display text-xl tracking-wide text-foreground">
          SECTIONS
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Click to jump to section
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sections.map((section, index) => {
          const isActive = currentSectionId === section.id;
          const isCurrent = currentTime >= section.startTime && 
            (index === sections.length - 1 || currentTime < sections[index + 1].startTime);
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionClick(section)}
              className={cn(
                'w-full text-left p-3 rounded-lg transition-all duration-200',
                'flex items-center gap-3 group',
                'border border-transparent',
                isActive 
                  ? 'bg-primary/20 border-primary' 
                  : 'bg-secondary/50 hover:bg-secondary hover:border-primary/30',
                isCurrent && 'ring-2 ring-primary/50'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Thumbnail placeholder */}
              <div className="relative w-20 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className={cn(
                    "w-6 h-6 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  )} />
                </div>
                {isCurrent && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" 
                    style={{ 
                      width: `${((currentTime - section.startTime) / (section.endTime - section.startTime)) * 100}%` 
                    }} 
                  />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium truncate text-sm",
                  isActive ? "text-primary" : "text-foreground"
                )}>
                  {section.title}
                </p>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(section.startTime)}</span>
                  <span>-</span>
                  <span>{formatTime(section.endTime)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
