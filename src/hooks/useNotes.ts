import { useState, useCallback } from 'preact/hooks';
import type { Note, NoteDraft, SortBy } from '../types/note';
import { storage } from '../lib/storage';
import { AUTO_TITLE_MAX_LENGTH } from '../lib/constants';

function resolveNoteTitle(title: string, content: string): string {
  const firstLine = content.split('\n')[0]?.trim() ?? '';
  return title.trim() || firstLine.slice(0, AUTO_TITLE_MAX_LENGTH) || '無題のプロンプト';
}

function createNoteRecord(data: NoteDraft): Note {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: resolveNoteTitle(data.title, data.content),
    content: data.content,
    tags: data.tags,
    createdAt: now,
    updatedAt: now,
    isFavorite: false,
  };
}

function updateNoteRecord(note: Note, data: NoteDraft): Note {
  return {
    ...note,
    ...data,
    title: resolveNoteTitle(data.title, data.content),
    updatedAt: new Date().toISOString(),
  };
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => storage.getNotes());
  const [sortBy, setSortByState] = useState<SortBy>(() => storage.getSortBy());

  const commitNotes = useCallback((update: (current: Note[]) => Note[]) => {
    setNotes((current) => {
      const next = update(current);
      storage.saveNotes(next);
      return next;
    });
  }, []);

  const createNote = useCallback(
    (data: NoteDraft): Note => {
      const newNote = createNoteRecord(data);
      commitNotes((current) => [newNote, ...current]);
      return newNote;
    },
    [commitNotes],
  );

  const updateNote = useCallback(
    (id: string, data: NoteDraft): void => {
      commitNotes((current) =>
        current.map((note) => (note.id === id ? updateNoteRecord(note, data) : note)),
      );
    },
    [commitNotes],
  );

  const deleteNote = useCallback(
    (id: string): void => {
      commitNotes((current) => current.filter((note) => note.id !== id));
    },
    [commitNotes],
  );

  const toggleFavorite = useCallback(
    (id: string): void => {
      commitNotes((current) =>
        current.map((note) =>
          note.id === id
            ? { ...note, isFavorite: !note.isFavorite, updatedAt: new Date().toISOString() }
            : note,
        ),
      );
    },
    [commitNotes],
  );

  const changeSortBy = useCallback(
    (sort: SortBy): void => {
      storage.setSortBy(sort);
      setSortByState(sort);
    },
    [],
  );

  const sortedNotes = [...notes].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title, 'ja');
    return new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime();
  });

  return {
    notes: sortedNotes,
    sortBy,
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    changeSortBy,
  };
}
