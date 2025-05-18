import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, FileText, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChapterCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isCompleted: boolean;
  progress?: number;
  onClick: () => void;
  onMarkComplete: () => void;
  onToggleExpand?: () => void;
  onOpenNotes?: () => void;
  isExpanded?: boolean;
  subtopics?: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}

const ChapterCard: React.FC<ChapterCardProps> = ({
  id,
  title,
  description,
  icon,
  isCompleted,
  progress,
  onClick,
  onMarkComplete,
  onToggleExpand,
  onOpenNotes,
  isExpanded = false,
  subtopics = [],
}) => {
  const router = useRouter();

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

  const cardClasses = cn(
    "relative cursor-pointer transition-all duration-300 hover:shadow-lg",
    "border-2 rounded-xl p-4 mb-4",
    "bg-gradient-to-br from-background to-background/50",
    {
      "border-green-500/30 from-green-50/10 to-emerald-50/5 dark:from-green-900/10 dark:to-emerald-900/5":
        isCompleted,
      "border-muted": !isCompleted,
    }
  );

  return (
    <Card className={cardClasses} onClick={onClick}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="mt-1 p-2 rounded-lg bg-primary/10">{icon}</div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold">{title}</h3>
              {isCompleted && (
                <Badge variant="success" className="ml-2">
                  <Check className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
            {progress !== undefined && (
              <div className="w-full bg-secondary/30 rounded-full h-1.5 mt-2">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-secondary/80"
            onClick={handleOpenNotes}
          >
            <FileText className="h-4 w-4" />
          </Button>
          {subtopics.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-secondary/80"
              onClick={handleToggleExpand}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
      
      {isExpanded && subtopics.length > 0 && (
        <div className="mt-4 pl-12">
          {subtopics.map((subtopic) => (
            <div
              key={subtopic.id}
              className="border-l-2 border-muted-foreground/20 pl-4 py-2 mb-2 last:mb-0"
            >
              <h4 className="font-medium">{subtopic.title}</h4>
              <p className="text-sm text-muted-foreground">
                {subtopic.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ChapterCard;