"use client";

/**
 * İki adımlı doğrulama ekranı — admin şifresiyle giriş yaptıktan sonra,
 * panel açılmadan önce e-postasına doğrulama bağlantısı gönderilir.
 * Bağlantı /admin/dogrula sayfasında açılınca bu cihaz 12 saat doğrulanmış
 * sayılır. Başka sekmede doğrulama tamamlanırsa bu ekran kendini açar
 * (storage olayı dinlenir).
 */
import { useEffect, useState } from "react";
import { sendSignInLinkToEmail } from "firebase/auth";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, Loader2, LogOut, RefreshCw } from "lucide-react";
import { auth } from "@/lib/firebase-client";
import { useAuth } from "@/context/AuthContext";
import { isTwoFactorVerified, storePendingEmail } from "@/lib/two-factor";

function friendlyError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/operation-not-allowed":
      return "E-posta bağlantısıyla giriş Firebase'de kapalı görünüyor. Geliştiricinize haber verin (Authentication → Sign-in method → Email link açılmalı).";
    case "auth/too-many-requests":
      return "Çok sık denendi. Birkaç dakika bekleyip tekrar gönderin.";
    case "auth/unauthorized-continue-uri":
      return "Bu alan adı Firebase'de yetkili değil. Geliştiricinize haber verin.";
    default:
      return "Bağlantı gönderilemedi. İnternetinizi kontrol edip tekrar deneyin.";
  }
}

export function TwoFactorGate({ onVerified }: { onVerified: () => void }) {
  const { user, signOutUser } = useAuth();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Başka sekmede doğrulama tamamlanınca burası da açılsın
  useEffect(() => {
    const onStorage = () => {
      if (user && isTwoFactorVerified(user.uid)) onVerified();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [user, onVerified]);

  async function sendLink() {
    if (!user?.email) return;
    setBusy(true);
    setError("");
    try {
      storePendingEmail(user.email);
      await sendSignInLinkToEmail(auth, user.email, {
        url: `${window.location.origin}/admin/dogrula`,
        handleCodeInApp: true,
      });
      setSent(true);
    } catch (err) {
      console.error(err);
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  function recheck() {
    if (user && isTwoFactorVerified(user.uid)) onVerified();
    else setError("Henüz doğrulama görünmüyor — e-postanızdaki bağlantıya tıkladınız mı?");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-4">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md border border-rosegold/25 bg-white p-8 shadow-card"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rosegold/15">
          <ShieldCheck size={22} className="text-rosegold-dark" />
        </span>

        <h1 className="mt-5 font-display text-2xl text-bordeaux">İki Adımlı Doğrulama</h1>
        <p className="mt-2 text-sm leading-relaxed text-bordeaux/60">
          Yönetim panelinin güvenliği için kimliğinizi bir kez daha doğrulamamız
          gerekiyor. <strong className="text-bordeaux break-all">{user?.email}</strong>{" "}
          adresinize bir doğrulama bağlantısı göndereceğiz — bağlantıya{" "}
          <strong className="text-bordeaux">bu cihazda</strong> tıklamanız yeterli.
        </p>

        {sent ? (
          <div className="mt-6 space-y-4">
            <p className="flex items-start gap-2 border border-green-200 bg-green-50 px-4 py-3
              text-sm leading-relaxed text-green-800">
              <Mail size={16} className="mt-0.5 shrink-0" />
              Bağlantı gönderildi! E-postanızı kontrol edin (gerekirse spam/gereksiz
              klasörüne de bakın) ve bağlantıya tıklayın. Doğrulama bu cihazda
              12 saat geçerli olur.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={recheck} className="btn-primary !py-2.5 text-xs">
                <RefreshCw size={14} /> Doğruladım, Devam Et
              </button>
              <button
                onClick={sendLink}
                disabled={busy}
                className="btn-outline !py-2.5 text-xs disabled:opacity-60"
              >
                Tekrar Gönder
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={sendLink}
            disabled={busy}
            className="btn-primary mt-6 w-full disabled:opacity-60"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
            Doğrulama Bağlantısı Gönder
          </button>
        )}

        {error && (
          <p className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert">
            {error}
          </p>
        )}

        <button
          onClick={() => signOutUser()}
          className="mt-6 inline-flex items-center gap-1.5 text-xs text-bordeaux/50
            underline underline-offset-4 transition-colors hover:text-bordeaux"
        >
          <LogOut size={12} /> Farklı hesapla giriş yap
        </button>
      </motion.div>
    </div>
  );
}
