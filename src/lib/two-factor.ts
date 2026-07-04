/**
 * Admin paneli iki adımlı doğrulama (2FA) yardımcıları.
 *
 * Akış: Admin şifresiyle giriş yapar → panel, e-postasına Firebase
 * doğrulama bağlantısı gönderir → bağlantıya tıklanınca /admin/dogrula
 * sayfası kimliği yeniden doğrular ve bu cihaz 12 saat "doğrulanmış" sayılır.
 * (SMS tabanlı MFA, Firebase'in ücretsiz planında bulunmadığından
 * e-posta bağlantısı yöntemi kullanılır.)
 */

const FLAG_KEY = "gb-admin-2fa";
const EMAIL_KEY = "gb-2fa-email";
/** Doğrulama bu cihazda 12 saat geçerli */
const VALID_MS = 12 * 60 * 60 * 1000;

export function isTwoFactorVerified(uid: string): boolean {
  try {
    const raw = localStorage.getItem(FLAG_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw) as { uid?: string; exp?: number };
    return data.uid === uid && typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export function markTwoFactorVerified(uid: string): void {
  try {
    localStorage.setItem(FLAG_KEY, JSON.stringify({ uid, exp: Date.now() + VALID_MS }));
  } catch {
    /* depolama kapalıysa her girişte doğrulama istenir */
  }
}

export function clearTwoFactor(): void {
  try {
    localStorage.removeItem(FLAG_KEY);
  } catch {
    /* önemsiz */
  }
}

/** Doğrulama bağlantısı gönderilen e-posta — /admin/dogrula sayfası okur */
export function storePendingEmail(email: string): void {
  try {
    localStorage.setItem(EMAIL_KEY, email);
  } catch {
    /* önemsiz */
  }
}

export function getPendingEmail(): string {
  try {
    return localStorage.getItem(EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}
