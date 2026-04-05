import { useEffect, useRef } from 'preact/hooks';
import { Copy, Check } from 'lucide-preact';
import { animateCopySuccess } from '../lib/animations';

interface Props {
  noteId: string;
  copiedId: string | null;
  onCopy: () => void;
}

export function CopyButton({ noteId, copiedId, onCopy }: Props) {
  const isCopied = copiedId === noteId;
  const iconRef = useRef<HTMLSpanElement>(null);
  const prevCopied = useRef(false);

  // コピー成功に変わった瞬間だけアニメート
  useEffect(() => {
    if (isCopied && !prevCopied.current) {
      animateCopySuccess(iconRef.current);
    }
    prevCopied.current = isCopied;
  }, [isCopied]);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onCopy();
      }}
      aria-label="プロンプトをコピー"
      class="w-8 h-8 flex items-center justify-center rounded-lg"
      style={{
        color: isCopied ? 'var(--color-success)' : 'var(--color-text-muted)',
        background: isCopied ? 'var(--color-accent-soft)' : 'transparent',
        transition: 'color var(--transition-fast), background var(--transition-fast)',
      }}
    >
      <span ref={iconRef} style={{ display: 'flex' }}>
        {isCopied ? <Check size={15} /> : <Copy size={15} />}
      </span>
    </button>
  );
}
