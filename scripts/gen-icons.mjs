/**
 * PWAアイコン生成スクリプト
 * PromptPadブランドカラーのシンプルなPNGアイコンを生成します。
 * 実行: node scripts/gen-icons.mjs
 */
import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// CRC32 テーブル生成
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[i] = c;
}
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])) >>> 0);
  return Buffer.concat([len, t, data, crcBuf]);
}

/**
 * PromptPadアイコンPNG生成
 * - インディゴ (#6366f1) 背景
 * - 中央に白い横線3本（プロンプト/テキストを象徴）
 * - 右下に緑のドット（コピー機能を象徴）
 */
function createIcon(size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // ビット深度
  ihdr[9] = 6;  // カラータイプ: RGBA

  // ピクセルデータ生成
  const raw = Buffer.alloc((1 + size * 4) * size);

  // 背景色: インディゴ #6366f1 = rgb(99, 102, 241)
  const [bgR, bgG, bgB] = [99, 102, 241];

  // 白い横線の定義（相対座標）
  const lineW = Math.round(size * 0.56);  // 線の幅
  const lineH = Math.round(size * 0.06);  // 線の高さ
  const lineX = Math.round(size * 0.19);  // 線の開始X
  const lineGap = Math.round(size * 0.14); // 線間隔
  const linesStartY = Math.round(size * 0.30); // 最初の線のY

  // 緑ドット (#34d399) の定義
  const dotR = 52, dotG = 211, dotB = 153;
  const dotRadius = Math.round(size * 0.13);
  const dotCX = Math.round(size * 0.76);
  const dotCY = Math.round(size * 0.73);

  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 4);
    raw[rowStart] = 0; // フィルター: None

    for (let x = 0; x < size; x++) {
      const px = rowStart + 1 + x * 4;
      let r = bgR, g = bgG, b = bgB, a = 255;

      // 角丸マスク（radius = size * 0.2）
      const radius = size * 0.2;
      const dx = Math.min(x, size - 1 - x);
      const dy = Math.min(y, size - 1 - y);
      if (dx < radius && dy < radius) {
        const cx = radius - dx, cy = radius - dy;
        if (cx * cx + cy * cy > radius * radius) {
          a = 0; // 角を透過
        }
      }

      if (a > 0) {
        // 白い横線
        for (let li = 0; li < 3; li++) {
          const lineY = linesStartY + li * lineGap;
          // 3本目の線は少し短く
          const thisLineW = li === 2 ? Math.round(lineW * 0.7) : lineW;
          if (y >= lineY && y < lineY + lineH && x >= lineX && x < lineX + thisLineW) {
            r = 255; g = 255; b = 255;
          }
        }

        // 緑ドット
        const distX = x - dotCX, distY = y - dotCY;
        if (distX * distX + distY * distY <= dotRadius * dotRadius) {
          r = dotR; g = dotG; b = dotB;
        }
      }

      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
      raw[px + 3] = a;
    }
  }

  const idat = deflateSync(raw, { level: 6 });

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

/**
 * OGP/Twitter Card用画像生成 (1200×630)
 * - ダークインディゴ背景 (#0f172a)
 * - 中央左にアイコン (192px相当)
 * - 右側に横線パターン（プロンプト/テキストを象徴）
 * - アクセントカラーのドット群
 */
function createOgImage() {
  const W = 1200, H = 630;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA

  const raw = Buffer.alloc((1 + W * 4) * H);

  // 背景色: #0f172a = rgb(15, 23, 42)
  const [bgR, bgG, bgB] = [15, 23, 42];
  // アクセント: インディゴ #6366f1 = rgb(99, 102, 241)
  const [acR, acG, acB] = [99, 102, 241];
  // セカンダリ: スレート #1e293b = rgb(30, 41, 59)
  const [s2R, s2G, s2B] = [30, 41, 59];
  // グリーン: #34d399 = rgb(52, 211, 153)
  const [grR, grG, grB] = [52, 211, 153];
  // 白
  const [wR, wG, wB] = [255, 255, 255];

  // ---- アイコン領域 (左寄せ中央): 中心 (320, 315), サイズ 192px ----
  const iconCX = 320, iconCY = 315, iconSize = 192;
  const iconX0 = iconCX - iconSize / 2, iconY0 = iconCY - iconSize / 2;

  // アイコン内部定義（createIconのロジックを再利用）
  const iS = iconSize;
  const iLineW = Math.round(iS * 0.56);
  const iLineH = Math.round(iS * 0.06);
  const iLineX = Math.round(iS * 0.19);
  const iLineGap = Math.round(iS * 0.14);
  const iLinesStartY = Math.round(iS * 0.30);
  const iDotRadius = Math.round(iS * 0.13);
  const iDotCX = Math.round(iS * 0.76);
  const iDotCY = Math.round(iS * 0.73);

  // ---- 右側テキスト行パターン ----
  // x: 560〜1140, 計6行
  const textLines = [
    { y: 220, w: 520, h: 14, alpha: 200 },
    { y: 252, w: 460, h: 14, alpha: 200 },
    { y: 284, w: 490, h: 14, alpha: 200 },
    { y: 340, w: 380, h: 10, alpha: 140 },
    { y: 362, w: 420, h: 10, alpha: 140 },
    { y: 384, w: 360, h: 10, alpha: 140 },
  ];

  // ---- グリーンドット群 ----
  const dots = [
    { cx: 1100, cy: 460, r: 22 },
    { cx: 1140, cy: 420, r: 12 },
    { cx: 1060, cy: 490, r: 8 },
  ];

  // ---- インディゴ装飾円（薄め） ----
  const decorCircles = [
    { cx: 1160, cy: 80, r: 120, a: 20 },
    { cx: 60, cy: 570, r: 80, a: 15 },
  ];

  for (let y = 0; y < H; y++) {
    const rowStart = y * (1 + W * 4);
    raw[rowStart] = 0;

    for (let x = 0; x < W; x++) {
      const px = rowStart + 1 + x * 4;
      let r = bgR, g = bgG, b = bgB, a = 255;

      // 装飾円（薄いインディゴ）
      for (const dc of decorCircles) {
        const dx = x - dc.cx, dy = y - dc.cy;
        if (dx * dx + dy * dy <= dc.r * dc.r) {
          r = Math.min(255, r + acR * dc.a / 255);
          g = Math.min(255, g + acG * dc.a / 255);
          b = Math.min(255, b + acB * dc.a / 255);
        }
      }

      // 仕切り線 (x=500 付近)
      if (x >= 496 && x <= 500) {
        r = s2R + 20; g = s2G + 20; b = s2B + 20;
      }

      // 右側テキスト行パターン
      const lx = x - 560;
      if (lx >= 0) {
        for (const line of textLines) {
          if (y >= line.y && y < line.y + line.h && lx < line.w) {
            // ブレンド: ライン色 (スレート明るめ) と背景をアルファブレンド
            const la = line.alpha / 255;
            r = Math.round(r * (1 - la) + (s2R + 30) * la);
            g = Math.round(g * (1 - la) + (s2G + 30) * la);
            b = Math.round(b * (1 - la) + (s2B + 30) * la);
          }
        }
      }

      // グリーンドット群
      for (const dot of dots) {
        const dx = x - dot.cx, dy = y - dot.cy;
        if (dx * dx + dy * dy <= dot.r * dot.r) {
          r = grR; g = grG; b = grB;
        }
      }

      // アイコン描画
      const ix = x - iconX0, iy = y - iconY0;
      if (ix >= 0 && ix < iS && iy >= 0 && iy < iS) {
        let ir = acR, ig = acG, ib = acB, ia = 255;

        // 角丸マスク
        const radius = iS * 0.2;
        const dx = Math.min(ix, iS - 1 - ix);
        const dy2 = Math.min(iy, iS - 1 - iy);
        if (dx < radius && dy2 < radius) {
          const cx = radius - dx, cy = radius - dy2;
          if (cx * cx + cy * cy > radius * radius) ia = 0;
        }

        if (ia > 0) {
          // 白い横線
          for (let li = 0; li < 3; li++) {
            const lineY = iLinesStartY + li * iLineGap;
            const thisW = li === 2 ? Math.round(iLineW * 0.7) : iLineW;
            if (iy >= lineY && iy < lineY + iLineH && ix >= iLineX && ix < iLineX + thisW) {
              ir = wR; ig = wG; ib = wB;
            }
          }
          // 緑ドット
          const ddx = ix - iDotCX, ddy = iy - iDotCY;
          if (ddx * ddx + ddy * ddy <= iDotRadius * iDotRadius) {
            ir = grR; ig = grG; ib = grB;
          }
          // アルファブレンド（角丸部分は透過なので、非透過部分はそのまま上書き）
          r = ir; g = ig; b = ib;
        }
      }

      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
      raw[px + 3] = a;
    }
  }

  const idat = deflateSync(raw, { level: 6 });
  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

const iconDir = join(__dirname, '../public/icons');
mkdirSync(iconDir, { recursive: true });

const icon192 = createIcon(192);
const icon512 = createIcon(512);

writeFileSync(join(iconDir, 'icon-192.png'), icon192);
writeFileSync(join(iconDir, 'icon-512.png'), icon512);
writeFileSync(join(iconDir, 'icon-512-maskable.png'), icon512);

const ogImage = createOgImage();
writeFileSync(join(__dirname, '../public/og-image.png'), ogImage);

console.log('✓ PWAアイコン生成完了: public/icons/');
console.log('  - icon-192.png');
console.log('  - icon-512.png');
console.log('  - icon-512-maskable.png');
console.log('✓ OGP画像生成完了: public/og-image.png');
