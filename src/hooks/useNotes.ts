import { useState, useCallback } from 'preact/hooks';
import type { Note, SortBy } from '../types/note';
import { storage } from '../lib/storage';
import { AUTO_TITLE_MAX_LENGTH } from '../lib/constants';

function generateAutoTitle(content: string): string {
  const firstLine = content.split('\n')[0]?.trim() ?? '';
  return firstLine.slice(0, AUTO_TITLE_MAX_LENGTH) || '無題のプロンプト';
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => storage.getNotes());
  const [sortBy, setSortByState] = useState<SortBy>(() => storage.getSortBy());

  const persist = useCallback((next: Note[]) => {
    storage.saveNotes(next);
    setNotes(next);
  }, []);

  const createNote = useCallback(
    (data: { title: string; content: string; tags: string[] }): Note => {
      const now = new Date().toISOString();
      const newNote: Note = {
        id: crypto.randomUUID(),
        title: data.title.trim() || generateAutoTitle(data.content),
        content: data.content,
        tags: data.tags,
        createdAt: now,
        updatedAt: now,
        isFavorite: false,
      };
      persist([newNote, ...notes]);
      return newNote;
    },
    [notes, persist],
  );

  const updateNote = useCallback(
    (id: string, data: Partial<Pick<Note, 'title' | 'content' | 'tags'>>): void => {
      const next = notes.map((n) => {
        if (n.id !== id) return n;
        const title =
          data.title !== undefined
            ? data.title.trim() || generateAutoTitle(data.content ?? n.content)
            : n.title;
        return { ...n, ...data, title, updatedAt: new Date().toISOString() };
      });
      persist(next);
    },
    [notes, persist],
  );

  const deleteNote = useCallback(
    (id: string): void => {
      persist(notes.filter((n) => n.id !== id));
    },
    [notes, persist],
  );

  const toggleFavorite = useCallback(
    (id: string): void => {
      const next = notes.map((n) =>
        n.id === id ? { ...n, isFavorite: !n.isFavorite, updatedAt: new Date().toISOString() } : n,
      );
      persist(next);
    },
    [notes, persist],
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

  return { notes: sortedNotes, sortBy, createNote, updateNote, deleteNote, toggleFavorite, changeSortBy };
}
