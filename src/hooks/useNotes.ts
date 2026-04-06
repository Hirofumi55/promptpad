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

/** manualOrder の ID リストから notes を順番に並べる（存在しない ID は無視、未収録は末尾） */
function applyManualOrder(notes: Note[], order: string[]): Note[] {
  const noteMap = new Map(notes.map((n) => [n.id, n]));
  const ordered = order.filter((id) => noteMap.has(id)).map((id) => noteMap.get(id)!);
  const inOrder = new Set(order);
  const rest = notes.filter((n) => !inOrder.has(n.id));
  return [...ordered, ...rest];
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => storage.getNotes());
  const [sortBy, setSortByState] = useState<SortBy>(() => storage.getSortBy());
  const [manualOrder, setManualOrderState] = useState<string[]>(() => storage.getManualOrder());

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
      // 手動順序の先頭に追加
      setManualOrderState((prev) => {
        const next = [newNote.id, ...prev];
        storage.setManualOrder(next);
        return next;
      });
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
      // 手動順序からも削除
      setManualOrderState((prev) => {
        const next = prev.filter((oid) => oid !== id);
        storage.setManualOrder(next);
        return next;
      });
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

  const changeSortBy = useCallback((sort: SortBy): void => {
    storage.setSortBy(sort);
    setSortByState(sort);
  }, []);

  /**
   * 手動並び替え: filteredNotes をD&Dで組み替えた後の新しい ID 配列を受け取り、
   * 全ノートに対する manualOrder を再構築して保存する。
   * D&D はフィルタなし時のみ有効なので、渡される ids は全ノートの ID と一致する。
   */
  const reorderNotes = useCallback((newIds: string[]): void => {
    setManualOrderState(() => {
      storage.setManualOrder(newIds);
      return newIds;
    });
  }, []);

  const sortedNotes =
    sortBy === 'manual'
      ? applyManualOrder(notes, manualOrder)
      : [...notes].sort((a, b) => {
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
    reorderNotes,
  };
}
