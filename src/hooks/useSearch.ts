import { useState, useMemo, useCallback, useRef } from 'preact/hooks';
import type { Note } from '../types/note';
import { SEARCH_DEBOUNCE_MS } from '../lib/constants';

export function useSearch(notes: Note[]) {
  const [searchQuery, setSearchQueryRaw] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const setSearchQuery = useCallback((q: string) => {
    setSearchQueryRaw(q);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(q), SEARCH_DEBOUNCE_MS);
  }, []);

  // タグフィルタとお気に入りフィルタは排他制御
  const toggleTag = useCallback((tag: string | null) => {
    setShowFavoritesOnly(false);
    setSelectedTag((prev) => (prev === tag ? null : tag));
  }, []);

  const toggleFavoritesOnly = useCallback(() => {
    setShowFavoritesOnly((prev) => {
      if (!prev) setSelectedTag(null); // お気に入り有効化 → タグクリア
      return !prev;
    });
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
