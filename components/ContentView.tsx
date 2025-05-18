
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Check, ExternalLink } from "lucide-react";

interface ContentViewProps {
  chapter: {
    id: string;
    title: string;
    content: React.ReactNode;
  } | null;
  onClose: () => void;
  onOpenNotes?: () => void;
  isCompleted?: boolean;
  onMarkComplete?: () => void;
}

const ContentView: React.FC<ContentViewProps> = ({ 
  chapter, 
  onClose, 
  onOpenNotes,
  isCompleted = false,
  onMarkComplete
}) => {
  if (!chapter) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gradient-to-br from-background via-background to-background/95 animate-fade-in">
      {/* Futuristic background decorative elements */}
      <div className="fixed left-0 top-0 h-full w-full overflow-hidden pointer-events-none">
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--primary) / 0.5) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--primary) / 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px'
          }}>
        </div>
        
        {/* Glowing orbs */}
        <div className="fixed top-20 right-20 w-64 h-64 rounded-full blur-3xl bg-primary/5"></div>
        <div className="fixed bottom-20 left-20 w-80 h-80 rounded-full blur-3xl bg-violet-500/5"></div>
      </div>
      
      <div className="content-section mx-auto max-w-4xl px-6 py-8 relative z-10">
        <div className="flex flex-wrap items-center justify-between mb-8 relative gap-4">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="mr-4 glass hover:bg-white/30 dark:hover:bg-black/30"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold gradient-text">
              {chapter.title}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {onOpenNotes && (
              <Button
                variant="outline"
                onClick={onOpenNotes}
                className="flex items-center gap-2 glass hover:bg-white/30 dark:hover:bg-black/30"
              >
                <FileText className="h-4 w-4" />
                Open Notes
              </Button>
            )}
            
            {!isCompleted && onMarkComplete && (
              <Button
                onClick={onMarkComplete}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-violet-600"
              >
                <Check className="h-4 w-4" />
                Mark as Complete
              </Button>
            )}
          </div>
        </div>
        
        <div className="glass rounded-xl p-6 md:p-8 shadow-xl shadow-primary/5 border border-white/20 dark:border-white/5">
          <div className="prose prose-violet max-w-none dark:prose-invert">
            {chapter.content}
          </div>
          
          {/* Additional resources section */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-lg font-bold mb-4 gradient-text">Additional Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a 
                href="https://www.geeksforgeeks.org/operating-systems/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 glass rounded-lg flex items-start gap-3 transition-all hover:bg-white/10 group"
              >
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <ExternalLink className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">GeeksforGeeks OS Tutorial</h4>
                  <p className="text-sm text-muted-foreground">Comprehensive text-based tutorials</p>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </a>
              
              <a 
                href="https://www.youtube.com/c/nesoacademy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 glass rounded-lg flex items-start gap-3 transition-all hover:bg-white/10 group"
              >
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Neso Academy Videos</h4>
                  <p className="text-sm text-muted-foreground">In-depth video lectures</p>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </a>
            </div>
          </div>
          
          {/* Practice section */}
          <div className="mt-8 p-6 border border-white/10 rounded-lg bg-primary/5">
            <h3 className="text-lg font-bold mb-4 gradient-text">Test Your Knowledge</h3>
            <p className="text-muted-foreground mb-4">Answer these questions to reinforce your learning of this chapter:</p>
            
            <div className="space-y-6">
              <div className="p-4 glass rounded-lg">
                <p className="font-medium mb-3">1. What is the primary function of an operating system?</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="radio" id="q1-a" name="q1" className="accent-primary" />
                    <label htmlFor="q1-a" className="text-sm">Manage hardware resources</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="radio" id="q1-b" name="q1" className="accent-primary" />
                    <label htmlFor="q1-b" className="text-sm">Run applications</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="radio" id="q1-c" name="q1" className="accent-primary" />
                    <label htmlFor="q1-c" className="text-sm">Provide user interface</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="radio" id="q1-d" name="q1" className="accent-primary" />
                    <label htmlFor="q1-d" className="text-sm">All of the above</label>
                  </div>
                </div>
              </div>
              
              <div className="p-4 glass rounded-lg">
                <p className="font-medium mb-3">2. What is a process in the context of operating systems?</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="radio" id="q2-a" name="q2" className="accent-primary" />
                    <label htmlFor="q2-a" className="text-sm">A program in execution</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="radio" id="q2-b" name="q2" className="accent-primary" />
                    <label htmlFor="q2-b" className="text-sm">Any software application</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="radio" id="q2-c" name="q2" className="accent-primary" />
                    <label htmlFor="q2-c" className="text-sm">A hardware component</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="radio" id="q2-d" name="q2" className="accent-primary" />
                    <label htmlFor="q2-d" className="text-sm">A memory segment</label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button className="bg-gradient-to-r from-primary to-violet-600">
                Check Answers
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentView;
