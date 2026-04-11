import { Plus, BookOpen, FileText } from 'lucide-preact';
import { ThemeToggle } from './ThemeToggle';

export type AppView = 'notes' | 'guide';

interface Props {
  view: AppView;
  onViewChange: (v: AppView) => void;
  onNewNote: () => void;
}

export function Header({ view, onViewChange, onNewNote }: Props) {
  return (
    <header
      class="flex flex-col border-b"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        borderColor: 'var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* 上段: ロゴ + アクション */}
      <div class="h-14 flex items-center justify-between px-4">
        {/* ロゴ */}
        <div class="flex items-center gap-2 select-none">
          <span
            class="text-lg font-bold tracking-tight"
            style={{ color: 'var(--color-accent)' }}
          >
            PromptPad
          </span>
          <span
            class="text-xs px-1.5 py-0.5 rounded-md font-medium"
            style={{
              background: 'var(--color-accent-soft)',
              color: 'var(--color-accent)',
            }}
          >
            AI
          </span>
        </div>

        {/* アクション */}
        <div class="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={onNewNote}
            aria-label="新規プロンプト作成 (Ctrl+N)"
            class="flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-semibold transition-colors"
            style={{
              background: 'var(--color-accent)',
              color: '#fff',
            }}
          >
            <Plus size={15} />
            <span class="hidden sm:inline">新規</span>
          </button>
        </div>
      </div>

      {/* 下段: タブナビゲーション */}
      <nav
        class="flex px-4"
        role="tablist"
        aria-label="メインナビゲーション"
      >
        <button
          role="tab"
          aria-selected={view === 'notes'}
          onClick={() => onViewChange('notes')}
          class="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors"
          style={{
            color: view === 'notes' ? 'var(--color-accent)' : 'var(--color-text-muted)',
            borderColor: view === 'notes' ? 'var(--color-accent)' : 'transparent',
            background: 'transparent',
          }}
        >
          <FileText size={14} />
          プロンプト
        </button>
        <button
          role="tab"
          aria-selected={view === 'guide'}
          onClick={() => onViewChange('guide')}
          class="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors"
          style={{
            color: view === 'guide' ? 'var(--color-accent)' : 'var(--color-text-muted)',
            borderColor: view === 'guide' ? 'var(--color-accent)' : 'transparent',
            background: 'transparent',
          }}
        >
          <BookOpen size={14} />
          使い方
        </button>
      </nav>
    </header>
  );
}
