/**
 * EPS içinden çıkarılan logo önizlemesinden web PNG'si üretir.
 * Orijinal artwork: koyu gri (#333) plaka + beyaz harfler (opak).
 * Piksel parlaklığına göre yeniden boyanır:
 *   koyu pikseller  → marka bordosu (#2C1A1A)
 *   açık pikseller  → krem (#F5F0EB)
 * Kenar yumuşatmaları iki renk arasında orantılı karışır (pürüzsüz kalır).
 *
 * Çıktı: public/logo-plaka.png — her zeminde kullanılabilir, kendi zeminli logo
 * Kullanım: node scripts/make-logo.mjs <kaynak>
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const src = process.argv[2];
if (!src) {
  console.error("Kullanım: node scripts/make-logo.mjs <kaynak>");
  process.exit(1);
}

const PLAQUE = { r: 44, g: 26, b: 26 }; // #2C1A1A
const LETTER = { r: 245, g: 240, b: 235 }; // #F5F0EB
const DARK_SRC = 51; // kaynaktaki plaka tonu (#333)

const { data, info } = await sharp(src, { failOn: "none" })
  .trim()
  .resize({ width: 1200 })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const out = Buffer.alloc(data.length);
for (let i = 0; i < data.length; i += 4) {
  // Gri tonlu kaynak: parlaklık ~ kırmızı kanal
  const f = Math.min(1, Math.max(0, (data[i] - DARK_SRC) / (255 - DARK_SRC)));
  out[i] = Math.round(PLAQUE.r + (LETTER.r - PLAQUE.r) * f);
  out[i + 1] = Math.round(PLAQUE.g + (LETTER.g - PLAQUE.g) * f);
  out[i + 2] = Math.round(PLAQUE.b + (LETTER.b - PLAQUE.b) * f);
  out[i + 3] = data[i + 3]; // alfa korunur
}

const png = await sharp(out, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png()
  .toBuffer();
await writeFile("public/logo-plaka.png", png);
console.log(`✓ public/logo-plaka.png (${info.width}x${info.height})`);
