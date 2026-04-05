import { Search, X } from 'lucide-preact';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
  return (
    <div
      class="relative flex items-center"
      style={{ color: 'var(--color-text-muted)' }}
    >
      <Search
        size={14}
        class="absolute left-3 pointer-events-none"
        style={{ color: 'var(--color-text-muted)' }}
      />
      <input
        type="search"
        value={value}
        onInput={(e) => onChange((e.target as HTMLInputElement).value)}
        placeholder="プロンプトを検索..."
        class="w-full pl-8 pr-8 py-2 rounded-xl text-sm outline-none"
        style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
        aria-label="プロンプトを検索"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="検索をクリア"
          class="absolute right-2.5 flex items-center justify-center w-5 h-5 rounded-full"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
