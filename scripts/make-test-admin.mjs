/**
 * GEÇİCİ test admini oluşturur/siler (yerel hata ayıklama için).
 * Kullanım: node scripts/make-test-admin.mjs create | delete
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const EMAIL = "test-gecici@gultenimbutik.com.tr";
const PASSWORD = "GeciciTest!2026";

const content = await readFile(path.join(process.cwd(), ".env.local"), "utf8");
for (const line of content.split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const json = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
initializeApp({ credential: cert(JSON.parse(json)) });

const auth = getAuth();
const db = getFirestore();

if (process.argv[2] === "delete") {
  try {
    const user = await auth.getUserByEmail(EMAIL);
    await auth.deleteUser(user.uid);
    await db.collection("users").doc(user.uid).delete();
  } catch { /* yoksa sorun değil */ }
  await db.collection("admins").doc(EMAIL).delete();
  console.log("✓ Test admin silindi");
} else {
  let user;
  try {
    user = await auth.getUserByEmail(EMAIL);
  } catch {
    user = await auth.createUser({ email: EMAIL, password: PASSWORD, emailVerified: true });
  }
  await db.collection("admins").doc(EMAIL).set({ role: "test", temp: true });
  console.log(`✓ Test admin hazır: ${EMAIL} / ${PASSWORD} (uid: ${user.uid})`);
}
