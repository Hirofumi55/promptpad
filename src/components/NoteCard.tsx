import { useState } from 'preact/hooks';
import { Star, Trash2 } from 'lucide-preact';
import type { Note } from '../types/note';
import { CopyButton } from './CopyButton';
import { DeleteConfirm } from './DeleteConfirm';
import { TAG_MAX_DISPLAY } from '../lib/constants';

interface Props {
  note: Note;
  isSelected: boolean;
  copiedId: string | null;
  onSelect: () => void;
  onCopy: (text: string, id: string) => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'たった今';
  if (mins < 60) return `${mins}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days === 1) return '昨日';
  if (days < 7) return `${days}日前`;
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function NoteCard({
  note,
  isSelected,
  copiedId,
  onSelect,
  onCopy,
  onToggleFavorite,
  onDelete,
}: Props) {
  const [showDelete, setShowDelete] = useState(false);

  const visibleTags = note.tags.slice(0, TAG_MAX_DISPLAY);
  const extraCount = note.tags.length - TAG_MAX_DISPLAY;

  return (
    <>
      <div
        class="note-card rounded-xl p-3 cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`プロンプト: ${note.title}`}
        aria-pressed={isSelected}
        style={{
          background: isSelected ? 'var(--color-accent-soft)' : 'var(--color-bg-card)',
          border: isSelected
            ? '1px solid var(--color-accent)'
            : '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
        }}
        onClick={onSelect}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      >
        {/* タイトル行 */}
        <div class="flex items-start justify-between gap-2 mb-1">
          <h3
            class="text-sm font-semibold flex-1 min-w-0 truncate leading-5"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {note.title}
          </h3>
          <div class="flex items-center gap-0.5 shrink-0">
            {/* お気に入り */}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
              aria-label={note.isFavorite ? 'お気に入り解除' : 'お気に入り登録'}
              class="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
              style={{ color: note.isFavorite ? 'var(--color-favorite)' : 'var(--color-text-muted)' }}
            >
              <Star size={13} fill={note.isFavorite ? 'currentColor' : 'none'} />
            </button>
            {/* コピー */}
            <CopyButton
              noteId={note.id}
              copiedId={copiedId}
              onCopy={() => onCopy(note.content, note.id)}
            />
            {/* 削除 */}
            <button
              onClick={(e) => { e.stopPropagation(); setShowDelete(true); }}
              aria-label="削除"
              class="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* プレビュー */}
        <p
          class="text-xs leading-relaxed mb-2"
          style={{
            color: 'var(--color-text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {note.content || '（内容なし）'}
        </p>

        {/* タグ + 日時 */}
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1 flex-wrap min-w-0">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                class="text-xs px-1.5 py-0.5 rounded-md font-medium"
                style={{
                  background: 'var(--color-tag-bg)',
                  color: 'var(--color-tag-text)',
                }}
              >
                {tag}
              </span>
            ))}
            {extraCount > 0 && (
              <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                +{extraCount}
              </span>
            )}
          </div>
          <span class="text-xs shrink-0" style={{ color: 'var(--color-text-muted)' }}>
            {formatDate(note.updatedAt)}
          </span>
        </div>
      </div>

      {showDelete && (
        <DeleteConfirm
          onConfirm={() => { setShowDelete(false); onDelete(); }}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </>
  );
}
