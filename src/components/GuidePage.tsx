import {
  BookOpen,
  Copy,
  Star,
  Search,
  Tag,
  GripVertical,
  Keyboard,
  Shield,
  HardDrive,
  Code2,
  WifiOff,
  Smartphone,
  Plus,
  Trash2,
  SortAsc,
  Sun,
} from 'lucide-preact';
import { KEYBOARD_SHORTCUTS } from '../lib/help-content';

// ---- 内部共通コンポーネント ----

function SectionTitle({ children }: { children: string }) {
  return (
    <h2
      class="text-lg font-bold mb-5 pb-2 border-b"
      style={{ color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
    >
      {children}
    </h2>
  );
}

function StepCard({
  step,
  title,
  desc,
  detail,
}: {
  step: number;
  title: string;
  desc: string;
  detail?: string;
}) {
  return (
    <div
      class="flex gap-4 p-4 rounded-xl"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
        style={{ background: 'var(--color-accent)' }}
      >
        {step}
      </div>
      <div>
        <p class="text-sm font-semibold mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </p>
        <p class="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {desc}
        </p>
        {detail && (
          <p class="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: preact.ComponentChildren;
  title: string;
  desc: string;
}) {
  return (
    <div
      class="p-4 rounded-xl flex flex-col gap-2"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      <span
        class="w-8 h-8 flex items-center justify-center rounded-lg"
        style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}
      >
        {icon}
      </span>
      <p class="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </p>
      <p class="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
        {desc}
      </p>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  children,
  variant = 'default',
}: {
  icon: preact.ComponentChildren;
  title: string;
  children: preact.ComponentChildren;
  variant?: 'default' | 'success' | 'warning';
}) {
  const colors = {
    default: {
      bg: 'var(--color-accent-soft)',
      icon: 'var(--color-accent)',
    },
    success: {
      bg: 'rgba(52, 211, 153, 0.15)',
      icon: 'var(--color-success)',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.12)',
      icon: 'var(--color-favorite)',
    },
  }[variant];

  return (
    <div
      class="flex gap-3 p-4 rounded-xl"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      <span
        class="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg mt-0.5"
        style={{ background: colors.bg, color: colors.icon }}
      >
        {icon}
      </span>
      <div>
        <p class="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </p>
        <div class="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function TechBadge({ label, value }: { label: string; value: string }) {
  return (
    <div
      class="flex items-center justify-between px-3 py-2 rounded-lg"
      style={{ background: 'var(--color-bg-secondary)' }}
    >
      <span class="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </span>
      <span
        class="text-xs font-semibold px-2 py-0.5 rounded-md"
        style={{
          background: 'var(--color-accent-soft)',
          color: 'var(--color-accent)',
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ---- メインコンポーネント ----

export function GuidePage() {
  return (
    <div class="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg-primary)' }}>
      <div class="max-w-2xl mx-auto px-4 py-8 pb-16">

        {/* ヒーロー */}
        <div class="text-center mb-12">
          <div
            class="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--color-accent-soft)' }}
          >
            <BookOpen size={26} style={{ color: 'var(--color-accent)' }} />
          </div>
          <h1 class="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            PromptPad 使い方ガイド
          </h1>
          <p class="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            AIプロンプトを書いて・貯めて・すぐ使える専用メモ帳アプリ
          </p>
        </div>

        {/* ---- セクション1: はじめ方 ---- */}
        <section class="mb-10">
          <SectionTitle>はじめ方（3ステップ）</SectionTitle>
          <div class="flex flex-col gap-3">
            <StepCard
              step={1}
              title="プロンプトを書く"
              desc="画面右上の「新規」ボタン（または Ctrl/⌘+N）を押してエディタを開き、タイトルと本文を入力します。"
              detail="タイトルを空欄にすると、本文の先頭30文字が自動でタイトルになります。"
            />
            <StepCard
              step={2}
              title="タグをつけて整理する"
              desc="エディタ下部の「タグを追加…」欄にキーワードを入力して Enter。複数タグで細かく分類できます。"
              detail="例: 「SEO」「ブログ執筆」「コード生成」など用途別に管理すると便利です。"
            />
            <StepCard
              step={3}
              title="コピーして AIに貼り付ける"
              desc="カード右上のコピーアイコンをクリックするだけでクリップボードへコピー。ChatGPT・Claude・Gemini などにすぐ貼り付けられます。"
            />
          </div>
        </section>

        {/* ---- セクション2: 主な機能 ---- */}
        <section class="mb-10">
          <SectionTitle>主な機能</SectionTitle>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FeatureCard
              icon={<Search size={16} />}
              title="全文検索"
              desc="タイトル・本文・タグを横断してリアルタイム検索。300ms のデバウンスで快適に動作します。"
            />
            <FeatureCard
              icon={<Tag size={16} />}
              title="タグ絞り込み"
              desc="フィルタバーのタグをクリックで、そのタグが付いたプロンプトだけを表示します。"
            />
            <FeatureCard
              icon={<Star size={16} />}
              title="お気に入り管理"
              desc="★アイコンでお気に入り登録。フィルタボタンで一覧表示できます。"
            />
            <FeatureCard
              icon={<SortAsc size={16} />}
              title="4種類のソート"
              desc="更新日時・作成日時・タイトル・手動並び替えから選択。シーンに合わせて切り替え可能。"
            />
            <FeatureCard
              icon={<GripVertical size={16} />}
              title="ドラッグ＆ドロップ"
              desc="ソートを「手動並び替え」にするとハンドルが表示され、カードを好きな順に並べ替えられます。"
            />
            <FeatureCard
              icon={<Copy size={16} />}
              title="ワンクリックコピー"
              desc="コピーボタンで即クリップボードへ。コピー成功はアイコンが緑に変わって確認できます。"
            />
            <FeatureCard
              icon={<Sun size={16} />}
              title="ダーク/ライトモード"
              desc="ヘッダー右上のトグルでテーマを切り替え。選択したテーマはブラウザに保存されます。"
            />
            <FeatureCard
              icon={<Smartphone size={16} />}
              title="PWA対応"
              desc="ホーム画面に追加してアプリとして使用可能。オフラインでも動作します。"
            />
          </div>
        </section>

        {/* ---- セクション3: キーボードショートカット ---- */}
        <section class="mb-10">
          <SectionTitle>キーボードショートカット</SectionTitle>
          <div
            class="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--color-border)' }}
          >
            {KEYBOARD_SHORTCUTS.map((shortcut, i) => (
              <div
                key={shortcut.keyCombo}
                class="flex items-center justify-between px-4 py-3"
                style={{
                  background: i % 2 === 0 ? 'var(--color-bg-card)' : 'var(--color-bg-secondary)',
                  borderBottom: i < KEYBOARD_SHORTCUTS.length - 1 ? '1px solid var(--color-border)' : undefined,
                }}
              >
                <span class="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {shortcut.action}
                  {shortcut.note && (
                    <span class="text-xs ml-1.5" style={{ color: 'var(--color-text-muted)' }}>
                      （{shortcut.note}）
                    </span>
                  )}
                </span>
                <kbd
                  class="text-xs px-2 py-1 rounded-lg font-mono"
                  style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {shortcut.keyCombo}
                </kbd>
              </div>
            ))}
          </div>
        </section>

        {/* ---- セクション4: 安全性・プライバシー ---- */}
        <section class="mb-10">
          <SectionTitle>安全性・プライバシー</SectionTitle>
          <div class="flex flex-col gap-3">
            <InfoCard icon={<Shield size={16} />} title="データは端末の外に出ません" variant="success">
              <p>
                入力したプロンプトはすべて
                <strong style={{ color: 'var(--color-text-secondary)' }}>お使いのブラウザ（localStorage）</strong>
                にのみ保存されます。PromptPad のサーバーへの送信は一切行いません。第三者がデータを閲覧することは原理的に不可能です。
              </p>
            </InfoCard>

            <InfoCard icon={<HardDrive size={16} />} title="保存容量について" variant="default">
              <p>
                localStorage の容量上限はブラウザにより異なりますが、一般的に
                <strong style={{ color: 'var(--color-text-secondary)' }}>約 5MB</strong>
                です。テキストのみの保存のため、通常の使い方では上限に達することはほとんどありません。
              </p>
            </InfoCard>

            <InfoCard icon={<Trash2 size={16} />} title="データが消えるケース" variant="warning">
              <ul class="list-disc list-inside flex flex-col gap-1">
                <li>ブラウザの「閲覧データを消去」で localStorage をクリアした場合</li>
                <li>プライベート（シークレット）ブラウジングウィンドウを閉じた場合</li>
                <li>ブラウザのデータを初期化・アンインストールした場合</li>
              </ul>
              <p class="mt-2">
                大切なプロンプトは定期的にテキストファイルなどへコピーしてバックアップすることをお勧めします。
              </p>
            </InfoCard>

            <InfoCard icon={<WifiOff size={16} />} title="オフライン動作" variant="success">
              <p>
                初回アクセス後は Service Worker によってアプリがキャッシュされ、
                <strong style={{ color: 'var(--color-text-secondary)' }}>インターネット接続がなくても使用できます</strong>。
                プロンプトの閲覧・編集・コピーはすべてオフラインで完結します。
              </p>
            </InfoCard>
          </div>
        </section>

        {/* ---- セクション5: 技術仕様 ---- */}
        <section class="mb-10">
          <SectionTitle>技術仕様</SectionTitle>
          <p class="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
            PromptPad は以下の技術を使用して構築された静的 Web アプリケーションです。
          </p>
          <div class="flex flex-col gap-2 mb-5">
            <TechBadge label="フレームワーク" value="Astro v6（静的ビルド）" />
            <TechBadge label="UI ライブラリ" value="Preact 10" />
            <TechBadge label="スタイル" value="Tailwind CSS v4" />
            <TechBadge label="アニメーション" value="GSAP v3" />
            <TechBadge label="データ永続化" value="localStorage（サーバーレス）" />
            <TechBadge label="オフライン" value="Service Worker（Cache First）" />
            <TechBadge label="ホスティング" value="Cloudflare Pages" />
          </div>

          <div
            class="p-4 rounded-xl flex gap-3"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <span
              class="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg mt-0.5"
              style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}
            >
              <Code2 size={16} />
            </span>
            <div>
              <p class="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                静的サイトとして動作
              </p>
              <p class="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                PromptPad にはバックエンドサーバーが存在しません。HTML・CSS・JavaScript
                ファイルのみで構成された静的サイトです。すべての処理はブラウザ内で完結するため、
                サーバーの障害や停止によってデータが失われる心配がありません。
                また、サーバーへの通信がないため、プロンプトの内容が外部に漏れるリスクもゼロです。
              </p>
            </div>
          </div>
        </section>

        {/* ---- セクション6: よくある質問 ---- */}
        <section class="mb-4">
          <SectionTitle>よくある質問</SectionTitle>
          <div class="flex flex-col gap-3">
            {[
              {
                q: '別のデバイスでも同じプロンプトを使いたい',
                a: '現在は localStorage のみでの保存です。他デバイスで使う場合は、プロンプトのテキストをコピーして手動で移してください。',
              },
              {
                q: 'プロンプトが消えてしまった',
                a: 'ブラウザの閲覧データ消去やプライベートウィンドウの使用が原因の可能性があります。通常のウィンドウで使用し、大切なプロンプトは別途バックアップをお勧めします。',
              },
              {
                q: 'ドラッグ＆ドロップが動かない',
                a: '「手動並び替え」ソートが選択されていることを確認してください。また、検索・タグ・お気に入りフィルタが有効な場合は並び替えが無効になります。',
              },
              {
                q: 'iOS Safari でホーム画面に追加したい',
                a: 'Safari の共有メニュー（□↑アイコン）から「ホーム画面に追加」を選択してください。PWA としてインストールされ、アプリのように起動できます。',
              },
              {
                q: 'プロンプト数に上限はある？',
                a: 'アプリ側での制限はありません。ブラウザの localStorage 容量（通常約 5MB）が上限ですが、テキストのみのため数千件以上のプロンプトを保存しても問題ありません。',
              },
            ].map(({ q, a }) => (
              <div
                key={q}
                class="p-4 rounded-xl"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div class="flex gap-2 mb-2">
                  <span
                    class="shrink-0 text-xs font-bold px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}
                  >
                    Q
                  </span>
                  <p class="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {q}
                  </p>
                </div>
                <div class="flex gap-2">
                  <span
                    class="shrink-0 text-xs font-bold px-1.5 py-0.5 rounded"
                    style={{
                      background: 'rgba(52, 211, 153, 0.15)',
                      color: 'var(--color-success)',
                    }}
                  >
                    A
                  </span>
                  <p class="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    {a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* フッター */}
        <p class="text-center text-xs mt-10" style={{ color: 'var(--color-text-muted)' }}>
          PromptPad — AIプロンプト専用メモ帳
        </p>
      </div>
    </div>
  );
}
