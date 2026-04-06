import { useState, useMemo, useCallback, useEffect } from 'preact/hooks';
import type { Note } from '../types/note';
import { SEARCH_DEBOUNCE_MS } from '../lib/constants';

export function useSearch(notes: Note[]) {
  const [searchQuery, setSearchQueryRaw] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    if (!searchQuery) {
      setDebouncedQuery('');
      return;
    }

    const timer = window.setTimeout(() => setDebouncedQuery(searchQuery), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const setSearchQuery = useCallback((q: string) => {
    setSearchQueryRaw(q);
  }, []);

  // タグフィルタとお気に入りフィルタは排他制御
  const toggleTag = useCallback((tag: string | null) => {
    setShowFavoritesOnly(false);
    setSelectedTag((prev) => (prev === tag ? null : tag));
  }, []);

  const toggleFavoritesOnly = useCallback(() => {
    // setState updater 内で別の setState を呼ぶアンチパターンを避ける
    // favorites ON時はタグをクリア、OFF時はタグは null のまま（無害）
    setShowFavoritesOnly((prev) => !prev);
    setSelectedTag(null);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedTag(null);
    setShowFavoritesOnly(false);
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ja'));
  }, [notes]);

  const filtered = useMemo(() => {
    const q = debouncedQuery.toLowerCase();
    return notes.filter((n) => {
      const matchesQuery =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q));
      const matchesTag = !selectedTag || n.tags.includes(selectedTag);
      const matchesFavorite = !showFavoritesOnly || n.isFavorite;
      return matchesQuery && matchesTag && matchesFavorite;
    });
  }, [notes, debouncedQuery, selectedTag, showFavoritesOnly]);

  return {
    searchQuery,
    setSearchQuery,
    selectedTag,
    showFavoritesOnly,
    toggleTag,
    toggleFavoritesOnly,
    clearFilters,
    allTags,
    filtered,
  };
}
