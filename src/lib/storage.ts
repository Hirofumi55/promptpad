import type { Note, SortBy, Theme } from '../types/note';
import { STORAGE_KEYS } from './constants';

// Note スキーマ検証: 不正なデータを安全に弾く
function isValidNote(n: unknown): n is Note {
  if (!n || typeof n !== 'object') return false;
  const o = n as Record<string, unknown>;
  return (
    typeof o.id === 'string' && o.id.length > 0 &&
    typeof o.title === 'string' &&
    typeof o.content === 'string' &&
    Array.isArray(o.tags) && o.tags.every((t: unknown) => typeof t === 'string') &&
    typeof o.createdAt === 'string' &&
    typeof o.updatedAt === 'string' &&
    typeof o.isFavorite === 'boolean'
  );
}

export const storage = {
  getNotes(): Note[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (!data) return [];
      const parsed: unknown = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      // 不正なエントリは除外して残りを返す（全消去を避ける）
      return parsed.filter(isValidNote);
    } catch {
      return [];
    }
  },

  saveNotes(notes: Note[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  },

  getTheme(): Theme {
    const v = localStorage.getItem(STORAGE_KEYS.THEME);
    return v === 'dark' || v === 'light' ? v : 'dark';
  },

  setTheme(theme: Theme): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  getSortBy(): SortBy {
    const v = localStorage.getItem(STORAGE_KEYS.SORT);
    return v === 'updatedAt' || v === 'createdAt' || v === 'title' ? v : 'updatedAt';
  },

  setSortBy(sort: SortBy): void {
    localStorage.setItem(STORAGE_KEYS.SORT, sort);
  },

  exportAll(): string {
    const notes = this.getNotes();
    return JSON.stringify(notes, null, 2);
  },

  // インポート時は配列であることに加え、各要素のスキーマも検証する
  importNotes(json: string): Note[] {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) throw new Error('Invalid format: expected an array');
    const valid = parsed.filter(isValidNote);
    if (valid.length === 0 && parsed.length > 0) {
      throw new Error('Invalid format: no valid notes found');
    }
    this.saveNotes(valid);
    return valid;
  },
};
