import { useEffect, useRef } from 'preact/hooks';
import { animateToastIn } from '../lib/animations';

export interface ToastMessage {
  id: string;
  message: string;
}

interface Props {
  toasts: ToastMessage[];
}

function ToastItem({ message }: { message: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    animateToastIn(ref.current);
  }, []);

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      class="px-4 py-2.5 rounded-xl text-sm font-semibold text-white pointer-events-auto"
      style={{
        background: 'var(--color-accent)',
        boxShadow: 'var(--shadow-float)',
        opacity: 0, // GSAP がアニメート前に非表示
      }}
    >
      {message}
    </div>
  );
}

export function Toast({ toasts }: Props) {
  if (toasts.length === 0) return null;
  return (
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} message={t.message} />
      ))}
    </div>
  );
}
