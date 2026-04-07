import { useState } from 'preact/hooks';
import { Keyboard } from 'lucide-preact';
import { KEYBOARD_SHORTCUTS } from '../lib/help-content';

export function ShortcutHelp() {
  const [open, setOpen] = useState(false);

  return (
    <div class="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        class="hidden lg:flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
        style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
        aria-label="キーボードショートカット一覧"
        title="キーボードショートカット"
      >
        <Keyboard size={12} />
      </button>
      {open && (
        <>
          <div class="fixed inset-0 z-40" onClick={() => setOpen(false)} />
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
            {KEYBOARD_SHORTCUTS.map((shortcut) => (
              <div key={shortcut.keyCombo} class="flex items-center justify-between py-1">
                <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {shortcut.action}
                </span>
                <kbd
                  class="text-xs px-1.5 py-0.5 rounded font-mono"
                  style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                    fontSize: '10px',
                  }}
                >
                  {shortcut.keyCombo}
                </kbd>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
