/**
 * Firebase Authentication'da "E-posta bağlantısıyla giriş"i (email link)
 * Console'a girmeye gerek kalmadan REST API ile etkinleştirir ve yetkili
 * alan adlarını (authorized domains) günceller.
 *
 * Admin panelinin iki adımlı doğrulaması bu özelliğe dayanır.
 * Kullanım: node scripts/enable-email-link.mjs
 * Gereksinim: .env.local içinde FIREBASE_SERVICE_ACCOUNT_KEY
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { GoogleAuth } from "google-auth-library";

const ROOT = process.cwd();
const PROJECT = "gultenimbutik";
const REQUIRED_DOMAINS = [
  "localhost",
  "gultenimbutik.vercel.app",
  "gultenimbutik.firebaseapp.com",
  "gultenimbutik.com.tr",
  "www.gultenimbutik.com.tr",
];

async function loadEnv() {
  try {
    const content = await readFile(path.join(ROOT, ".env.local"), "utf8");
    for (const line of content.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {
    /* .env.local yoksa ortam değişkenlerinden okunur */
  }
}

async function main() {
  await loadEnv();
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    console.error("FIREBASE_SERVICE_ACCOUNT_KEY bulunamadı (.env.local).");
    process.exit(1);
  }
  const credentials = JSON.parse(
    raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8")
  );

  const auth = new GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  const headers = { authorization: `Bearer ${token}`, "content-type": "application/json" };

  const base = `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT}/config`;

  // Mevcut yapılandırmayı al (yetkili alan adlarını kaybetmemek için)
  const getRes = await fetch(base, { headers });
  if (!getRes.ok) throw new Error(`Yapılandırma okunamadı: ${await getRes.text()}`);
  const config = await getRes.json();

  const domains = [...new Set([...(config.authorizedDomains ?? []), ...REQUIRED_DOMAINS])];

  const patchRes = await fetch(`${base}?updateMask=signIn.email,authorizedDomains`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      signIn: {
        email: {
          enabled: true,
          // false = şifresiz e-posta bağlantısı girişi AÇIK
          // (şifreli giriş de çalışmaya devam eder)
          passwordRequired: false,
        },
      },
      authorizedDomains: domains,
    }),
  });
  if (!patchRes.ok) throw new Error(`Güncellenemedi: ${await patchRes.text()}`);

  const updated = await patchRes.json();
  console.log("✓ E-posta bağlantısıyla giriş (email link) ETKİN");
  console.log(`✓ Yetkili alan adları: ${(updated.authorizedDomains ?? domains).join(", ")}`);
}

main().catch((err) => {
  console.error("Hata:", err.message ?? err);
  process.exit(1);
});
