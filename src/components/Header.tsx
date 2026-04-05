import { Plus } from 'lucide-preact';
import { ThemeToggle } from './ThemeToggle';

interface Props {
  onNewNote: () => void;
}

export function Header({ onNewNote }: Props) {
  return (
    <header
      class="h-14 flex items-center justify-between px-4 border-b"
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
    </header>
  );
}
