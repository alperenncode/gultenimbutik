/**
 * PWA ikonlarını üretir (public/icons/): 192, 512 ve maskable 512.
 * Marka monogramı: bordo zemin üzerine krem "G", rose gold çerçeve detayı.
 * Kullanım: node scripts/make-icons.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "icons");
await mkdir(OUT, { recursive: true });

function svg(padding = 0) {
  // padding: maskable ikonlarda güvenli alan için içerik küçültülür
  const scale = 1 - padding * 2;
  return Buffer.from(`
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#2C1A1A"/>
  <g transform="translate(${512 * padding} ${512 * padding}) scale(${scale})">
    <circle cx="256" cy="256" r="190" fill="none" stroke="#D4AF88" stroke-width="6" opacity="0.85"/>
    <circle cx="256" cy="256" r="170" fill="none" stroke="#D4AF88" stroke-width="1.5" opacity="0.5"/>
    <text x="256" y="330" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
      font-size="230" font-style="italic" fill="#F5F0EB">G</text>
  </g>
</svg>`);
}

await sharp(svg()).resize(192, 192).png().toFile(path.join(OUT, "icon-192.png"));
await sharp(svg()).resize(512, 512).png().toFile(path.join(OUT, "icon-512.png"));
// Maskable: Android yuvarlak maskeleri için %12 güvenli alan
await sharp(svg(0.12)).resize(512, 512).png().toFile(path.join(OUT, "icon-maskable-512.png"));
await sharp(svg()).resize(180, 180).png().toFile(path.join(OUT, "apple-touch-icon.png"));

console.log("✓ İkonlar üretildi: public/icons/");
