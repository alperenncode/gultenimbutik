/**
 * Firestore güvenlik kurallarını ve index'leri, Firebase CLI'a gerek kalmadan
 * service account ile REST API üzerinden yükler.
 *
 * Kullanım: node scripts/deploy-rules.mjs
 * Gereksinim: .env.local içinde FIREBASE_SERVICE_ACCOUNT_KEY
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { GoogleAuth } from "google-auth-library";

const ROOT = process.cwd();
const PROJECT = "gultenimbutik";

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
    scopes: [
      "https://www.googleapis.com/auth/cloud-platform",
      "https://www.googleapis.com/auth/firebase",
    ],
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  const headers = { authorization: `Bearer ${token}`, "content-type": "application/json" };

  // ── 1. Kurallar: ruleset oluştur + cloud.firestore release'ini güncelle ──
  const rulesContent = await readFile(path.join(ROOT, "firestore.rules"), "utf8");

  const rulesetRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${PROJECT}/rulesets`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        source: { files: [{ name: "firestore.rules", content: rulesContent }] },
      }),
    }
  );
  if (!rulesetRes.ok) throw new Error(`Ruleset oluşturulamadı: ${await rulesetRes.text()}`);
  const ruleset = await rulesetRes.json();
  console.log(`✓ Kural seti oluşturuldu: ${ruleset.name}`);

  const releaseName = `projects/${PROJECT}/releases/cloud.firestore`;
  // Önce güncellemeyi dene (release varsa), yoksa oluştur
  const patchRes = await fetch(
    `https://firebaserules.googleapis.com/v1/${releaseName}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        release: { name: releaseName, rulesetName: ruleset.name },
      }),
    }
  );
  if (patchRes.ok) {
    console.log("✓ Firestore kuralları YAYINDA (güncellendi)");
  } else {
    const createRes = await fetch(
      `https://firebaserules.googleapis.com/v1/projects/${PROJECT}/releases`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ name: releaseName, rulesetName: ruleset.name }),
      }
    );
    if (!createRes.ok) throw new Error(`Release oluşturulamadı: ${await createRes.text()}`);
    console.log("✓ Firestore kuralları YAYINDA (ilk kez yayınlandı)");
  }

  // ── 2. Composite index'ler ──
  const indexConfig = JSON.parse(
    await readFile(path.join(ROOT, "firestore.indexes.json"), "utf8")
  );

  for (const idx of indexConfig.indexes) {
    const cg = idx.collectionGroup;
    const body = {
      queryScope: idx.queryScope,
      fields: idx.fields.map((f) => ({ fieldPath: f.fieldPath, order: f.order })),
    };
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/collectionGroups/${cg}/indexes`,
      { method: "POST", headers, body: JSON.stringify(body) }
    );
    const label = `${cg}(${idx.fields.map((f) => f.fieldPath).join(", ")})`;
    if (res.ok) {
      console.log(`✓ Index oluşturuluyor: ${label}`);
    } else if (res.status === 409) {
      console.log(`↷ Index zaten var: ${label}`);
    } else {
      console.warn(`⚠ Index hatası (${label}): ${await res.text()}`);
    }
  }

  console.log("\nTamamlandı. Index'lerin hazırlanması birkaç dakika sürebilir (arka planda).");
}

main().catch((err) => {
  console.error("Hata:", err.message ?? err);
  process.exit(1);
});
