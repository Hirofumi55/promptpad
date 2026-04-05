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

const iconDir = join(__dirname, '../public/icons');
mkdirSync(iconDir, { recursive: true });

const icon192 = createIcon(192);
const icon512 = createIcon(512);

writeFileSync(join(iconDir, 'icon-192.png'), icon192);
writeFileSync(join(iconDir, 'icon-512.png'), icon512);
writeFileSync(join(iconDir, 'icon-512-maskable.png'), icon512);

console.log('✓ PWAアイコン生成完了: public/icons/');
console.log('  - icon-192.png');
console.log('  - icon-512.png');
console.log('  - icon-512-maskable.png');
