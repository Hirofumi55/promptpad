import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
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
import type { NoteDraft } from '../types/note';
import { ShortcutHelp } from './ShortcutHelp';
import { hasOpenModalDialog, isEditableTarget } from '../lib/shortcutGuards';

// エディタの状態を単一の discriminated union で管理
// selectedId + isCreating の二重管理を廃止し、不正状態を構造的に排除する
type EditorMode = 'idle' | 'create' | 'edit';

export function App() {
  const { notes, sortBy, createNote, updateNote, deleteNote, toggleFavorite, changeSortBy, reorderNotes } = useNotes();
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

  const [mode, setMode] = useState<EditorMode>('idle');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const editorPanelRef = useRef<HTMLDivElement>(null);

  const editingNote = notes.find((n) => n.id === editingId) ?? null;
  const showEditor = mode !== 'idle';

  // エディタが表示されたときにアニメーション
  useEffect(() => {
    if (mode === 'idle') return;
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      animateEditorSlideUp(editorPanelRef.current);
    } else {
      animateEditorIn(editorPanelRef.current);
    }
  }, [mode, editingId]);

  const addToast = useCallback((message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), TOAST_DURATION_MS + 300);
  }, []);

  const handleNewNote = useCallback(() => {
    setMode('create');
    setEditingId(null);
  }, []);

  const closeEditor = useCallback(() => {
    setMode('idle');
    setEditingId(null);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setMode('edit');
    setEditingId(id);
  }, []);

  const handleSave = useCallback(
    (data: NoteDraft) => {
      if (mode === 'create') {
        const note = createNote(data);
        setMode('edit');
        setEditingId(note.id);
        addToast('作成しました');
      } else if (mode === 'edit' && editingId) {
        updateNote(editingId, data);
        addToast('保存しました');
      }
    },
    [mode, editingId, createNote, updateNote, addToast],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteNote(id);
      if (editingId === id) {
        closeEditor();
      }
      addToast('削除しました');
    },
    [closeEditor, deleteNote, editingId, addToast],
  );

  const handleCopy = useCallback(
    async (text: string, id: string) => {
      const ok = await copy(text, id);
      if (ok) {
        addToast('コピーしました');
      } else {
        addToast('コピーに失敗しました');
      }
    },
    [copy, addToast],
  );

  // キーボードショートカット（グローバル）
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (hasOpenModalDialog()) return;

      const mod = e.ctrlKey || e.metaKey;
      const isEditing = isEditableTarget(e.target);

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
        closeEditor();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeEditor, handleNewNote]);

  return (
    <div
      class="flex flex-col"
      style={{ minHeight: '100dvh', background: 'var(--color-bg-primary)' }}
    >
      <Header onNewNote={handleNewNote} />

      <main class="flex flex-1 overflow-hidden" style={{ height: 'calc(100dvh - 56px)' }}>
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
            selectedId={editingId}
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
            onReorder={reorderNotes}
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
              key={mode === 'create' ? '__create__' : (editingId ?? '__idle__')}
              note={mode === 'create' ? null : editingNote}
              onSave={handleSave}
              onCancel={closeEditor}
              onBack={closeEditor}
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
