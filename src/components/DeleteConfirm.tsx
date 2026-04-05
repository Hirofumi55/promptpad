import { Trash2, X } from 'lucide-preact';

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirm({ onConfirm, onCancel }: Props) {
  return (
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <div
        class="w-full max-w-sm rounded-2xl p-6"
        style={{
          background: 'var(--color-bg-card)',
          boxShadow: 'var(--shadow-float)',
          border: '1px solid var(--color-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto"
          style={{ background: 'var(--color-danger-soft)' }}
        >
          <Trash2 size={22} style={{ color: 'var(--color-danger)' }} />
        </div>
        <h3
          class="text-base font-semibold text-center mb-1"
          style={{ color: 'var(--color-text-primary)' }}
        >
          プロンプトを削除しますか？
        </h3>
        <p class="text-sm text-center mb-6" style={{ color: 'var(--color-text-muted)' }}>
          この操作は元に戻せません
        </p>
        <div class="flex gap-3">
          <button
            onClick={onCancel}
            class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
            }}
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: 'var(--color-danger)' }}
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}
