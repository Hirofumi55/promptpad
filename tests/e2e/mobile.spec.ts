import { expect, test } from '@playwright/test';
import {
  createNote,
  expectNoRuntimeIssues,
  noteCard,
  startRuntimeTracking,
} from './helpers';

test.beforeEach(async ({}, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'mobile only scenario');
});

test('モバイルで作成後に一覧へ戻り再編集できる', async ({ page }) => {
  const issues = startRuntimeTracking(page);

  await page.goto('/');
  await createNote(page, {
    title: 'モバイルメモ',
    content: 'iPhone 幅での編集体験を確認する。',
    tags: ['mobile'],
  });

  await expect(page.getByRole('button', { name: '一覧に戻る' })).toBeVisible();
  await page.getByRole('button', { name: '一覧に戻る' }).click();

  await expect(noteCard(page, 'モバイルメモ')).toHaveCount(1);
  await noteCard(page, 'モバイルメモ').click();
  await expect(page.getByLabel('タイトル')).toHaveValue('モバイルメモ');
  await page.getByLabel('プロンプト本文').fill('iPhone 幅での編集体験を更新する。');
  await page.getByRole('button', { name: '保存' }).last().click();
  await expect(page.getByText('保存しました')).toBeVisible();

  await page.getByRole('button', { name: '一覧に戻る' }).click();
  await page.reload();
  await expect(noteCard(page, 'モバイルメモ')).toHaveCount(1);
  await noteCard(page, 'モバイルメモ').click();
  await expect(page.getByLabel('プロンプト本文')).toHaveValue('iPhone 幅での編集体験を更新する。');

  await expectNoRuntimeIssues(issues);
});
