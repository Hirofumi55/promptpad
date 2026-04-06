import { useState } from 'preact/hooks';
import { Plus, HelpCircle } from 'lucide-preact';
import { ThemeToggle } from './ThemeToggle';
import { HelpModal } from './HelpModal';

interface Props {
  onNewNote: () => void;
}

export function Header({ onNewNote }: Props) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
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
          <button
            onClick={() => setShowHelp(true)}
            aria-label="使い方ガイドを開く"
            class="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
          >
            <HelpCircle size={16} />
          </button>
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

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </>
  );
}
