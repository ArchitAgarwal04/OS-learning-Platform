
// Interface for notes data
export interface Note {
  id: string;
  chapterId: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

// Local storage key
const NOTES_KEY = "os_learn_notes";

// Load notes from localStorage
export const loadNotes = (): Note[] => {
  try {
    const savedNotes = localStorage.getItem(NOTES_KEY);
    if (savedNotes) {
      return JSON.parse(savedNotes) as Note[];
    }
  } catch (error) {
    console.error("Failed to load notes data:", error);
  }
  
  // Return default empty notes if nothing is saved
  return [];
};

// Save notes to localStorage
export const saveNotes = (notes: Note[]): void => {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error("Failed to save notes data:", error);
  }
};

// Get notes for a specific chapter
export const getNotesByChapter = (chapterId: string): Note[] => {
  const notes = loadNotes();
  return notes.filter(note => note.chapterId === chapterId);
};

// Add a new note
export const addNote = (chapterId: string, content: string): Note => {
  const notes = loadNotes();
  
  const newNote: Note = {
    id: generateId(),
    chapterId,
    content,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  notes.push(newNote);
  saveNotes(notes);
  
  return newNote;
};

// Update an existing note
export const updateNote = (noteId: string, content: string): Note | null => {
  const notes = loadNotes();
  
  const noteIndex = notes.findIndex(note => note.id === noteId);
  if (noteIndex === -1) return null;
  
  notes[noteIndex].content = content;
  notes[noteIndex].updatedAt = Date.now();
  
  saveNotes(notes);
  
  return notes[noteIndex];
};

// Delete a note
export const deleteNote = (noteId: string): boolean => {
  const notes = loadNotes();
  
  const filteredNotes = notes.filter(note => note.id !== noteId);
  
  if (filteredNotes.length === notes.length) return false;
  
  saveNotes(filteredNotes);
  return true;
};

// Generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};