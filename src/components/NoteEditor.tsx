import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'preact/hooks';
import { ArrowLeft, X, Tag, Plus, Save } from 'lucide-preact';
import type { Note, NoteDraft } from '../types/note';
import { hasOpenModalDialog } from '../lib/shortcutGuards';

interface Props {
  note: Note | null;
  onSave: (data: NoteDraft) => void;
  onCancel: () => void;
  /** モバイルで一覧に戻るボタン用（任意） */
  onBack?: () => void;
}

function createDraft(note: Note | null): NoteDraft {
  return {
    title: note?.title ?? '',
    content: note?.content ?? '',
    tags: note?.tags ?? [],
  };
}

export function NoteEditor({ note, onSave, onCancel, onBack }: Props) {
  const [draft, setDraft] = useState<NoteDraft>(() => createDraft(note));
  const [tagInput, setTagInput] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const draftRef = useRef<NoteDraft>(createDraft(note));

  const updateDraft = useCallback((updater: (current: NoteDraft) => NoteDraft) => {
    setDraft((current) => {
      const next = updater(current);
      draftRef.current = next;
      return next;
    });
  }, []);

  const buildDraftForSave = useCallback((): NoteDraft => {
    const latest = draftRef.current;
    return {
      title: titleRef.current?.value ?? latest.title,
      content: contentRef.current?.value ?? latest.content,
      tags: latest.tags,
    };
  }, []);

  // 新規作成時だけ、マウント直後にタイトル欄へフォーカスする
  useLayoutEffect(() => {
    if (!note) {
      titleRef.current?.focus();
    }
  }, [note]);

  // Ctrl/Cmd+S で保存
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        if (hasOpenModalDialog()) return;
        e.preventDefault();
        onSave(buildDraftForSave());
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [buildDraftForSave, onSave]);

  function addTag() {
    const t = tagInput.trim();
    if (!t) return;
    updateDraft((current) => (
      current.tags.includes(t)
        ? current
        : { ...current, tags: [...current.tags, t] }
    ));
    setTagInput('');
  }

  function removeTag(tag: string) {
    updateDraft((current) => ({
      ...current,
      tags: current.tags.filter((currentTag) => currentTag !== tag),
    }));
  }

  const doSave = useCallback(() => {
    onSave(buildDraftForSave());
  }, [buildDraftForSave, onSave]);

  return (
    <div class="flex-1 flex flex-col min-h-0">
      {/* モバイル専用トップバー（lg以上では非表示） */}
      {onBack && (
        <div
          class="lg:hidden flex items-center justify-between px-3 h-12 border-b shrink-0"
          style={{
            background: 'var(--color-bg-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <button
            onClick={onBack}
            class="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: 'var(--color-accent)' }}
            aria-label="一覧に戻る"
          >
            <ArrowLeft size={16} />
            一覧
          </button>
          <span class="text-sm font-semibold truncate px-4" style={{ color: 'var(--color-text-primary)' }}>
            {note ? '編集' : '新規作成'}
          </span>
          <button
            onClick={doSave}
            class="text-sm font-semibold"
            style={{ color: 'var(--color-accent)' }}
          >
            保存
          </button>
        </div>
      )}

      {/* タイトル */}
      <div class="px-4 pt-4 shrink-0">
        <label
          class="block text-xs font-medium mb-1"
          style={{ color: 'var(--color-text-muted)' }}
          for="note-title"
        >
          タイトル
        </label>
        <input
          id="note-title"
          ref={titleRef}
          type="text"
          value={draft.title}
          onInput={(e) =>
            updateDraft((current) => ({
              ...current,
              title: (e.target as HTMLInputElement).value,
            }))}
          placeholder="無題のプロンプト"
          class="w-full text-lg font-semibold bg-transparent border-none outline-none"
          style={{ color: 'var(--color-text-primary)' }}
          aria-label="タイトル"
        />
        <div
          class="mt-1 mb-3"
          style={{ height: '1px', background: 'var(--color-border)' }}
        />
      </div>

      {/* テキストエリア — flex-1 min-h-0 で親の残り高さを占有し、内部でスクロール */}
      <div class="flex-1 min-h-0 flex flex-col px-4 pt-1 pb-2">
        <label
          class="block text-xs font-medium mb-1 shrink-0"
          style={{ color: 'var(--color-text-muted)' }}
          for="note-content"
        >
          プロンプト本文
        </label>
        <textarea
          id="note-content"
          ref={contentRef}
          value={draft.content}
          onInput={(e) =>
            updateDraft((current) => ({
              ...current,
              content: (e.target as HTMLTextAreaElement).value,
            }))}
          placeholder="ここにプロンプトを入力..."
          class="flex-1 min-h-0 w-full bg-transparent border-none outline-none text-sm leading-relaxed"
          style={{
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-sans)',
            resize: 'none',
            overflowY: 'auto',
          }}
          aria-label="プロンプト本文"
        />
      </div>

      {/*
        フローティングボトムバー
        - sticky bottom-0 でスクロールに関わらず常に下部に表示
        - タグ設定 + 保存/キャンセル を1段にまとめる
        - backdrop-blur でテキストが透けて見えてもコンテキストが分かるように
      */}
      <div
        class="shrink-0 border-t"
        style={{
          background: 'var(--color-floating-bar-bg)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: 'var(--color-border)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
        }}
      >
        {/* タグ行 */}
        <div class="px-4 pt-3 pb-2 flex items-center gap-2 flex-wrap">
          <Tag size={12} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          {draft.tags.map((tag) => (
            <span
              key={tag}
              class="flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg font-medium"
              style={{ background: 'var(--color-tag-bg)', color: 'var(--color-tag-text)' }}
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                aria-label={`タグ「${tag}」を削除`}
                class="hover:opacity-70"
              >
                <X size={10} />
              </button>
            </span>
          ))}
          <div class="flex items-center gap-1">
            <input
              type="text"
              value={tagInput}
              onInput={(e) => setTagInput((e.target as HTMLInputElement).value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); addTag(); }
              }}
              placeholder="タグを追加…"
              class="text-xs bg-transparent border-none outline-none w-20"
              style={{ color: 'var(--color-text-secondary)' }}
              aria-label="タグを入力"
            />
            {tagInput.trim() && (
              <button
                onClick={addTag}
                aria-label="タグを追加"
                class="w-5 h-5 flex items-center justify-center rounded"
                style={{ color: 'var(--color-accent)' }}
              >
                <Plus size={12} />
              </button>
            )}
          </div>
        </div>

        {/* ボタン行 */}
        <div class="px-4 pb-3 flex items-center justify-end gap-2">
          {/* キャンセルはデスクトップのみ表示（モバイルはトップバーの「一覧」が同等） */}
          <button
            onClick={onCancel}
            class="hidden lg:block px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            style={{
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
            }}
          >
            キャンセル
          </button>
          <button
            onClick={doSave}
            class="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: 'var(--color-accent)' }}
          >
            <Save size={14} />
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
