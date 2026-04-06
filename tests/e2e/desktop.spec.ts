import { expect, test } from '@playwright/test';
import {
  createNote,
  expectNoRuntimeIssues,
  noteCard,
  startRuntimeTracking,
} from './helpers';

test.beforeEach(async ({}, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'desktop only scenario');
});

test('デスクトップで検索・お気に入り・コピーが機能する', async ({ page }) => {
  const issues = startRuntimeTracking(page);

  await page.goto('/');
  await createNote(page, {
    title: '週報作成',
    content: '先週の成果と来週の計画を 3 点で整理してください。',
    tags: ['work'],
  });
  await createNote(page, {
    title: '旅行計画',
    content: '京都 2 泊 3 日の旅程を作ってください。',
    tags: ['private'],
  });

  await page.reload();

  await noteCard(page, '週報作成').getByRole('button', { name: 'お気に入り登録' }).click();
  await page.getByLabel('プロンプトを検索').fill('旅行');
  await expect(noteCard(page, '旅行計画')).toHaveCount(1);
  await expect(noteCard(page, '週報作成')).toHaveCount(0);

  await page.getByRole('button', { name: '検索をクリア' }).click();
  await page.getByRole('button', { name: /^お気に入り(?:\s+\d+)?$/ }).click();
  await expect(noteCard(page, '週報作成')).toHaveCount(1);
  await expect(noteCard(page, '旅行計画')).toHaveCount(0);

  await noteCard(page, '週報作成').getByRole('button', { name: 'プロンプトをコピー' }).click();
  await expect(page.getByText('コピーしました')).toBeVisible();
  await expect
    .poll(async () => {
      return page.evaluate(() => navigator.clipboard.readText());
    })
    .toBe('先週の成果と来週の計画を 3 点で整理してください。');

  await expectNoRuntimeIssues(issues);
});

test('選択中ノートを削除すると空状態に戻る', async ({ page }) => {
  const issues = startRuntimeTracking(page);

  await page.goto('/');
  await createNote(page, {
    title: '削除対象ノート',
    content: '削除後にエディタが残らないことを確認する。',
    tags: ['qa'],
  });

  await page.reload();
  await noteCard(page, '削除対象ノート').click();
  await expect(page.getByLabel('タイトル')).toHaveValue('削除対象ノート');

  await noteCard(page, '削除対象ノート').getByRole('button', { name: '削除' }).click();
  const deleteDialog = page.locator('[role="dialog"]').first();
  await expect(deleteDialog).toBeVisible();
  await deleteDialog.locator('button').filter({ hasText: '削除する' }).click();

  await expect(page.getByText('削除しました')).toBeVisible();
  await expect(page.getByText('プロンプトがまだありません')).toBeVisible();
  await expect(page.getByLabel('タイトル')).toHaveCount(0);
  await expect(page.getByText('左のリストからプロンプトを選択するか、新規作成してください')).toBeVisible();

  await expectNoRuntimeIssues(issues);
});
