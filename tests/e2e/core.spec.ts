import { expect, test } from '@playwright/test';
import { createNote, expectNoRuntimeIssues, noteCard, startRuntimeTracking } from './helpers';

test('初回表示で主要UIとSEOメタが揃う', async ({ page }) => {
  const issues = startRuntimeTracking(page);

  await page.goto('/');

  await expect(page).toHaveTitle(/PromptPad/);
  await expect(page.getByText('PromptPad', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'PromptPad - AIプロンプト専用メモ帳' })).toBeAttached();
  await expect(page.getByLabel('プロンプトを検索')).toBeVisible();
  await expect(page.getByText('プロンプトがまだありません')).toBeVisible();

  const manifestLink = page.locator('link[rel="manifest"]');
  await expect(manifestLink).toHaveAttribute('href', '/manifest.webmanifest');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    /\/og-image\.png$/,
  );
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    'content',
    /\/og-image\.png$/,
  );

  const manifestResponse = await page.request.get('/manifest.webmanifest');
  expect(manifestResponse.ok()).toBeTruthy();
  expect(manifestResponse.headers()['content-type']).toContain('json');

  const ogImageResponse = await page.request.get('/og-image.png');
  expect(ogImageResponse.ok()).toBeTruthy();
  expect(ogImageResponse.headers()['content-type']).toContain('image/png');

  await expectNoRuntimeIssues(issues);
});

test('ノートを作成してリロード後も保持される', async ({ page }) => {
  const issues = startRuntimeTracking(page);

  await page.goto('/');
  await createNote(page, {
    title: '顧客返信テンプレ',
    content: 'あなたはカスタマーサポート担当です。\n落ち着いた敬語で返信してください。',
    tags: ['support', 'sales'],
  });

  await expect(noteCard(page, '顧客返信テンプレ')).toHaveCount(1);
  await page.reload();

  await expect(noteCard(page, '顧客返信テンプレ')).toHaveCount(1);
  await expect(noteCard(page, '顧客返信テンプレ').getByText('support')).toBeVisible();
  await expect(noteCard(page, '顧客返信テンプレ').getByText('sales')).toBeVisible();
  await noteCard(page, '顧客返信テンプレ').click();
  await expect(page.getByLabel('タイトル')).toHaveValue('顧客返信テンプレ');
  await expect(page.getByLabel('プロンプト本文')).toHaveValue(
    'あなたはカスタマーサポート担当です。\n落ち着いた敬語で返信してください。',
  );

  await expectNoRuntimeIssues(issues);
});

test('テーマ切り替えがリロード後も保持される', async ({ page }) => {
  const issues = startRuntimeTracking(page);

  await page.goto('/');

  await expect(page.getByRole('button', { name: 'ライトモードに切替' })).toBeVisible();
  await page.getByRole('button', { name: 'ライトモードに切替' }).click();

  await expect.poll(async () => {
    return page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  }).toBe('light');

  await expect(page.getByRole('button', { name: 'ダークモードに切替' })).toBeVisible();
  await page.reload();

  await expect.poll(async () => {
    return page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  }).toBe('light');
  await expect(page.getByRole('button', { name: 'ダークモードに切替' })).toBeVisible();

  await expectNoRuntimeIssues(issues);
});

test('破損したlocalStorageでも空状態にフォールバックする', async ({ page }) => {
  test.fail(true, '初期テーマ適用スクリプトが invalid 値をそのまま data-theme に反映してしまう');
  const issues = startRuntimeTracking(page);

  await page.addInitScript(() => {
    localStorage.setItem('promptpad_notes', '{broken-json');
    localStorage.setItem('promptpad_sort', 'unexpected');
    localStorage.setItem('promptpad_theme', 'invalid');
  });

  await page.goto('/');

  await expect(page.getByText('プロンプトがまだありません')).toBeVisible();
  await expect.poll(async () => {
    return page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  }).toBe('dark');

  await expectNoRuntimeIssues(issues);
});
