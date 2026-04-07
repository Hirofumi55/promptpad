import { useEffect, useRef } from 'preact/hooks';

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

type HtmlRef<T extends HTMLElement = HTMLElement> = {
  current: T | null;
};

interface UseModalDialogOptions {
  onClose: () => void;
  initialFocusRef?: HtmlRef;
}

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];

  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true',
  );
}

export function useModalDialog<T extends HTMLElement>({
  onClose,
  initialFocusRef,
}: UseModalDialogOptions) {
  const dialogRef = useRef<T>(null);

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    initialFocusRef?.current?.focus();

    return () => {
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [initialFocusRef]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = getFocusableElements(dialogRef.current);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const isOutside =
        !(active instanceof HTMLElement) || !dialogRef.current?.contains(active);

      if (event.shiftKey) {
        if (isOutside || active === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (isOutside || active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [onClose]);

  return { dialogRef };
}
