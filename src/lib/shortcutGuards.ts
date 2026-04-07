const MODAL_DIALOG_SELECTOR = '[role="dialog"][aria-modal="true"]';

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || target.isContentEditable;
}

export function hasOpenModalDialog(): boolean {
  return document.querySelector(MODAL_DIALOG_SELECTOR) !== null;
}
