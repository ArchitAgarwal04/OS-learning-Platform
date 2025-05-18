
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp, FileText } from "lucide-react";

interface ChapterCardProps {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  icon: React.ReactNode;
  onClick: () => void;
  onMarkComplete: () => void;
  onToggleExpand?: () => void;
  onOpenNotes?: () => void;
  isExpanded?: boolean;
}

const ChapterCard: React.FC<ChapterCardProps> = ({
  id,
  title,
  description,
  isCompleted,
  icon,
  onClick,
  onMarkComplete,
  onToggleExpand,
  onOpenNotes,
  isExpanded = false,
}) => {
  const handleMarkComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkComplete();
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleExpand) onToggleExpand();
  };
  
  const handleOpenNotes = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenNotes) onOpenNotes();
  };

  return (
    <Card 
      className={`relative cursor-pointer glass border animate-slide-up ${
        isCompleted 
          ? "border-green-400/30 dark:border-green-500/30 bg-gradient-to-br from-green-50/10 to-emerald-50/5 dark:from-green-900/10 dark:to-emerald-900/5" 
          : "gradient-border hover:shadow-lg hover:shadow-primary/10"
      } transition-all duration-300 hover:translate-y-[-4px]`}
      onClick={onClick}
    >
      {/* Highlight effect */}
      <div className={`absolute inset-0 rounded-lg ${isCompleted ? 'opacity-20' : 'opacity-0'} transition-opacity duration-300 pointer-events-none`}
        style={{
          background: 'linear-gradient(45deg, transparent, hsl(var(--primary) / 0.3), transparent)',
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 3s ease infinite'
        }}>
      </div>
        
      <div className="p-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${
              isCompleted 
                ? "bg-green-100/30 dark:bg-green-900/20 text-green-600 dark:text-green-400 animate-pulse-subtle" 
                : "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90 animate-pulse-subtle"
              }`}>
              {icon}
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1 text-foreground">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
          
          {isCompleted && (
            <div className="rounded-full p-2 bg-green-500/80 text-white animate-pulse-subtle">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>
        
        {/* Card Actions */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex gap-2">
            {/* Stats like time, difficulty */}
            <div className="flex items-center text-xs text-muted-foreground">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              45m
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              5 topics
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              15 quiz questions
            </div>
          </div>
          
          <div className="flex gap-2">
            {onOpenNotes && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleOpenNotes} 
                className="text-xs flex items-center gap-1 h-7"
              >
                <FileText className="h-3.5 w-3.5" />
                Notes
              </Button>
            )}
            
            {onToggleExpand && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleToggleExpand} 
                className="text-xs flex items-center gap-1 h-7"
              >
                {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {isExpanded ? "Hide" : "Expand"}
              </Button>
            )}
          </div>
        </div>

        {/* Mark Complete Button - Moved to bottom */}
        <div className="mt-4 flex justify-end">
          {!isCompleted && (
            <button
              onClick={handleMarkComplete}
              className="text-xs px-4 py-2 rounded-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-700 text-white shadow-md shadow-primary/20 transition-all"
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>

      {/* Bottom glow for completed items */}
      {isCompleted && (
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-green-400/50 to-transparent"></div>
      )}
    </Card>
  );
};

export default ChapterCard;
