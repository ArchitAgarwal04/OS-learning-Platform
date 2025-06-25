import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save, X } from "lucide-react";
import { Note, getNotesByChapter, addNote, updateNote, deleteNote } from "@/utils/notesService";
import { formatDistanceToNow } from "date-fns";
import { trackNoteView } from "@/lib/analytics";

interface NotesPanelProps {
  chapterId: string;
  onClose: () => void;
}

const NotesPanel: React.FC<NotesPanelProps> = ({ chapterId, onClose }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Load notes for this chapter
  useEffect(() => {
    const chapterNotes = getNotesByChapter(chapterId);
    setNotes(chapterNotes);
  }, [chapterId]);

  const handleAddNote = () => {
    const newNote = addNote(chapterId, "");
    setNotes([...notes, newNote]);
    setActiveNoteId(newNote.id);
    setEditedContent("");
    setIsEditing(true);
  };

  const handleEditNote = (note: Note) => {
    setActiveNoteId(note.id);
    setEditedContent(note.content);
    setIsEditing(true);
    
    // Track note view with Google Analytics
    trackNoteView(`${chapterId}-${note.id}`);
  };

  const handleSaveNote = () => {
    if (activeNoteId && editedContent.trim()) {
      const updatedNote = updateNote(activeNoteId, editedContent);
      if (updatedNote) {
        setNotes(notes.map(note => 
          note.id === activeNoteId ? updatedNote : note
        ));
      }
    }
    setIsEditing(false);
    setActiveNoteId(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setActiveNoteId(null);
  };

  const handleDeleteNote = (noteId: string) => {
    if (deleteNote(noteId)) {
      setNotes(notes.filter(note => note.id !== noteId));
      if (activeNoteId === noteId) {
        setIsEditing(false);
        setActiveNoteId(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl h-[80vh] glass border border-white/20 dark:border-white/10 rounded-lg shadow-xl overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-white/10 dark:border-white/5">
          <h2 className="text-xl font-bold gradient-text">Chapter Notes</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex h-[calc(80vh-64px)]">
          {/* Notes list sidebar */}
          <div className="w-1/3 border-r border-white/10 dark:border-white/5 h-full overflow-auto">
            <div className="p-4">
              <Button 
                onClick={handleAddNote} 
                className="w-full flex items-center gap-2 bg-gradient-to-r from-primary to-violet-600"
              >
                <Plus className="h-4 w-4" />
                Add Note
              </Button>
            </div>
            
            <div className="px-2">
              {notes.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">
                  No notes yet. Create one!
                </div>
              ) : (
                <ul className="space-y-2">
                  {notes.map(note => (
                    <li key={note.id} className="relative">
                      <div 
                        className={`p-3 rounded-md cursor-pointer transition-all ${
                          activeNoteId === note.id 
                            ? 'bg-primary/30 border border-primary/50' 
                            : 'hover:bg-white/5'
                        }`}
                        onClick={() => handleEditNote(note)}
                      >
                        <p className="line-clamp-2 text-sm">
                          {note.content || "Empty note..."}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-destructive/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* Note editor */}
          <div className="w-2/3 h-full flex flex-col">
            {activeNoteId ? (
              <>
                <div className="flex-1 p-4">
                  {isEditing ? (
                    <textarea
                      className="w-full h-full p-3 rounded-md bg-background/50 border border-white/10 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      placeholder="Write your note here..."
                      autoFocus
                    />
                  ) : (
                    <div className="w-full h-full p-3 overflow-auto whitespace-pre-wrap">
                      {notes.find(note => note.id === activeNoteId)?.content || ""}
                    </div>
                  )}
                </div>
                <div className="border-t border-white/10 p-3 flex justify-end gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSaveNote}
                        className="bg-gradient-to-r from-primary to-violet-600 flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save Note
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => handleEditNote(notes.find(note => note.id === activeNoteId)!)}
                      className="bg-gradient-to-r from-primary to-violet-600"
                    >
                      Edit Note
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 animate-pulse-subtle">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 gradient-text">No Note Selected</h3>
                <p className="text-muted-foreground mb-6">
                  Select a note from the sidebar or create a new one to get started.
                </p>
                <Button 
                  onClick={handleAddNote}
                  className="bg-gradient-to-r from-primary to-violet-600 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create New Note
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { NotesPanel };
