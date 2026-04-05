import { useEffect, useRef } from 'preact/hooks';
import { SortDesc, Star } from 'lucide-preact';
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
}

const SORT_LABELS: Record<SortBy, string> = {
  updatedAt: '更新日時',
  createdAt: '作成日時',
  title: 'タイトル',
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
}: Props) {
  const isFiltering = Boolean(searchQuery || selectedTag || showFavoritesOnly);
  const noFilter = !selectedTag && !showFavoritesOnly;
  const favCount = notes.filter((n) => n.isFavorite).length;
  const listRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(false);
  const prevNotesLenRef = useRef(notes.length);

  // 初回マウント: 全カード入場アニメーション
  // ノート追加時: 先頭1枚だけアニメーション
  // 削除・フィルタ変更・ソート変更: アニメーションなし
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      if (filteredNotes.length > 0) animateCards(listRef.current, false);
    } else if (notes.length > prevNotesLenRef.current && filteredNotes.length > 0) {
      animateCards(listRef.current, true);
    }
    prevNotesLenRef.current = notes.length;
  // notes.length の変化のみを監視（filteredNotes の変化では再アニメートしない）
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes.length]);

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

      {/* フィルタータブ（常に表示） */}
      <div class="px-3 pb-2 flex gap-1.5 flex-wrap items-center">
        {/* すべて */}
        <FilterButton active={noFilter} onClick={onClearFilters}>
          すべて
        </FilterButton>

        {/* お気に入り */}
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

        {/* タグ */}
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

      {/* カウント表示 */}
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

      {/* リスト */}
      <div ref={listRef} class="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-2">
        {filteredNotes.length === 0 ? (
          <EmptyState isSearching={isFiltering} onNewNote={onNewNote} />
        ) : (
          filteredNotes.map((note) => (
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
          ))
        )}
      </div>
    </div>
  );
}
