/**
 * Yönetim paneline admin ekler (Firestore admins koleksiyonu).
 * İkinci argüman olarak şifre verilirse Auth kullanıcısını da oluşturur
 * (kullanıcı zaten varsa şifresini o değere günceller).
 *
 * Kullanım: node scripts/add-admin.mjs eposta@ornek.com [şifre]
 * Gereksinim: .env.local içinde FIREBASE_SERVICE_ACCOUNT_KEY
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const email = process.argv[2]?.trim().toLowerCase();
const password = process.argv[3];
if (!email || !email.includes("@")) {
  console.error("Kullanım: node scripts/add-admin.mjs eposta@ornek.com [şifre]");
  process.exit(1);
}
if (password && password.length < 6) {
  console.error("Şifre en az 6 karakter olmalı.");
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

// Şifre verildiyse Auth kullanıcısını oluştur/güncelle
if (password) {
  const auth = getAuth();
  try {
    const existing = await auth.getUserByEmail(email);
    await auth.updateUser(existing.uid, { password });
    console.log(`✓ Kullanıcı zaten vardı, şifresi güncellendi: ${email}`);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      await auth.createUser({ email, password, emailVerified: false });
      console.log(`✓ Auth kullanıcısı oluşturuldu: ${email}`);
    } else {
      throw err;
    }
  }
}

await getFirestore().collection("admins").doc(email).set({
  role: "admin",
  addedAt: Timestamp.now(),
});
console.log(`✓ Admin eklendi: ${email}`);
console.log("Artık /admin/login sayfasından panele girebilir (2 adımlı doğrulama e-postasına gelir).");
