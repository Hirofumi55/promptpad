import { useEffect, useRef } from 'preact/hooks';
import { X, Copy, Star, Search, Tag, Moon, GripVertical, Plus, Keyboard } from 'lucide-preact';

interface Props {
  onClose: () => void;
}

interface Section {
  title: string;
  items: { icon?: preact.ComponentChild; label: string; desc: string }[];
}

const SECTIONS: Section[] = [
  {
    title: '基本操作',
    items: [
      { icon: <Plus size={14} />, label: '新規作成', desc: 'ヘッダーの「新規」ボタン、またはショートカット Ctrl/⌘+N' },
      { icon: null, label: '編集', desc: '一覧のプロンプトカードをクリックして選択' },
      { icon: <Copy size={14} />, label: 'コピー', desc: 'カード右上のコピーアイコンでクリップボードへ即コピー' },
      { icon: null, label: '削除', desc: 'カード右上のゴミ箱アイコン → 確認ダイアログで削除' },
      { icon: <Star size={14} />, label: 'お気に入り', desc: 'カード右上の★アイコンでお気に入り登録・解除' },
    ],
  },
  {
    title: '検索・絞り込み',
    items: [
      { icon: <Search size={14} />, label: '全文検索', desc: 'タイトル・本文・タグを対象にインクリメンタル検索（300ms）' },
      { icon: <Tag size={14} />, label: 'タグフィルタ', desc: 'フィルタバーのタグボタンをクリックで絞り込み' },
      { icon: <Star size={14} />, label: 'お気に入りフィルタ', desc: '「お気に入り」ボタンで登録済みプロンプトのみ表示' },
      { icon: null, label: 'ソート', desc: '更新日時・作成日時・タイトル・手動並び替えから選択' },
    ],
  },
  {
    title: '手動並び替え',
    items: [
      { icon: <GripVertical size={14} />, label: 'ドラッグ&ドロップ', desc: 'ソートを「手動並び替え」に変更すると各カードにドラッグハンドルが表示されます' },
      { icon: null, label: '並び順の保存', desc: '並び替えた順序はブラウザに自動保存されます' },
      { icon: null, label: '制限', desc: '検索・タグ・お気に入りフィルタが有効な場合は並び替え不可' },
    ],
  },
  {
    title: 'キーボードショートカット',
    items: [
      { icon: <Keyboard size={14} />, label: 'Ctrl/⌘ + N', desc: '新規プロンプト作成（テキスト入力中は無効）' },
      { icon: <Keyboard size={14} />, label: 'Ctrl/⌘ + S', desc: 'プロンプトを保存' },
      { icon: <Keyboard size={14} />, label: 'Ctrl/⌘ + F', desc: '検索欄にフォーカス' },
      { icon: <Keyboard size={14} />, label: 'Esc', desc: 'エディタを閉じる（テキスト入力中は無効）' },
    ],
  },
  {
    title: 'データ保存について',
    items: [
      { icon: null, label: 'ローカル保存', desc: 'すべてのデータはブラウザの localStorage に保存されます。サーバーへの送信は一切ありません' },
      { icon: null, label: '注意事項', desc: 'ブラウザのデータ消去・プライベートブラウズ終了時にデータが失われることがあります' },
      { icon: <Moon size={14} />, label: 'テーマ', desc: 'ダーク/ライトモードの設定もブラウザに保存されます' },
    ],
  },
];

export function HelpModal({ onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); return; }
      if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [onClose]);

  return (
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
      aria-hidden="true"
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
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h3
                class="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--color-accent)' }}
              >
                {section.title}
              </h3>
              <div class="flex flex-col gap-2">
                {section.items.map((item) => (
                  <div key={item.label} class="flex items-start gap-3">
                    {item.icon ? (
                      <span
                        class="mt-0.5 shrink-0 w-5 h-5 flex items-center justify-center rounded"
                        style={{ color: 'var(--color-accent)', background: 'var(--color-accent-soft)' }}
                      >
                        {item.icon}
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
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
