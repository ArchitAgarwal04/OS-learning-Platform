// Progress service for tracking user progress through the course

const STORAGE_KEYS = {
  COMPLETED_CHAPTERS: 'completed_chapters',
  LAST_VISITED: 'last_visited_chapter',
  LAST_VISIT_DATE: 'last_visit_date',
  STUDY_STREAK: 'study_streak',
  EARNED_BADGES: 'earned_badges'
};

export interface Badge {
  id: string;
  title: string;
  description: string;
  type: 'achievement' | 'progress' | 'streak';
}

// Calculate overall course completion percentage
export const calculateCompletion = (totalChapters: number): number => {
  const completed = getCompletedChapters();
  return Math.round((completed.length / totalChapters) * 100);
};

// Mark a chapter as completed
export const markChapterComplete = (chapterId: string): void => {
  const completed = getCompletedChapters();
  if (!completed.includes(chapterId)) {
    completed.push(chapterId);
    localStorage.setItem(STORAGE_KEYS.COMPLETED_CHAPTERS, JSON.stringify(completed));
    updateStudyStreak();
    checkAndAwardBadges();
  }
};

// Check if a specific chapter is completed
export const isChapterCompleted = (chapterId: string): boolean => {
  const completed = getCompletedChapters();
  return completed.includes(chapterId);
};

// Get all completed chapters
export const getCompletedChapters = (): string[] => {
  const completed = localStorage.getItem(STORAGE_KEYS.COMPLETED_CHAPTERS);
  return completed ? JSON.parse(completed) : [];
};

// Set the last visited chapter
export const setLastVisitedChapter = (chapterId: string): void => {
  localStorage.setItem(STORAGE_KEYS.LAST_VISITED, chapterId);
};

// Get the last visited chapter
export const getLastVisitedChapter = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LAST_VISITED);
};

// Update study streak
export const updateStudyStreak = (): number => {
  const today = new Date().toDateString();
  const lastVisit = localStorage.getItem(STORAGE_KEYS.LAST_VISIT_DATE);
  const currentStreak = parseInt(localStorage.getItem(STORAGE_KEYS.STUDY_STREAK) || '0');
  
  let newStreak = currentStreak;
  
  if (lastVisit) {
    const lastVisitDate = new Date(lastVisit);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastVisitDate.toDateString() === yesterday.toDateString()) {
      // User visited yesterday, increment streak
      newStreak = currentStreak + 1;
    } else if (lastVisitDate.toDateString() !== today) {
      // User didn't visit yesterday, reset streak
      newStreak = 1;
    }
  } else {
    // First visit
    newStreak = 1;
  }
  
  localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, newStreak.toString());
  localStorage.setItem(STORAGE_KEYS.LAST_VISIT_DATE, today);
  
  return newStreak;
};

// Get current study streak
export const getStudyStreak = (): number => {
  return parseInt(localStorage.getItem(STORAGE_KEYS.STUDY_STREAK) || '0');
};

// Check and award badges based on progress
export const checkAndAwardBadges = (): Badge[] => {
  const earnedBadges: Badge[] = [];
  const completionPercentage = calculateCompletion(5); // Assuming 5 main chapters
  const streak = getStudyStreak();
  
  // Progress badges
  if (completionPercentage >= 25) {
    earnedBadges.push({
      id: 'beginner',
      title: 'OS Beginner',
      description: 'Completed 25% of the course',
      type: 'progress'
    });
  }
  if (completionPercentage >= 50) {
    earnedBadges.push({
      id: 'intermediate',
      title: 'OS Explorer',
      description: 'Completed 50% of the course',
      type: 'progress'
    });
  }
  if (completionPercentage >= 75) {
    earnedBadges.push({
      id: 'advanced',
      title: 'OS Expert',
      description: 'Completed 75% of the course',
      type: 'progress'
    });
  }
  if (completionPercentage === 100) {
    earnedBadges.push({
      id: 'master',
      title: 'OS Master',
      description: 'Completed the entire course',
      type: 'progress'
    });
  }

  // Streak badges
  if (streak >= 3) {
    earnedBadges.push({
      id: 'consistent',
      title: 'Consistent Learner',
      description: '3 day study streak',
      type: 'streak'
    });
  }
  if (streak >= 7) {
    earnedBadges.push({
      id: 'dedicated',
      title: 'Dedicated Student',
      description: '7 day study streak',
      type: 'streak'
    });
  }

  // Save earned badges
  localStorage.setItem(STORAGE_KEYS.EARNED_BADGES, JSON.stringify(earnedBadges));
  return earnedBadges;
};

// Get all earned badges
export const getEarnedBadges = (): Badge[] => {
  const badges = localStorage.getItem(STORAGE_KEYS.EARNED_BADGES);
  return badges ? JSON.parse(badges) : [];
};