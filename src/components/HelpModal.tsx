import { X, Copy, Star, Search, Tag, Moon, GripVertical, Plus, Keyboard } from 'lucide-preact';
import { useRef } from 'preact/hooks';
import { useModalDialog } from '../hooks/useModalDialog';
import { HELP_SECTIONS, type HelpIconName } from '../lib/help-content';

interface Props {
  onClose: () => void;
}

function renderHelpIcon(icon: HelpIconName | undefined) {
  if (!icon) return null;

  switch (icon) {
    case 'plus':
      return <Plus size={14} />;
    case 'copy':
      return <Copy size={14} />;
    case 'star':
      return <Star size={14} />;
    case 'search':
      return <Search size={14} />;
    case 'tag':
      return <Tag size={14} />;
    case 'moon':
      return <Moon size={14} />;
    case 'grip':
      return <GripVertical size={14} />;
    case 'keyboard':
      return <Keyboard size={14} />;
  }
}

export function HelpModal({ onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const { dialogRef } = useModalDialog<HTMLDivElement>({
    onClose,
    initialFocusRef: closeRef,
  });

  return (
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-dialog-title"
        class="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-float)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div
          class="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h2
            id="help-dialog-title"
            class="text-base font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            使い方ガイド
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            class="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* コンテンツ（スクロール可能） */}
        <div class="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-5">
          {HELP_SECTIONS.map((section) => (
            <section key={section.title}>
              <h3
                class="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--color-accent)' }}
              >
                {section.title}
              </h3>
              <div class="flex flex-col gap-2">
                {section.items.map((item) => {
                  const icon = renderHelpIcon(item.icon);

                  return (
                    <div key={item.label} class="flex items-start gap-3">
                      {icon ? (
                        <span
                          class="mt-0.5 shrink-0 w-5 h-5 flex items-center justify-center rounded"
                          style={{ color: 'var(--color-accent)', background: 'var(--color-accent-soft)' }}
                        >
                          {icon}
                        </span>
                      ) : (
                        <span class="mt-0.5 shrink-0 w-5 h-5" />
                      )}
                      <div>
                        <span
                          class="text-xs font-semibold"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {item.label}
                        </span>
                        <p class="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
