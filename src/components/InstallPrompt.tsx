import { useState, useEffect, useRef } from 'preact/hooks';
import { Download, X } from 'lucide-preact';
import { animateToastIn } from '../lib/animations';

// BeforeInstallPromptEvent の型定義（標準に未収録）
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // セッション内で一度却下したら再表示しない
    if (sessionStorage.getItem('pwa-install-dismissed')) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // バナー表示時にアニメーション
  useEffect(() => {
    if (deferredPrompt && !dismissed) {
      animateToastIn(bannerRef.current);
    }
  }, [deferredPrompt, dismissed]);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  }

  function handleDismiss() {
    sessionStorage.setItem('pwa-install-dismissed', '1');
    setDismissed(true);
    setDeferredPrompt(null);
  }

  if (!deferredPrompt || dismissed) return null;

  return (
    <div
      ref={bannerRef}
      class="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50 rounded-2xl p-4 flex items-start gap-3"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-float)',
        opacity: 0,
      }}
      role="complementary"
      aria-label="アプリインストールの提案"
    >
      <div
        class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'var(--color-accent-soft)' }}
      >
        <Download size={18} style={{ color: 'var(--color-accent)' }} />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
          アプリとして追加
        </p>
        <p class="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
          ホーム画面に追加してオフラインでも使えます
        </p>
        <div class="flex gap-2">
          <button
            onClick={handleInstall}
            class="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: 'var(--color-accent)' }}
          >
            インストール
          </button>
          <button
            onClick={handleDismiss}
            class="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            後で
          </button>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="閉じる"
        class="w-6 h-6 flex items-center justify-center rounded-lg shrink-0"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
