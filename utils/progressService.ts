
// Interface for chapter data
export interface Chapter {
  id: string;
  title: string;
  description: string;
  icon: string;
  content?: string;
}

// Interface for progress data
interface ProgressData {
  completedChapters: string[];
  lastVisitedChapter?: string;
}

// Local storage key
const PROGRESS_KEY = "os_learn_progress";

// Load progress from localStorage
export const loadProgress = (): ProgressData => {
  try {
    const savedProgress = localStorage.getItem(PROGRESS_KEY);
    if (savedProgress) {
      return JSON.parse(savedProgress) as ProgressData;
    }
  } catch (error) {
    console.error("Failed to load progress data:", error);
  }
  
  // Return default progress if nothing is saved
  return { completedChapters: [] };
};

// Save progress to localStorage
export const saveProgress = (progress: ProgressData): void => {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Failed to save progress data:", error);
  }
};

// Mark a chapter as completed
export const markChapterComplete = (chapterId: string): ProgressData => {
  const progress = loadProgress();
  
  if (!progress.completedChapters.includes(chapterId)) {
    progress.completedChapters.push(chapterId);
    saveProgress(progress);
  }
  
  return progress;
};

// Set last visited chapter
export const setLastVisitedChapter = (chapterId: string): void => {
  const progress = loadProgress();
  progress.lastVisitedChapter = chapterId;
  saveProgress(progress);
};

// Calculate completion percentage
export const calculateCompletion = (totalChapters: number): number => {
  const progress = loadProgress();
  if (totalChapters === 0) return 0;
  return Math.round((progress.completedChapters.length / totalChapters) * 100);
};

// Get the ID of the last visited chapter
export const getLastVisitedChapter = (): string | undefined => {
  const progress = loadProgress();
  return progress.lastVisitedChapter;
};

// Check if a chapter is completed
export const isChapterCompleted = (chapterId: string): boolean => {
  const progress = loadProgress();
  return progress.completedChapters.includes(chapterId);
};