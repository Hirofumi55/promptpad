/**
 * PWAアイコン・OGP画像生成スクリプト
 * sharp を使って favicon.svg を高品質PNGにレンダリングします。
 * 実行: node scripts/gen-icons.mjs
 */
import sharp from 'sharp';
import { mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const iconDir = join(rootDir, 'public/icons');

mkdirSync(iconDir, { recursive: true });

// favicon.svg を読み込む
const svgPath = join(rootDir, 'public/favicon.svg');
const svgBuffer = readFileSync(svgPath);

// ---- PWAアイコン生成 ----
async function generateIcon(size, outputPath) {
  await sharp(svgBuffer, { density: Math.ceil(size * 3) })
    .resize(size, size)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPath);
}

await generateIcon(192, join(iconDir, 'icon-192.png'));
await generateIcon(512, join(iconDir, 'icon-512.png'));

// maskable: safe zone (80%) を確保するため、アイコンを80%に縮小して中央配置
{
  const size = 512;
  const innerSize = Math.round(size * 0.8);
  const offset = Math.round((size - innerSize) / 2);
  const innerBuf = await sharp(svgBuffer, { density: Math.ceil(innerSize * 3) })
    .resize(innerSize, innerSize)
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 99, g: 102, b: 241, alpha: 1 }, // #6366f1
    },
  })
    .composite([{ input: innerBuf, top: offset, left: offset }])
    .png({ compressionLevel: 9 })
    .toFile(join(iconDir, 'icon-512-maskable.png'));
}

console.log('✓ PWAアイコン生成完了: public/icons/');
console.log('  - icon-192.png');
console.log('  - icon-512.png');
console.log('  - icon-512-maskable.png');

// ---- OGP画像生成 (1200×630) ----
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="iconBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
  </defs>

  <!-- 背景 -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>

  <!-- 装飾: 右上の薄い円 -->
  <circle cx="1100" cy="80" r="200" fill="#6366f1" opacity="0.06"/>
  <!-- 装飾: 左下の薄い円 -->
  <circle cx="100" cy="580" r="140" fill="#818cf8" opacity="0.05"/>
  <!-- 区切り線 -->
  <rect x="580" y="0" width="1" height="630" fill="#334155" opacity="0.6"/>

  <!-- 左エリア: アイコン -->
  <rect x="80" y="195" width="160" height="160" rx="36" fill="url(#iconBg)"/>
  <rect x="80" y="195" width="160" height="80" rx="36" fill="white" opacity="0.1"/>
  <!-- テキスト行 -->
  <rect x="112" y="247" width="95" height="16" rx="8" fill="white" opacity="0.95"/>
  <rect x="112" y="277" width="70" height="16" rx="8" fill="white" opacity="0.85"/>
  <rect x="112" y="307" width="82" height="16" rx="8" fill="white" opacity="0.75"/>
  <!-- コピードット -->
  <circle cx="218" cy="330" r="28" fill="#34d399"/>
  <path d="M206 330l9 9 18-18" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

  <!-- アプリ名 -->
  <text x="80" y="432" font-family="system-ui,-apple-system,sans-serif" font-size="72" font-weight="700" fill="white" opacity="0.95">PromptPad</text>
  <!-- キャッチコピー -->
  <text x="80" y="490" font-family="system-ui,-apple-system,sans-serif" font-size="28" font-weight="400" fill="#94a3b8">AIプロンプトの作成・管理・ワンクリックコピー</text>

  <!-- 右エリア: プロンプトカードイメージ -->
  <!-- カード1 -->
  <rect x="620" y="80" width="520" height="130" rx="16" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <rect x="650" y="108" width="200" height="14" rx="7" fill="#818cf8" opacity="0.8"/>
  <rect x="650" y="134" width="460" height="10" rx="5" fill="#475569" opacity="0.7"/>
  <rect x="650" y="154" width="380" height="10" rx="5" fill="#475569" opacity="0.5"/>
  <rect x="650" y="174" width="420" height="10" rx="5" fill="#475569" opacity="0.4"/>
  <circle cx="1098" cy="108" r="18" fill="#34d399" opacity="0.9"/>
  <path d="M1090 108l5 5 10-10" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

  <!-- カード2 (選択状態) -->
  <rect x="620" y="230" width="520" height="130" rx="16" fill="#1e293b" stroke="#6366f1" stroke-width="1.5"/>
  <rect x="650" y="258" width="160" height="14" rx="7" fill="#a5b4fc" opacity="0.9"/>
  <rect x="650" y="284" width="460" height="10" rx="5" fill="#475569" opacity="0.7"/>
  <rect x="650" y="304" width="310" height="10" rx="5" fill="#475569" opacity="0.5"/>
  <rect x="650" y="324" width="400" height="10" rx="5" fill="#475569" opacity="0.4"/>
  <circle cx="1098" cy="258" r="18" fill="#6366f1" opacity="0.9"/>

  <!-- カード3 -->
  <rect x="620" y="380" width="520" height="130" rx="16" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <rect x="650" y="408" width="180" height="14" rx="7" fill="#818cf8" opacity="0.6"/>
  <rect x="650" y="434" width="440" height="10" rx="5" fill="#475569" opacity="0.5"/>
  <rect x="650" y="454" width="360" height="10" rx="5" fill="#475569" opacity="0.4"/>
  <rect x="650" y="474" width="410" height="10" rx="5" fill="#475569" opacity="0.3"/>

  <!-- タグバッジ群 -->
  <rect x="650" y="200" width="60" height="22" rx="11" fill="#312e81" opacity="0.8"/>
  <text x="680" y="215" font-family="system-ui,sans-serif" font-size="12" fill="#a5b4fc" text-anchor="middle">SEO</text>
  <rect x="720" y="200" width="90" height="22" rx="11" fill="#312e81" opacity="0.8"/>
  <text x="765" y="215" font-family="system-ui,sans-serif" font-size="12" fill="#a5b4fc" text-anchor="middle">ブログ執筆</text>

  <!-- グリーン装飾ドット群 -->
  <circle cx="1110" cy="530" r="16" fill="#34d399" opacity="0.7"/>
  <circle cx="1145" cy="500" r="9" fill="#34d399" opacity="0.5"/>
  <circle cx="1078" cy="555" r="6" fill="#34d399" opacity="0.4"/>
</svg>`;

const ogBuffer = Buffer.from(ogSvg, 'utf-8');
await sharp(ogBuffer, { density: 150 })
  .resize(1200, 630)
  .png({ compressionLevel: 9 })
  .toFile(join(rootDir, 'public/og-image.png'));

console.log('✓ OGP画像生成完了: public/og-image.png');
