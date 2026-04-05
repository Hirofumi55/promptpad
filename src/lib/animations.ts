import { gsap } from 'gsap';

/**
 * メモカードのスタガー入場アニメーション
 * @param container - .note-card 要素を含む親要素
 * @param onlyNew  - true のとき最初の1枚だけアニメート（新規追加時用）
 */
export function animateCards(container: Element | null, onlyNew = false): void {
  if (!container) return;
  const cards = container.querySelectorAll('.note-card');
  if (cards.length === 0) return;

  const targets = onlyNew ? [cards[0]] : cards;
  gsap.fromTo(
    targets,
    { y: 18, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.38,
      stagger: 0.055,
      ease: 'power2.out',
      clearProps: 'all',
    },
  );
}

/**
 * トースト入場アニメーション
 */
export function animateToastIn(el: Element | null): void {
  if (!el) return;
  gsap.fromTo(
    el,
    { y: 24, opacity: 0, scale: 0.92 },
    { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out' },
  );
}

/**
 * コピー成功時のバウンスアニメーション
 */
export function animateCopySuccess(el: Element | null): void {
  if (!el) return;
  gsap
    .timeline()
    .to(el, { scale: 0, duration: 0.12, ease: 'power2.in' })
    .to(el, { scale: 1, duration: 0.28, ease: 'back.out(2)' });
}

/**
 * エディタパネルのスライドイン（デスクトップ）
 */
export function animateEditorIn(el: Element | null): void {
  if (!el) return;
  gsap.fromTo(
    el,
    { x: 24, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out', clearProps: 'all' },
  );
}

/**
 * モバイルエディタのスライドアップ
 */
export function animateEditorSlideUp(el: Element | null): void {
  if (!el) return;
  gsap.fromTo(
    el,
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.32, ease: 'power3.out', clearProps: 'all' },
  );
}
