import { expect, test } from '@playwright/test';
import { expectNoRuntimeIssues, startRuntimeTracking, waitForServiceWorker } from './helpers';

test.describe('PWA basics', () => {
  test.use({ serviceWorkers: 'allow' });

  test('manifest と service worker が登録される', async ({ page }) => {
    const issues = startRuntimeTracking(page);

    await page.goto('/');

    const manifestResponse = await page.request.get('/manifest.webmanifest');
    expect(manifestResponse.ok()).toBeTruthy();
    expect(manifestResponse.headers()['content-type']).toContain('json');

    await waitForServiceWorker(page);
    await expectNoRuntimeIssues(issues);
  });
});
