import { useEffect, useRef, useState } from 'preact/hooks';
import { SortDesc, Star, GripVertical } from 'lucide-preact';
import type { Note, SortBy } from '../types/note';
import { NoteCard } from './NoteCard';
import { SearchBar } from './SearchBar';
import { EmptyState } from './EmptyState';
import { animateCards } from '../lib/animations';

interface Props {
  notes: Note[];
  filteredNotes: Note[];
  selectedId: string | null;
  searchQuery: string;
  selectedTag: string | null;
  showFavoritesOnly: boolean;
  allTags: string[];
  sortBy: SortBy;
  copiedId: string | null;
  onSearchChange: (v: string) => void;
  onTagToggle: (tag: string | null) => void;
  onFavoritesToggle: () => void;
  onClearFilters: () => void;
  onSortChange: (s: SortBy) => void;
  onSelect: (id: string) => void;
  onCopy: (text: string, id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onNewNote: () => void;
  onReorder: (newIds: string[]) => void;
}

const SORT_LABELS: Record<SortBy, string> = {
  updatedAt: '更新日時',
  createdAt: '作成日時',
  title: 'タイトル',
  manual: '手動',
};

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: preact.ComponentChildren;
}) {
  return (
    <button
      onClick={onClick}
      class="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-colors whitespace-nowrap"
      style={{
        background: active ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
        color: active ? '#fff' : 'var(--color-text-secondary)',
        border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
      }}
    >
      {children}
    </button>
  );
}

export function NoteList({
  notes,
  filteredNotes,
  selectedId,
  searchQuery,
  selectedTag,
  showFavoritesOnly,
  allTags,
  sortBy,
  copiedId,
  onSearchChange,
  onTagToggle,
  onFavoritesToggle,
  onClearFilters,
  onSortChange,
  onSelect,
  onCopy,
  onToggleFavorite,
  onDelete,
  onNewNote,
  onReorder,
}: Props) {
  const isFiltering = Boolean(searchQuery || selectedTag || showFavoritesOnly);
  const noFilter = !selectedTag && !showFavoritesOnly;
  const favCount = notes.filter((n) => n.isFavorite).length;
  const listRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(false);
  const prevNotesLenRef = useRef(notes.length);

  // ドラッグ&ドロップ状態（手動ソートのみ有効）
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const isDndEnabled = sortBy === 'manual' && !isFiltering;

  // 初回マウント: 全カード入場アニメーション
  // ノート追加時: 先頭1枚だけアニメーション
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      if (filteredNotes.length > 0) animateCards(listRef.current, false);
    } else if (notes.length > prevNotesLenRef.current && filteredNotes.length > 0) {
      animateCards(listRef.current, true);
    }
    prevNotesLenRef.current = notes.length;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes.length]);

  function handleDrop(toId: string) {
    if (!dragId || dragId === toId) return;
    const ids = filteredNotes.map((n) => n.id);
    const fromIdx = ids.indexOf(dragId);
    const toIdx = ids.indexOf(toId);
    if (fromIdx === -1 || toIdx === -1) return;
    const newIds = [...ids];
    newIds.splice(fromIdx, 1);
    newIds.splice(toIdx, 0, dragId);
    onReorder(newIds);
    setDragId(null);
    setDragOverId(null);
  }

  return (
    <div class="flex flex-col h-full">
      {/* 検索 + ソート */}
      <div class="px-3 pt-3 pb-2 flex gap-2 items-center">
        <div class="flex-1">
          <SearchBar value={searchQuery} onChange={onSearchChange} />
        </div>
        <div class="relative shrink-0">
          <select
            value={sortBy}
            onChange={(e) => onSortChange((e.target as HTMLSelectElement).value as SortBy)}
            aria-label="ソート順"
            class="appearance-none pl-3 pr-7 py-2 rounded-xl text-xs font-medium cursor-pointer outline-none"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {(Object.keys(SORT_LABELS) as SortBy[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
          <SortDesc
            size={12}
            class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-text-muted)' }}
          />
        </div>
      </div>

      {/* フィルタータブ */}
      <div class="px-3 pb-2 flex gap-1.5 flex-wrap items-center">
        <FilterButton active={noFilter} onClick={onClearFilters}>
          すべて
        </FilterButton>
        <FilterButton active={showFavoritesOnly} onClick={onFavoritesToggle}>
          <Star
            size={10}
            fill={showFavoritesOnly ? 'currentColor' : 'none'}
            style={{ marginRight: '1px' }}
          />
          お気に入り
          {favCount > 0 && (
            <span
              class="ml-1 px-1 rounded-full text-xs font-bold leading-none"
              style={{
                background: showFavoritesOnly ? 'rgba(255,255,255,0.3)' : 'var(--color-accent-soft)',
                color: showFavoritesOnly ? '#fff' : 'var(--color-accent)',
                fontSize: '10px',
                padding: '1px 5px',
              }}
            >
              {favCount}
            </span>
          )}
        </FilterButton>
        {allTags.map((tag) => (
          <FilterButton
            key={tag}
            active={selectedTag === tag}
            onClick={() => onTagToggle(tag)}
          >
            #{tag}
          </FilterButton>
        ))}
      </div>

      {/* カウント + フィルタ解除 */}
      <div class="px-3 pb-1.5 flex items-center justify-between">
        <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {isFiltering
            ? `${filteredNotes.length} / ${notes.length} 件`
            : `${notes.length} 件`}
        </span>
        {isFiltering && (
          <button
            onClick={() => { onSearchChange(''); onClearFilters(); }}
            class="text-xs"
            style={{ color: 'var(--color-accent)' }}
          >
            フィルタを解除
          </button>
        )}
      </div>

      {/* 手動ソート時のフィルタ中ヒント */}
      {sortBy === 'manual' && isFiltering && (
        <div
          class="mx-3 mb-2 px-3 py-2 rounded-lg text-xs"
          style={{
            background: 'var(--color-accent-soft)',
            color: 'var(--color-accent)',
            border: '1px solid var(--color-accent)',
          }}
        >
          フィルタ中は並び替えできません。フィルタを解除してください。
        </div>
      )}

      {/* リスト */}
      <div ref={listRef} class="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-2">
        {filteredNotes.length === 0 ? (
          <EmptyState isSearching={isFiltering} onNewNote={onNewNote} />
        ) : (
          filteredNotes.map((note) => (
            isDndEnabled ? (
              /* ドラッグ可能ラッパー */
              <div
                key={note.id}
                draggable
                onDragStart={() => setDragId(note.id)}
                onDragOver={(e) => { e.preventDefault(); if (dragOverId !== note.id) setDragOverId(note.id); }}
                onDrop={() => handleDrop(note.id)}
                onDragEnd={() => { setDragId(null); setDragOverId(null); }}
                class="flex items-center gap-1"
                style={{
                  opacity: dragId === note.id ? 0.4 : 1,
                  borderTop: dragOverId === note.id && dragId !== note.id
                    ? '2px solid var(--color-accent)'
                    : '2px solid transparent',
                  transition: 'opacity 0.15s, border-top-color 0.1s',
                }}
              >
                {/* ドラッグハンドル */}
                <div
                  class="shrink-0 flex items-center justify-center w-5 cursor-grab active:cursor-grabbing"
                  style={{ color: 'var(--color-text-muted)', touchAction: 'none' }}
                  aria-hidden="true"
                >
                  <GripVertical size={14} />
                </div>
                <div class="flex-1 min-w-0">
                  <NoteCard
                    note={note}
                    isSelected={selectedId === note.id}
                    copiedId={copiedId}
                    onSelect={() => onSelect(note.id)}
                    onCopy={onCopy}
                    onToggleFavorite={() => onToggleFavorite(note.id)}
                    onDelete={() => onDelete(note.id)}
                  />
                </div>
              </div>
            ) : (
              <NoteCard
                key={note.id}
                note={note}
                isSelected={selectedId === note.id}
                copiedId={copiedId}
                onSelect={() => onSelect(note.id)}
                onCopy={onCopy}
                onToggleFavorite={() => onToggleFavorite(note.id)}
                onDelete={() => onDelete(note.id)}
              />
            )
          ))
        )}
      </div>
    </div>
  );
}
