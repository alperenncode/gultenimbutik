/**
 * Yönetim paneline admin ekler (Firestore admins koleksiyonu).
 * Kullanım: node scripts/add-admin.mjs eposta@ornek.com
 * Gereksinim: .env.local içinde FIREBASE_SERVICE_ACCOUNT_KEY
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !email.includes("@")) {
  console.error("Kullanım: node scripts/add-admin.mjs eposta@ornek.com");
  process.exit(1);
}

try {
  const content = await readFile(path.join(process.cwd(), ".env.local"), "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch { /* env yoksa ortamdan okunur */ }

const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!raw) {
  console.error("FIREBASE_SERVICE_ACCOUNT_KEY bulunamadı (.env.local).");
  process.exit(1);
}
const json = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
initializeApp({ credential: cert(JSON.parse(json)) });

await getFirestore().collection("admins").doc(email).set({
  role: "admin",
  addedAt: Timestamp.now(),
});
console.log(`✓ Admin eklendi: ${email}`);
console.log("Bu e-postayla sitede üye olduktan sonra /admin/login'den panele girilebilir.");
