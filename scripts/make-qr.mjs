/**
 * Baskı kalitesinde, logolu QR kod üretir: GULTENIM-QR.png (2000x2000).
 * Bordo modüller, beyaz zemin, ortada Gültenim Boutique logosu.
 * Hata düzeltme seviyesi H — logo şeridi koda zarar vermez.
 *
 * Kullanım: node scripts/make-qr.mjs [adres]
 * Varsayılan adres: https://gultenimbutik.vercel.app
 */
import QRCode from "qrcode";
import sharp from "sharp";
import { writeFile, copyFile } from "node:fs/promises";

const url = process.argv[2] || "https://gultenimbutik.vercel.app";
const SIZE = 2000;

// 1) QR'ı yüksek çözünürlükte üret (kenarlarda 2 modül sessiz alan)
const qrBuf = await QRCode.toBuffer(url, {
  errorCorrectionLevel: "H",
  width: SIZE,
  margin: 2,
  color: { dark: "#2C1A1A", light: "#FFFFFF" },
});

// 2) Logoyu QR genişliğinin %42'sine ölçekle + ince beyaz çerçeve ekle
const logoW = Math.round(SIZE * 0.42);
const pad = Math.round(SIZE * 0.012);
const logo = await sharp("public/logo-plaka.png")
  .resize({ width: logoW })
  .extend({
    top: pad, bottom: pad, left: pad, right: pad,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  })
  .png()
  .toBuffer();

// 3) Ortala ve birleştir
const out = await sharp(qrBuf)
  .composite([{ input: logo, gravity: "center" }])
  .png()
  .toBuffer();

await writeFile("GULTENIM-QR.png", out);
console.log(`✓ GULTENIM-QR.png üretildi (${SIZE}x${SIZE}) — adres: ${url}`);

// Masaüstüne de bir kopya bırakmayı dene (bulması kolay olsun)
try {
  const desktop = `${process.env.USERPROFILE}\\Desktop\\GULTENIM-QR.png`;
  await copyFile("GULTENIM-QR.png", desktop);
  console.log(`✓ Masaüstüne kopyalandı: ${desktop}`);
} catch {
  console.log("(Masaüstüne kopyalanamadı — proje klasöründeki dosyayı kullanın.)");
}
