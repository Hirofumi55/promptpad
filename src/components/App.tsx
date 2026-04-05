import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import type { Note } from '../types/note';
import { useNotes } from '../hooks/useNotes';
import { useClipboard } from '../hooks/useClipboard';
import { useSearch } from '../hooks/useSearch';
import { Header } from './Header';
import { NoteList } from './NoteList';
import { NoteEditor } from './NoteEditor';
import { Toast } from './Toast';
import type { ToastMessage } from './Toast';
import { TOAST_DURATION_MS } from '../lib/constants';
import { animateEditorIn, animateEditorSlideUp } from '../lib/animations';
import { InstallPrompt } from './InstallPrompt';
import { Keyboard } from 'lucide-preact';

// キーボードショートカットのヘルプ表示
const SHORTCUTS = [
  { key: '⌘/Ctrl + N', desc: '新規作成' },
  { key: '⌘/Ctrl + S', desc: '保存' },
  { key: '⌘/Ctrl + F', desc: '検索' },
  { key: 'Esc', desc: 'キャンセル' },
];

function ShortcutHelp() {
  const [open, setOpen] = useState(false);
  return (
    <div class="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        class="hidden lg:flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
        style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
        aria-label="キーボードショートカット一覧"
        title="キーボードショートカット"
      >
        <Keyboard size={12} />
      </button>
      {open && (
        <>
          {/* オーバーレイ */}
          <div
            class="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div
            class="absolute right-0 bottom-8 z-50 rounded-xl p-3 w-52"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-float)',
            }}
          >
            <p class="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              キーボードショートカット
            </p>
            {SHORTCUTS.map((s) => (
              <div key={s.key} class="flex items-center justify-between py-1">
                <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.desc}</span>
                <kbd
                  class="text-xs px-1.5 py-0.5 rounded font-mono"
                  style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                    fontSize: '10px',
                  }}
                >
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function App() {
  const { notes, sortBy, createNote, updateNote, deleteNote, toggleFavorite, changeSortBy } = useNotes();
  const { copiedId, copy } = useClipboard();
  const {
    searchQuery,
    setSearchQuery,
    selectedTag,
    showFavoritesOnly,
    toggleTag,
    toggleFavoritesOnly,
    clearFilters,
    allTags,
    filtered,
  } = useSearch(notes);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const editorPanelRef = useRef<HTMLDivElement>(null);

  const selectedNote: Note | null = notes.find((n) => n.id === selectedId) ?? null;
  const showEditor = isCreating || selectedId !== null;

  // エディタが表示されたときにアニメーション
  useEffect(() => {
    if (!showEditor) return;
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      animateEditorSlideUp(editorPanelRef.current);
    } else {
      animateEditorIn(editorPanelRef.current);
    }
  }, [showEditor, isCreating, selectedId]);

  const addToast = useCallback((message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), TOAST_DURATION_MS + 300);
  }, []);

  const handleNewNote = useCallback(() => {
    setSelectedId(null);
    setIsCreating(true);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setIsCreating(false);
    setSelectedId(id);
  }, []);

  const handleBack = useCallback(() => {
    setIsCreating(false);
    setSelectedId(null);
  }, []);

  const handleSave = useCallback(
    (data: { title: string; content: string; tags: string[] }) => {
      if (isCreating) {
        const note = createNote(data);
        setIsCreating(false);
        setSelectedId(note.id);
      } else if (selectedId) {
        updateNote(selectedId, data);
      }
      addToast('保存しました');
    },
    [isCreating, selectedId, createNote, updateNote, addToast],
  );

  const handleCancel = useCallback(() => {
    setIsCreating(false);
    setSelectedId(null);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteNote(id);
      if (selectedId === id) {
        setSelectedId(null);
        setIsCreating(false);
      }
    },
    [deleteNote, selectedId],
  );

  const handleCopy = useCallback(
    async (text: string, id: string) => {
      const ok = await copy(text, id);
      if (ok) addToast('コピーしました');
    },
    [copy, addToast],
  );

  // キーボードショートカット（グローバル）
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const tag = (e.target as HTMLElement).tagName;
      const isEditing = tag === 'INPUT' || tag === 'TEXTAREA';

      // Ctrl+N: 新規作成（テキスト入力中は除く）
      if (mod && e.key === 'n' && !isEditing) {
        e.preventDefault();
        handleNewNote();
      }
      // Ctrl+F: 検索欄にフォーカス
      if (mod && e.key === 'f') {
        e.preventDefault();
        (document.querySelector('[aria-label="プロンプトを検索"]') as HTMLElement)?.focus();
      }
      // Escape: エディタを閉じる（フォーカスがinput/textarea内でなければ）
      if (e.key === 'Escape' && !isEditing) {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNewNote, handleCancel]);

  return (
    <div
      class="flex flex-col"
      style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}
    >
      <Header onNewNote={handleNewNote} />

      <main class="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
        {/* 左パネル: メモ一覧（モバイルではエディタ表示中に隠す） */}
        <div
          class={`flex flex-col border-r overflow-hidden shrink-0 lg:w-80 ${showEditor ? 'hidden lg:flex' : 'flex w-full'}`}
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-primary)',
          }}
        >
          <NoteList
            notes={notes}
            filteredNotes={filtered}
            selectedId={selectedId}
            searchQuery={searchQuery}
            selectedTag={selectedTag}
            showFavoritesOnly={showFavoritesOnly}
            allTags={allTags}
            sortBy={sortBy}
            copiedId={copiedId}
            onSearchChange={setSearchQuery}
            onTagToggle={toggleTag}
            onFavoritesToggle={toggleFavoritesOnly}
            onClearFilters={clearFilters}
            onSortChange={changeSortBy}
            onSelect={handleSelect}
            onCopy={handleCopy}
            onToggleFavorite={toggleFavorite}
            onDelete={handleDelete}
            onNewNote={handleNewNote}
          />
        </div>

        {/* 右パネル: エディタ（モバイルではリスト非表示時にフルスクリーン） */}
        <div
          ref={editorPanelRef}
          class={`flex-1 flex flex-col overflow-hidden ${showEditor ? 'flex' : 'hidden lg:flex'}`}
          style={{ background: 'var(--color-bg-secondary)' }}
        >
          {showEditor ? (
            <NoteEditor
              note={isCreating ? null : selectedNote}
              onSave={handleSave}
              onCancel={handleCancel}
              onBack={handleBack}
            />
          ) : (
            /* デスクトップのプレースホルダー */
            <div class="flex-1 flex flex-col items-center justify-center gap-4 p-8">
              <p class="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
                左のリストからプロンプトを選択するか、新規作成してください
              </p>
              <ShortcutHelp />
            </div>
          )}
        </div>
      </main>

      <Toast toasts={toasts} />
      <InstallPrompt />
    </div>
  );
}
