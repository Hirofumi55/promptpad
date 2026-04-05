import { Sun, Moon } from 'lucide-preact';
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'ライトモードに切替' : 'ダークモードに切替'}
      class="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
      style={{
        color: 'var(--color-text-secondary)',
        background: 'transparent',
        border: '1px solid var(--color-border)',
      }}
    >
      <span
        class="theme-toggle-icon"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </span>
    </button>
  );
}
