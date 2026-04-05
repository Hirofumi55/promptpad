import { useState, useCallback } from 'preact/hooks';
import type { Theme } from '../types/note';
import { storage } from '../lib/storage';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => storage.getTheme());

  const setTheme = useCallback((next: Theme) => {
    storage.setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    document.documentElement.setAttribute('data-theme', next);
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, toggle };
}
