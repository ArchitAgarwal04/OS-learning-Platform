'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  BookOpen, Layers, Split, Clock, Link, Ban, Database, 
  Box, Folder, HardDrive, Save, Shield, Microscope, 
  ArrowRight, Zap, FileText, BookMinus, BookCheck, FileQuestion,
  Trophy, ListTodo, User, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Play, Award, TrendingUp, Brain } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { ProgressBar } from "@/components/ProgressBar"
import { NotesPanel } from "@/components/NotesPanel"

import ContentView from "@/components/ContentView"
import ChapterCard from "@/components/ChapterCard"
import { chaptersData, ChapterContent } from "@/data/chapters";
import { 
  calculateCompletion, 
  getLastVisitedChapter, 
  isChapterCompleted,
  markChapterComplete,
  setLastVisitedChapter
} from "@/utils/progressService";
import { 
  markChapterComplete as markComplete,
  isChapterCompleted as isCompleted,
  calculateCompletion as calcCompletion,
  getCompletedChapters,
  updateStudyStreak,
  getStudyStreak,
  checkAndAwardBadges,
  getEarnedBadges,
  setLastVisitedChapter as setLastVisited,
  getLastVisitedChapter as getLastVisited
} from "@/lib/progress";
import { toast } from "sonner";

// Extended icon map with more icons for subtopics
const iconMap: Record<string, React.ReactNode> = {
  "BookOpen": <BookOpen className="h-5 w-5" />,
  "Layers": <Layers className="h-5 w-5" />,
  "Split": <Split className="h-5 w-5" />,
  "Clock": <Clock className="h-5 w-5" />,
  "Link": <Link className="h-5 w-5" />,
  "Ban": <Ban className="h-5 w-5" />,
  "Database": <Database className="h-5 w-5" />,
  "Box": <Box className="h-5 w-5" />,
  "Folder": <Folder className="h-5 w-5" />,
  "HardDrive": <HardDrive className="h-5 w-5" />,
  "Save": <Save className="h-5 w-5" />,
  "Shield": <Shield className="h-5 w-5" />,
  "Microscope": <Microscope className="h-5 w-5" />,
  "FileText": <FileText className="h-5 w-5" />,
  "BookMinus": <BookMinus className="h-5 w-5" />,
  "BookCheck": <BookCheck className="h-5 w-5" />,
};

// Define subtopic structure
interface SubTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// Enhanced dashboard view
const Dashboard: React.FC = () => {  const [progress, setProgress] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState<ChapterContent | null>(null);
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [studyStreak, setStudyStreak] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const router = useRouter();
  const { user, loading } = useAuth();


  // Subtopics mapping - in real app this would be in a database
  const subTopics: Record<string, SubTopic[]> = {
    "chapter-1": [
      { id: "ch1-sub1", title: "OS Concepts", description: "Basic concepts and history", icon: "BookOpen" },
      { id: "ch1-sub2", title: "OS Structure", description: "Kernel and system calls", icon: "Layers" }
    ],
    "chapter-2": [
      { id: "ch2-sub1", title: "Process States", description: "Process lifecycle", icon: "Split" },
      { id: "ch2-sub2", title: "Process Control Block", description: "PCB structure", icon: "Database" }
    ],
    "chapter-3": [
      { id: "ch3-sub1", title: "Thread Models", description: "User vs kernel threads", icon: "Split" },
      { id: "ch3-sub2", title: "Thread Libraries", description: "Pthreads, Java threads", icon: "Box" }
    ],
    "chapter-4": [
      { id: "ch4-sub1", title: "Scheduling Criteria", description: "CPU utilization, throughput", icon: "Clock" },
      { id: "ch4-sub2", title: "Scheduling Algorithms", description: "FCFS, SJF, RR", icon: "Clock" }
    ],
  };  // Initialize progress data from localStorage
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
      return
    }

    if (user) {
      loadLocalProgress();
      checkStudyStreak();
    }
  }, [user, loading, router]);

  const loadLocalProgress = () => {
    // Load progress from localStorage
    const completed = getCompletedChapters();
    setCompletedChapters(completed);
    
    // Calculate progress percentage
    const progressPercent = calcCompletion(chaptersData.length);
    setProgress(progressPercent);
    
    // Load study streak
    const streak = getStudyStreak();
    setStudyStreak(streak);
    
    // Load earned badges
    const earnedBadges = getEarnedBadges();
    setBadges(earnedBadges.map(badge => badge.title));
  };

  // Update badges when progress changes
  useEffect(() => {
    updateBadges();
  }, [completedChapters, studyStreak]);
  const loadUserData = async () => {
    // This function is no longer needed since we're using localStorage
    // Keeping it empty to avoid breaking existing references
  }

  const updateProgress = () => {
    // Calculate completion percentage using local storage
    const completionPercentage = calcCompletion(chaptersData.length);
    setProgress(completionPercentage);

    // Get list of completed chapters from local storage
    const completed = getCompletedChapters();
    setCompletedChapters(completed);
  };
  // Check and update study streak using local storage
  const checkStudyStreak = () => {
    const streak = updateStudyStreak();
    setStudyStreak(streak);
  };  // Update badges based on progress using local storage
  const updateBadges = () => {
    const earnedBadges: string[] = [];

    // Completion badges
    const completionPercentage = calcCompletion(chaptersData.length);
    if (completionPercentage >= 25) earnedBadges.push("Beginner");
    if (completionPercentage >= 50) earnedBadges.push("Intermediate");
    if (completionPercentage >= 75) earnedBadges.push("Advanced");
    if (completionPercentage === 100) earnedBadges.push("OS Master");

    // Chapter-specific badges
    if (isCompleted("chapter-2")) earnedBadges.push("Process Pro");
    if (isCompleted("chapter-3")) earnedBadges.push("Thread Theorist");
    if (isCompleted("chapter-7")) earnedBadges.push("Memory Maven");

    // Streak badges
    if (studyStreak >= 3) earnedBadges.push("Consistent Learner");
    if (studyStreak >= 7) earnedBadges.push("Weekly Wonder");

    setBadges(earnedBadges);
  };  const handleChapterClick = (chapterId: string) => {
    // Find chapter content
    const chapter = chaptersData.find((c) => c.id === chapterId);
    if (chapter) {
      // Set last visited chapter in localStorage
      setLastVisited(chapterId);
      setSelectedChapter({
        id: chapter.id,
        title: chapter.title,
        content: chapter.content
      });
      setActiveChapterId(chapterId);
    }
  };  const handleMarkComplete = (chapterId: string) => {
    // Mark chapter complete in localStorage
    markComplete(chapterId);
    
    // Update local state
    loadLocalProgress();
    toast.success("Chapter marked as complete!");
  };

  const handleMarkIncomplete = (chapterId: string) => {
    // Remove from completed chapters in localStorage
    const completed = getCompletedChapters().filter(id => id !== chapterId);
    localStorage.setItem('completed_chapters', JSON.stringify(completed));
    
    // Update local state
    loadLocalProgress();
    toast.success("Chapter marked as incomplete!");
  };

  // Add a toggle function to handle both marking complete and incomplete
  const toggleChapterCompletion = (chapterId: string) => {
    if (completedChapters.includes(chapterId)) {
      handleMarkIncomplete(chapterId);
    } else {
      handleMarkComplete(chapterId);
    }
  };

  const toggleExpand = (chapterId: string) => {
    if (expandedChapters.includes(chapterId)) {
      setExpandedChapters(expandedChapters.filter(id => id !== chapterId));
    } else {
      setExpandedChapters([...expandedChapters, chapterId]);
    }
  };  const handleResumeClick = () => {
    const lastChapterId = getLastVisited();
    if (lastChapterId) {
      handleChapterClick(lastChapterId);
    } else {
      // If no last visited chapter, select the first uncompleted one
      const firstUncompleted = chaptersData.find(
        (chapter) => !completedChapters.includes(chapter.id)
      );
      if (firstUncompleted) {
        handleChapterClick(firstUncompleted.id);
      } else {
        // If all completed, go to first chapter
        handleChapterClick(chaptersData[0].id);
      }
    }
  };

  const handleCloseContent = () => {
    setSelectedChapter(null);
    setActiveChapterId(null);
  };

  const openNotesPanel = (chapterId: string) => {
    setActiveChapterId(chapterId);
    setShowNotesPanel(true);
  };

  const toggleView = () => {
    setView(view === 'grid' ? 'list' : 'grid');
  };
  // Debugging log to monitor changes in completedChapters state
  useEffect(() => {
    console.log("Completed Chapters:", completedChapters);
  }, [completedChapters]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/90">
      {selectedChapter ? (
        <ContentView 
          chapter={selectedChapter} 
          onClose={handleCloseContent}
          onOpenNotes={() => setShowNotesPanel(true)}
          isCompleted={completedChapters.includes(selectedChapter.id)}
          onMarkComplete={() => handleMarkComplete(selectedChapter.id)}
        />
      ) : (
        <div className="container py-8 relative">
          {/* Futuristic background elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
            <div className="fixed top-40 right-20 w-80 h-80 rounded-full blur-3xl bg-primary/5 animate-float"></div>
            <div className="fixed bottom-20 left-40 w-96 h-96 rounded-full blur-3xl bg-violet-500/5 animate-float" style={{ animationDelay: "2s" }}></div>
          </div>

          {/* Header & Navigation */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 relative z-10 stagger-animation">
            <div className="space-y-1 animate-slide-up">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary animate-pulse-subtle">
                  <Zap className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold gradient-text">
                  OS Learning Dashboard
                </h1>
              </div>
              <p className="text-muted-foreground mt-1 pl-10">
                Explore operating systems concepts with interactive modules
              </p>
            </div>

            <div className="flex items-center gap-4 animate-slide-up">
              <div className="flex items-center gap-1 px-3 py-1 glass rounded-full border border-white/10">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-yellow-200">Streak: {studyStreak} {studyStreak > 1 ? 'days' : 'day'}</span>
              </div>

              <Button 
                variant="outline"
                className="glass hover:bg-white/20"
                onClick={toggleView}
              >
                {view === 'grid' ? 'List View' : 'Grid View'}
              </Button>

              <Button 
                onClick={handleResumeClick}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-700 shadow-lg shadow-primary/20 border-0 animate-pulse-subtle"
              >
                Resume Learning
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button 
                variant="outline" 
                onClick={() => router.push("/")}
                className="glass hover:bg-white/20"
              >
                Back to Home
              </Button>
            </div>
          </div>

          {/* Progress Bar and Badges */}
          <div className="glass rounded-xl p-6 mb-8 shadow-lg shadow-primary/5 border border-white/10 dark:border-white/5 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-medium">Your Learning Progress</h2>
                  <span className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                    {progress}% Complete
                  </span>
                </div>
                <ProgressBar progress={progress} />
              </div>

              {/* Badges section */}
              <div className="flex flex-wrap gap-2 md:w-1/3">
                {badges.map((badge, index) => (
                  <div 
                    key={badge} 
                    className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary/20 to-violet-600/20 border border-primary/30 flex items-center gap-1"
                    title={badge}
                  >
                    <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {badge}
                  </div>
                ))}

                {badges.length === 0 && (
                  <span className="text-sm text-muted-foreground">Complete chapters to earn badges!</span>
                )}
              </div>
            </div>

            {progress === 100 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-green-100/10 to-emerald-100/5 dark:from-green-900/10 dark:to-emerald-900/5 text-green-700 dark:text-green-300 rounded-lg glass border border-green-200/30 dark:border-green-500/20 animate-pulse-subtle">
                <p className="text-center font-medium flex items-center justify-center gap-2">
                  🎉 Congratulations! You've mastered all operating system concepts.
                </p>
              </div>
            )}
          </div>

          {/* Quick Stats Section - REMOVED FOR TESTING */}

          {/* Chapter Content */}
          {view === 'grid' ? (
            // Grid view of chapters
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-animation">
              {chaptersData.map((chapter) => (
                <div key={chapter.id} className="space-y-2">
                  <ChapterCard
                    id={chapter.id}
                    title={chapter.title}
                    description={chapter.description}
                    icon={iconMap[chapter.icon] || <BookOpen className="h-5 w-5" />}
                    isCompleted={completedChapters.includes(chapter.id)}
                    onClick={() => handleChapterClick(chapter.id)}
                    onMarkComplete={() => handleMarkComplete(chapter.id)}
                    onToggleExpand={() => toggleExpand(chapter.id)}
                    onOpenNotes={() => openNotesPanel(chapter.id)}
                    isExpanded={expandedChapters.includes(chapter.id)}
                  />

                  {/* Subtopics */}
                  {expandedChapters.includes(chapter.id) && subTopics[chapter.id] && (
                    <div className="ml-8 space-y-2 animate-fade-in">
                      {subTopics[chapter.id].map((subTopic) => (
                        <div 
                          key={subTopic.id}
                          className="p-3 glass rounded-lg border border-white/5 flex items-center gap-3 cursor-pointer transition-all hover:translate-y-[-2px] hover:bg-white/10"
                          onClick={() => handleChapterClick(chapter.id)}
                        >
                          <div className="p-2 rounded-md bg-primary/10 text-primary">
                            {iconMap[subTopic.icon] || <FileText className="h-4 w-4" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">{subTopic.title}</h4>
                            <p className="text-xs text-muted-foreground">{subTopic.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // List view of chapters
            <div className="space-y-3 animate-slide-up">
              {chaptersData.map((chapter) => (
                <div key={chapter.id} className="glass rounded-lg overflow-hidden border border-white/10">
                  <div 
                    className={`p-4 flex items-center justify-between cursor-pointer ${
                      completedChapters.includes(chapter.id)
                        ? "bg-green-900/10 border-b border-green-500/20"
                        : "bg-primary/5 border-b border-white/10"
                    }`}
                    onClick={() => toggleExpand(chapter.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${
                        completedChapters.includes(chapter.id)
                          ? "bg-green-100/10 text-green-400"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {iconMap[chapter.icon] || <BookOpen className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="font-medium">{chapter.title}</h3>
                        <p className="text-sm text-muted-foreground">{chapter.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {completedChapters.includes(chapter.id) ? (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleChapterCompletion(chapter.id);
                          }}
                          className="text-xs bg-gradient-to-r from-red-600 to-red-800"
                        >
                          Mark Incomplete
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleChapterCompletion(chapter.id);
                          }}
                          className="text-xs bg-gradient-to-r from-primary to-violet-600"
                        >
                          Mark Complete
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          openNotesPanel(chapter.id);
                        }}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChapterClick(chapter.id);
                        }}
                      >
                        <BookOpen className="h-4 w-4" />
                      </Button>

                      {expandedChapters.includes(chapter.id) ? (
                        <ChevronUp className="h-5 w-5 ml-2" />
                      ) : (
                        <ChevronDown className="h-5 w-5 ml-2" />
                      )}
                    </div>
                  </div>

                  {/* Expanded content with subtopics */}
                  {expandedChapters.includes(chapter.id) && (
                    <div className="p-4 animate-fade-in">
                      <h4 className="text-sm font-medium mb-3 text-primary">Subtopics:</h4>
                      <div className="space-y-2">
                        {subTopics[chapter.id]?.map((subTopic) => (
                          <div 
                            key={subTopic.id}
                            className="p-3 glass rounded-lg flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-all"
                            onClick={() => handleChapterClick(chapter.id)}
                          >
                            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                              {iconMap[subTopic.icon] || <FileText className="h-4 w-4" />}
                            </div>
                            <div>
                              <h5 className="text-sm font-medium">{subTopic.title}</h5>
                              <p className="text-xs text-muted-foreground">{subTopic.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Key stats and resources */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 glass rounded-lg flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-xs">Est. time: 45 mins</span>
                        </div>
                        <div className="p-3 glass rounded-lg flex items-center gap-2">
                          <FileQuestion className="h-4 w-4 text-primary" />
                          <span className="text-xs">15 practice questions</span>
                        </div>
                      </div>

                      {/* Mark Complete Button - Added to bottom of expanded view */}
                      <div className="mt-4 flex justify-end">
                        {!completedChapters.includes(chapter.id) && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkComplete(chapter.id);
                            }}
                            className="text-xs bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-700"
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notes Panel */}
      {showNotesPanel && activeChapterId && (
        <NotesPanel 
          chapterId={activeChapterId} 
          onClose={() => setShowNotesPanel(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;