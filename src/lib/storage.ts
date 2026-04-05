import type { Note, SortBy, Theme } from '../types/note';
import { STORAGE_KEYS } from './constants';

export const storage = {
  getNotes(): Note[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      return data ? (JSON.parse(data) as Note[]) : [];
    } catch {
      console.error('Failed to parse notes from localStorage');
      return [];
    }
  },

  saveNotes(notes: Note[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  },

  getTheme(): Theme {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as Theme) || 'dark';
  },

  setTheme(theme: Theme): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  getSortBy(): SortBy {
    return (localStorage.getItem(STORAGE_KEYS.SORT) as SortBy) || 'updatedAt';
  },

  setSortBy(sort: SortBy): void {
    localStorage.setItem(STORAGE_KEYS.SORT, sort);
  },

  exportAll(): string {
    const notes = this.getNotes();
    return JSON.stringify(notes, null, 2);
  },

  importNotes(json: string): Note[] {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) throw new Error('Invalid format: expected an array');
    this.saveNotes(parsed as Note[]);
    return parsed as Note[];
  },
};
