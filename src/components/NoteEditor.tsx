import { useState, useEffect, useRef } from 'preact/hooks';
import { ArrowLeft, X, Tag, Plus, Save } from 'lucide-preact';
import type { Note } from '../types/note';

interface Props {
  note: Note | null;
  onSave: (data: { title: string; content: string; tags: string[] }) => void;
  onCancel: () => void;
  /** モバイルで一覧に戻るボタン用（任意） */
  onBack?: () => void;
}

export function NoteEditor({ note, onSave, onCancel, onBack }: Props) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [tags, setTags] = useState<string[]>(note?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // 編集対象が変わったら初期化し、タイトル欄にフォーカス
  useEffect(() => {
    setTitle(note?.title ?? '');
    setContent(note?.content ?? '');
    setTags(note?.tags ?? []);
    setTagInput('');
    if (!note) {
      requestAnimationFrame(() => titleRef.current?.focus());
    }
  }, [note?.id]);

  // テキストエリア自動リサイズ
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [content]);

  // Ctrl/Cmd+S で保存
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave({ title, content, tags });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [title, content, tags, onSave]);

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput('');
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  const doSave = () => onSave({ title, content, tags });

  return (
    <div class="flex flex-col h-full">
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
          value={title}
          onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
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

      {/* テキストエリア — フローティングバーの高さ分だけ下余白を取る */}
      <div class="flex-1 px-4 overflow-y-auto pb-24">
        <label
          class="block text-xs font-medium mb-1"
          style={{ color: 'var(--color-text-muted)' }}
          for="note-content"
        >
          プロンプト本文
        </label>
        <textarea
          id="note-content"
          ref={textareaRef}
          value={content}
          onInput={(e) => setContent((e.target as HTMLTextAreaElement).value)}
          placeholder="ここにプロンプトを入力..."
          class="w-full bg-transparent border-none outline-none text-sm leading-relaxed min-h-[200px]"
          style={{
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-sans)',
          }}
          rows={1}
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
        class="sticky bottom-0 shrink-0 border-t"
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
          {tags.map((tag) => (
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
