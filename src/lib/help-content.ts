export interface KeyboardShortcut {
  keyCombo: string;
  action: string;
  note?: string;
}

export type HelpIconName =
  | 'copy'
  | 'star'
  | 'search'
  | 'tag'
  | 'moon'
  | 'grip'
  | 'plus'
  | 'keyboard';

export interface HelpItem {
  icon?: HelpIconName;
  label: string;
  desc: string;
}

export interface HelpSection {
  title: string;
  items: HelpItem[];
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  { keyCombo: '⌘/Ctrl + N', action: '新規作成', note: 'テキスト入力中は無効' },
  { keyCombo: '⌘/Ctrl + S', action: '保存' },
  { keyCombo: '⌘/Ctrl + F', action: '検索' },
  { keyCombo: 'Esc', action: 'キャンセル', note: 'テキスト入力中は無効' },
];

function describeShortcut(shortcut: KeyboardShortcut): string {
  if (!shortcut.note) return shortcut.action;
  return `${shortcut.action}（${shortcut.note}）`;
}

export const HELP_SECTIONS: HelpSection[] = [
  {
    title: '基本操作',
    items: [
      { icon: 'plus', label: '新規作成', desc: 'ヘッダーの「新規」ボタン、またはショートカット Ctrl/⌘+N' },
      { label: '編集', desc: '一覧のプロンプトカードをクリックして選択' },
      { icon: 'copy', label: 'コピー', desc: 'カード右上のコピーアイコンでクリップボードへ即コピー' },
      { label: '削除', desc: 'カード右上のゴミ箱アイコン → 確認ダイアログで削除' },
      { icon: 'star', label: 'お気に入り', desc: 'カード右上の★アイコンでお気に入り登録・解除' },
    ],
  },
  {
    title: '検索・絞り込み',
    items: [
      { icon: 'search', label: '全文検索', desc: 'タイトル・本文・タグを対象にインクリメンタル検索（300ms）' },
      { icon: 'tag', label: 'タグフィルタ', desc: 'フィルタバーのタグボタンをクリックで絞り込み' },
      { icon: 'star', label: 'お気に入りフィルタ', desc: '「お気に入り」ボタンで登録済みプロンプトのみ表示' },
      { label: 'ソート', desc: '更新日時・作成日時・タイトル・手動並び替えから選択' },
    ],
  },
  {
    title: '手動並び替え',
    items: [
      { icon: 'grip', label: 'ドラッグ&ドロップ', desc: 'ソートを「手動並び替え」に変更すると各カードにドラッグハンドルが表示されます' },
      { label: '並び順の保存', desc: '並び替えた順序はブラウザに自動保存されます' },
      { label: '制限', desc: '検索・タグ・お気に入りフィルタが有効な場合は並び替え不可' },
    ],
  },
  {
    title: 'キーボードショートカット',
    items: KEYBOARD_SHORTCUTS.map((shortcut) => ({
      icon: 'keyboard' as const,
      label: shortcut.keyCombo,
      desc: describeShortcut(shortcut),
    })),
  },
  {
    title: 'データ保存について',
    items: [
      { label: 'ローカル保存', desc: 'すべてのデータはブラウザの localStorage に保存されます。サーバーへの送信は一切ありません' },
      { label: '注意事項', desc: 'ブラウザのデータ消去・プライベートブラウズ終了時にデータが失われることがあります' },
      { icon: 'moon', label: 'テーマ', desc: 'ダーク/ライトモードの設定もブラウザに保存されます' },
    ],
  },
];
