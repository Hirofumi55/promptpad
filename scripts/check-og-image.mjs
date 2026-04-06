import { accessSync, readFileSync } from 'node:fs';
import { constants } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '../dist');
const distHtmlPath = join(distDir, 'index.html');
const distImagePath = join(distDir, 'og-image.png');

function assertFileExists(path) {
  accessSync(path, constants.F_OK | constants.R_OK);
}

function assertMetaContains(html, name, expectedPath) {
  const pattern = new RegExp(`<meta[^>]+(?:property|name)="${name}"[^>]+content="([^"]+)"`, 'i');
  const match = html.match(pattern);
  if (!match) {
    throw new Error(`${name} meta tag is missing in dist/index.html`);
  }

  if (!match[1].endsWith(expectedPath)) {
    throw new Error(`${name} meta tag does not point to ${expectedPath}: ${match[1]}`);
  }
}

assertFileExists(distHtmlPath);
assertFileExists(distImagePath);

const html = readFileSync(distHtmlPath, 'utf8');

assertMetaContains(html, 'og:image', '/og-image.png');
assertMetaContains(html, 'twitter:image', '/og-image.png');

console.log('✓ OGP/Twitter image verified in dist output');
