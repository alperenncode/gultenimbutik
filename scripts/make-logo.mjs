/**
 * EPS içinden çıkarılan logo önizlemesinden web PNG'si üretir.
 * Orijinal artwork: koyu gri (#333) plaka + beyaz harfler (opak).
 * Piksel parlaklığına göre yeniden boyanır:
 *   koyu pikseller (plaka) → krem (#FAF7F3)
 *   açık pikseller (harf/motif) → altın degrade (üstte açık altın, altta bronz)
 * Kenar yumuşatmaları iki renk arasında orantılı karışır (pürüzsüz kalır).
 * Son adımda plakanın köşeleri yuvarlatılır (baked-in rounded-rect maske) —
 * hangi CSS'te kullanılırsa kullanılsın köşeler her zaman yumuşak görünür.
 *
 * Çıktı: public/logo-plaka.png
 * Kullanım: node scripts/make-logo.mjs <kaynak>
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const src = process.argv[2];
if (!src) {
  console.error("Kullanım: node scripts/make-logo.mjs <kaynak>");
  process.exit(1);
}

const PLAQUE = { r: 250, g: 247, b: 243 }; // #FAF7F3 krem
const GOLD_TOP = { r: 232, g: 208, b: 179 }; // #E8D0B3 açık altın (üst parlama)
const GOLD_BOTTOM = { r: 138, g: 103, b: 58 }; // #8A673A koyu bronz (alt gölge)
const DARK_SRC = 51; // kaynaktaki plaka tonu (#333)
const CORNER_RATIO = 0.09; // köşe yarıçapı / kısa kenar

const { data, info } = await sharp(src, { failOn: "none" })
  .trim()
  .resize({ width: 1200 })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height } = info;
const out = Buffer.alloc(data.length);

for (let y = 0; y < height; y++) {
  const g = height > 1 ? y / (height - 1) : 0; // 0 üstte, 1 altta — metalik degrade
  const goldR = GOLD_TOP.r + (GOLD_BOTTOM.r - GOLD_TOP.r) * g;
  const goldG = GOLD_TOP.g + (GOLD_BOTTOM.g - GOLD_TOP.g) * g;
  const goldB = GOLD_TOP.b + (GOLD_BOTTOM.b - GOLD_TOP.b) * g;
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    const f = Math.min(1, Math.max(0, (data[i] - DARK_SRC) / (255 - DARK_SRC)));
    out[i] = Math.round(PLAQUE.r + (goldR - PLAQUE.r) * f);
    out[i + 1] = Math.round(PLAQUE.g + (goldG - PLAQUE.g) * f);
    out[i + 2] = Math.round(PLAQUE.b + (goldB - PLAQUE.b) * f);
    out[i + 3] = data[i + 3]; // alfa korunur
  }
}

// Köşeleri yuvarlatan maske — dest-in ile bindirilir
const radius = Math.round(Math.min(width, height) * CORNER_RATIO);
const maskSvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="#fff"/>
</svg>`;
const mask = await sharp(Buffer.from(maskSvg)).png().toBuffer();

const png = await sharp(out, { raw: { width, height, channels: 4 } })
  .composite([{ input: mask, blend: "dest-in" }])
  .png()
  .toBuffer();

await writeFile("public/logo-plaka.png", png);
console.log(`✓ public/logo-plaka.png (${width}x${height}), köşe yarıçapı ${radius}px`);
