import { expect, type Locator, type Page } from '@playwright/test';

const env =
  (globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }).process?.env ?? {};

const appBaseUrl = env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173';
const appOrigin = new URL(appBaseUrl).origin;

export type RuntimeIssues = {
  consoleErrors: string[];
  pageErrors: string[];
  sameOriginRequestFailures: string[];
};

export function startRuntimeTracking(page: Page): RuntimeIssues {
  const issues: RuntimeIssues = {
    consoleErrors: [],
    pageErrors: [],
    sameOriginRequestFailures: [],
  };

  page.on('console', (message) => {
    if (message.type() === 'error') {
      issues.consoleErrors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    issues.pageErrors.push(error.message);
  });

  page.on('requestfailed', (request) => {
    if (request.url().startsWith(appOrigin)) {
      issues.sameOriginRequestFailures.push(
        `${request.method()} ${request.url()} (${request.failure()?.errorText ?? 'unknown'})`,
      );
    }
  });

  return issues;
}

export function expectNoRuntimeIssues(issues: RuntimeIssues): Promise<void> {
  return Promise.all([
    expect(issues.consoleErrors, 'console.error should stay empty').toEqual([]),
    expect(issues.pageErrors, 'uncaught page errors should stay empty').toEqual([]),
    expect(
      issues.sameOriginRequestFailures,
      'same-origin request failures should stay empty',
    ).toEqual([]),
  ]).then(() => undefined);
}

export function noteCard(page: Page, title: string): Locator {
  return page.locator('.note-card').filter({
    has: page.getByRole('heading', { name: title, exact: true }),
  });
}

export async function openNewNote(page: Page): Promise<void> {
  await page.getByRole('button', { name: '新規プロンプト作成 (Ctrl+N)' }).click();
  await expect(page.getByLabel('タイトル')).toBeVisible();
}

export async function addTag(page: Page, tag: string): Promise<void> {
  const tagInput = page.locator('input[aria-label="タグを入力"]').first();
  await tagInput.click();
  await tagInput.fill(tag);
  await expect(tagInput).toHaveValue(tag);
  await tagInput.press('Enter');
  await expect(page.getByText(tag, { exact: true })).toBeVisible();
}

export async function saveNote(page: Page, expectedToast: '作成しました' | '保存しました'): Promise<void> {
  await page.getByRole('button', { name: '保存' }).last().click();
  await expect(page.getByRole('status').filter({ hasText: expectedToast }).last()).toBeVisible();
}

export async function createNote(
  page: Page,
  {
    title,
    content,
    tags = [],
  }: {
    title: string;
    content: string;
    tags?: string[];
  },
): Promise<void> {
  await openNewNote(page);
  await page.getByLabel('タイトル').fill(title);
  await page.getByLabel('プロンプト本文').fill(content);

  for (const tag of tags) {
    await addTag(page, tag);
  }

  await saveNote(page, '作成しました');
}

export async function waitForServiceWorker(page: Page): Promise<void> {
  await expect.poll(async () => {
    return page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const registration = await navigator.serviceWorker.getRegistration();
      return Boolean(registration);
    });
  }).toBe(true);
}
