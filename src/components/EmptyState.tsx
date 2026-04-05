import { FileText, Plus } from 'lucide-preact';

interface Props {
  isSearching: boolean;
  onNewNote: () => void;
}

export function EmptyState({ isSearching, onNewNote }: Props) {
  return (
    <div class="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div
        class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'var(--color-accent-soft)' }}
      >
        <FileText size={28} style={{ color: 'var(--color-accent)' }} />
      </div>
      {isSearching ? (
        <>
          <p class="text-base font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            該当するプロンプトが見つかりません
          </p>
          <p class="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            検索キーワードやタグを変更してみてください
          </p>
        </>
      ) : (
        <>
          <p class="text-base font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            プロンプトがまだありません
          </p>
          <p class="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
            最初のプロンプトを作成しましょう
          </p>
          <button
            onClick={onNewNote}
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--color-accent)' }}
          >
            <Plus size={15} />
            新規作成
          </button>
        </>
      )}
    </div>
  );
}
