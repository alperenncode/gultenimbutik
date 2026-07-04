"use client";

/**
 * /admin/dogrula — e-postadaki iki adımlı doğrulama bağlantısının indiği sayfa.
 * Bağlantı geçerliyse kimlik yeniden doğrulanır, bu cihaz 12 saat
 * "doğrulanmış" işaretlenir ve panel açılır.
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import { auth } from "@/lib/firebase-client";
import { markTwoFactorVerified, getPendingEmail } from "@/lib/two-factor";

type Status = "checking" | "need-email" | "verifying" | "done" | "error";

export default function AdminVerifyPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const started = useRef(false);

  async function verify(withEmail: string) {
    setStatus("verifying");
    setError("");
    try {
      const cred = await signInWithEmailLink(auth, withEmail.trim().toLowerCase(), window.location.href);
      markTwoFactorVerified(cred.user.uid);
      setStatus("done");
      // Kısa bir onay gösterip panele geç
      setTimeout(() => router.replace("/admin"), 1200);
    } catch (err) {
      console.error(err);
      const code = (err as { code?: string })?.code ?? "";
      setError(
        code === "auth/invalid-action-code"
          ? "Bu bağlantının süresi dolmuş veya daha önce kullanılmış. Panele dönüp yeni bir bağlantı gönderin."
          : code === "auth/invalid-email"
            ? "E-posta adresi bağlantıyla eşleşmedi. Bağlantının gönderildiği adresi yazın."
            : "Doğrulama tamamlanamadı. Panele dönüp yeni bir bağlantı gönderin."
      );
      setStatus("error");
    }
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (!isSignInWithEmailLink(auth, window.location.href)) {
      setError("Bu sayfa yalnızca e-postanızdaki doğrulama bağlantısıyla açılır.");
      setStatus("error");
      return;
    }
    const stored = getPendingEmail();
    if (stored) verify(stored);
    else setStatus("need-email"); // farklı cihazda açıldıysa e-posta sorulur
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md border border-rosegold/25 bg-white p-8 shadow-card text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rosegold/15">
          <ShieldCheck size={22} className="text-rosegold-dark" />
        </span>

        {(status === "checking" || status === "verifying") && (
          <>
            <h1 className="mt-5 font-display text-2xl text-bordeaux">Doğrulanıyor…</h1>
            <Loader2 size={24} className="mx-auto mt-5 animate-spin text-rosegold-dark" />
          </>
        )}

        {status === "done" && (
          <>
            <h1 className="mt-5 font-display text-2xl text-bordeaux">Doğrulama Başarılı</h1>
            <p className="mt-2 text-sm text-bordeaux/60">
              Kimliğiniz doğrulandı — yönetim paneli açılıyor…
            </p>
          </>
        )}

        {status === "need-email" && (
          <>
            <h1 className="mt-5 font-display text-2xl text-bordeaux">Son Bir Adım</h1>
            <p className="mt-2 text-sm text-bordeaux/60">
              Güvenlik için, doğrulama bağlantısının gönderildiği e-posta adresini yazın.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) verify(email);
              }}
              className="mt-5 space-y-4 text-left"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="ornek@eposta.com"
                required
              />
              <button type="submit" className="btn-primary w-full">Doğrula</button>
            </form>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="mt-5 font-display text-2xl text-bordeaux">Doğrulanamadı</h1>
            <p className="mt-3 flex items-start gap-2 border border-red-200 bg-red-50 px-4 py-3
              text-left text-sm leading-relaxed text-red-700">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              {error}
            </p>
            <button onClick={() => router.replace("/admin")} className="btn-outline mt-5 w-full">
              Panele Dön
            </button>
          </>
        )}
      </div>
    </div>
  );
}
