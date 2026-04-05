# PromptPad — AIプロンプト専用メモ帳

> 書く・貯める・すぐコピー。AIプロンプト管理に特化した静的Webアプリ。

[![Deploy to Cloudflare Pages](https://github.com/Hirofumi55/promptpad/actions/workflows/deploy.yml/badge.svg)](https://github.com/Hirofumi55/promptpad/actions/workflows/deploy.yml)

---

## 概要

**PromptPad** は、ChatGPT・Claude・Gemini など各種AIツール向けのプロンプトを効率的に作成・管理・再利用するための静的Webアプリです。

- **即座に書ける** — オフライン対応・PWAインストール可能。思いついた瞬間に記録。
- **即座にコピー** — ワンクリックでクリップボードへ。AIツールへシームレスに貼り付け。
- **即座に見つかる** — 全文検索・タグフィルタ・お気に入りで蓄積したプロンプト資産を瞬時に呼び出し。

## スクリーンショット

| デスクトップ（ダークモード） | モバイル |
|---|---|
| 左パネルにメモ一覧、右パネルにエディタの2カラムレイアウト | フルスクリーンエディタ + ← 戻るボタン |

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | [Astro](https://astro.build/) v6 (Static Output) |
| UIアイランド | [Preact](https://preactjs.com/) (`client:only`) |
| スタイリング | [Tailwind CSS](https://tailwindcss.com/) v4 (CSS-first) |
| アニメーション | [GSAP](https://gsap.com/) v3 |
| アイコン | [Lucide](https://lucide.dev/) (lucide-preact) |
| PWA | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) + Workbox |
| ホスティング | [Cloudflare Pages](https://pages.cloudflare.com/) |
| パッケージマネージャ | pnpm |

## 機能一覧

- **プロンプト管理** — 作成・編集・削除・タイトル自動生成（本文先頭30文字）
- **ワンクリックコピー** — Clipboard API + execCommandフォールバック
- **タグ管理** — タグ付け・タグフィルタリング
- **お気に入り** — ★マークでお気に入り登録・フィルタ
- **検索** — タイトル・本文・タグを対象にインクリメンタルサーチ（300msデバウンス）
- **ソート** — 更新日時 / 作成日時 / タイトル（あいうえお順）
- **テーマ切替** — ダーク / ライトモード（FOUC防止済み）
- **レスポンシブ** — デスクトップ2カラム / モバイルフルスクリーン
- **キーボードショートカット** — `Ctrl/⌘+N` `Ctrl/⌘+S` `Ctrl/⌘+F` `Escape`
- **PWA** — オフライン対応・ホーム画面インストール・自動更新

## ローカル開発

```bash
# 依存パッケージインストール
pnpm install

# 開発サーバー起動（http://localhost:4321）
pnpm dev

# プロダクションビルド
pnpm build

# ビルド結果プレビュー
pnpm preview

# 型チェック
pnpm lint

# PWAアイコン再生成
pnpm gen-icons
```

## ディレクトリ構成

```
promptpad/
├── public/
│   ├── favicon.svg
│   ├── icons/            # PWAアイコン（pnpm gen-icons で生成）
│   ├── robots.txt
│   └── sitemap.xml
├── scripts/
│   └── gen-icons.mjs     # PWAアイコン生成スクリプト（依存ゼロ）
├── src/
│   ├── components/       # Preact コンポーネント
│   │   ├── App.tsx       # ルートコンポーネント（状態管理・レイアウト）
│   │   ├── NoteList.tsx  # メモ一覧・フィルタ・ソート
│   │   ├── NoteCard.tsx  # 個別メモカード
│   │   ├── NoteEditor.tsx# 作成・編集エディタ
│   │   └── ...
│   ├── hooks/            # カスタムフック
│   │   ├── useNotes.ts   # CRUD + localStorage 永続化
│   │   ├── useSearch.ts  # 検索・フィルタ・デバウンス
│   │   ├── useClipboard.ts
│   │   └── useTheme.ts
│   ├── lib/
│   │   ├── animations.ts # GSAPアニメーション
│   │   ├── storage.ts    # localStorage 抽象化
│   │   └── constants.ts
│   ├── layouts/
│   │   └── BaseLayout.astro  # SEO・OGP・FOUC防止
│   └── types/
│       └── note.ts
└── .github/workflows/
    └── deploy.yml        # Lint → Build → Cloudflare Pages
```

## データ永続化

全データは **localStorage** に保存されます。サーバーへの通信は一切ありません。

| キー | 内容 |
|-----|------|
| `promptpad_notes` | メモ一覧（JSON配列） |
| `promptpad_theme` | テーマ設定（`dark` / `light`） |
| `promptpad_sort` | ソート順（`updatedAt` / `createdAt` / `title`） |

## Cloudflare Pages へのデプロイ

1. リポジトリを fork またはクローン
2. Cloudflare Pages でプロジェクト作成（ビルドコマンド: `pnpm build`、出力先: `dist`）
3. GitHub リポジトリの **Settings → Secrets** に以下を追加:

| Secret | 内容 |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API トークン |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウントID |

`main` ブランチへの push で自動デプロイされます。

## ライセンス

MIT
