"use client";

/**
 * Hesap güvenliği — şifre ve e-posta değiştirme formları.
 * /hesabim sayfasının "Profilim" sekmesinde gösterilir; adminler de
 * aynı yerden kullanır. Her iki işlem de güvenlik gereği mevcut şifreyi ister.
 */
import { useState } from "react";
import { KeyRound, Mail, Loader2, Save, CheckCircle2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/** Firebase hata kodlarını sade Türkçe mesaja çevirir */
function friendlyError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Mevcut şifreniz hatalı. Lütfen kontrol edip tekrar deneyin.";
    case "auth/weak-password":
      return "Yeni şifre çok zayıf — en az 6 karakter olmalı.";
    case "auth/email-already-in-use":
      return "Bu e-posta adresi başka bir hesapta kayıtlı.";
    case "auth/invalid-email":
      return "Geçerli bir e-posta adresi girin.";
    case "auth/too-many-requests":
      return "Çok fazla deneme yapıldı. Birkaç dakika bekleyip tekrar deneyin.";
    case "auth/requires-recent-login":
      return "Güvenlik için çıkış yapıp yeniden giriş yaptıktan sonra deneyin.";
    default:
      return "İşlem tamamlanamadı. Lütfen tekrar deneyin.";
  }
}

export function AccountSecurity() {
  const { user, isAdmin, changePassword, changeEmail } = useAuth();

  // Şifre formu
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwNew2, setPwNew2] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwDone, setPwDone] = useState(false);

  // E-posta formu
  const [emCurrent, setEmCurrent] = useState("");
  const [emNew, setEmNew] = useState("");
  const [emBusy, setEmBusy] = useState(false);
  const [emError, setEmError] = useState("");
  const [emDone, setEmDone] = useState<"" | "updated" | "verification-sent">("");

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwDone(false);
    if (pwNew.length < 6) return setPwError("Yeni şifre en az 6 karakter olmalı.");
    if (pwNew !== pwNew2) return setPwError("Yeni şifreler birbiriyle aynı değil.");
    setPwBusy(true);
    try {
      await changePassword(pwCurrent, pwNew);
      setPwDone(true);
      setPwCurrent("");
      setPwNew("");
      setPwNew2("");
    } catch (err) {
      console.error(err);
      setPwError(friendlyError(err));
    } finally {
      setPwBusy(false);
    }
  }

  async function onChangeEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmError("");
    setEmDone("");
    const next = emNew.trim().toLowerCase();
    if (!next.includes("@")) return setEmError("Geçerli bir e-posta adresi girin.");
    if (next === user?.email?.toLowerCase())
      return setEmError("Yeni e-posta, mevcut adresinizle aynı.");
    setEmBusy(true);
    try {
      const result = await changeEmail(emCurrent, next);
      setEmDone(result);
      setEmCurrent("");
      if (result === "updated") setEmNew("");
    } catch (err) {
      console.error(err);
      setEmError(friendlyError(err));
    } finally {
      setEmBusy(false);
    }
  }

  return (
    <div className="mt-10 space-y-8">
      <h2 className="border-b border-rosegold/20 pb-2 text-sm font-medium uppercase
        tracking-wider text-bordeaux">
        Hesap Güvenliği
      </h2>

      {/* Şifre değiştir */}
      <form onSubmit={onChangePassword} className="border border-rosegold/20 bg-cream-light p-6">
        <p className="flex items-center gap-2 text-sm font-medium text-bordeaux">
          <KeyRound size={16} className="text-rosegold-dark" /> Şifre Değiştir
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="input-label" htmlFor="pw-current">Mevcut Şifre</label>
            <input
              id="pw-current"
              type="password"
              autoComplete="current-password"
              value={pwCurrent}
              onChange={(e) => setPwCurrent(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="input-label" htmlFor="pw-new">Yeni Şifre</label>
              <input
                id="pw-new"
                type="password"
                autoComplete="new-password"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
                className="input-field"
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="input-label" htmlFor="pw-new2">Yeni Şifre (Tekrar)</label>
              <input
                id="pw-new2"
                type="password"
                autoComplete="new-password"
                value={pwNew2}
                onChange={(e) => setPwNew2(e.target.value)}
                className="input-field"
                minLength={6}
                required
              />
            </div>
          </div>
        </div>

        {pwError && (
          <p className="mt-4 border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
            role="alert">
            {pwError}
          </p>
        )}
        {pwDone && (
          <p className="mt-4 flex items-center gap-2 border border-green-200 bg-green-50
            px-4 py-2.5 text-sm text-green-800">
            <CheckCircle2 size={15} /> Şifreniz başarıyla değiştirildi.
          </p>
        )}

        <button type="submit" disabled={pwBusy} className="btn-primary mt-5 !py-2.5 text-xs disabled:opacity-60">
          {pwBusy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Şifreyi Güncelle
        </button>
      </form>

      {/* E-posta değiştir */}
      <form onSubmit={onChangeEmail} className="border border-rosegold/20 bg-cream-light p-6">
        <p className="flex items-center gap-2 text-sm font-medium text-bordeaux">
          <Mail size={16} className="text-rosegold-dark" /> E-posta Değiştir
        </p>
        <p className="mt-1.5 text-xs text-bordeaux/45 break-all">
          Mevcut adresiniz: {user?.email}
        </p>

        {isAdmin && (
          <p className="mt-3 flex items-start gap-2 border border-amber-300 bg-amber-50
            px-4 py-2.5 text-xs leading-relaxed text-amber-800">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            Önemli: Yönetici yetkiniz e-posta adresinize bağlıdır. E-postanızı
            değiştirirseniz yönetim paneline erişiminiz kapanır; yeni adresin
            Firebase&apos;deki admins listesine eklenmesi gerekir. Emin değilseniz
            değiştirmeden önce geliştiricinize danışın.
          </p>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <label className="input-label" htmlFor="em-new">Yeni E-posta</label>
            <input
              id="em-new"
              type="email"
              autoComplete="email"
              value={emNew}
              onChange={(e) => setEmNew(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="input-label" htmlFor="em-current">Mevcut Şifre</label>
            <input
              id="em-current"
              type="password"
              autoComplete="current-password"
              value={emCurrent}
              onChange={(e) => setEmCurrent(e.target.value)}
              className="input-field"
              required
            />
          </div>
        </div>

        {emError && (
          <p className="mt-4 border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
            role="alert">
            {emError}
          </p>
        )}
        {emDone === "updated" && (
          <p className="mt-4 flex items-center gap-2 border border-green-200 bg-green-50
            px-4 py-2.5 text-sm text-green-800">
            <CheckCircle2 size={15} /> E-posta adresiniz güncellendi.
          </p>
        )}
        {emDone === "verification-sent" && (
          <p className="mt-4 flex items-start gap-2 border border-green-200 bg-green-50
            px-4 py-2.5 text-sm leading-relaxed text-green-800">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
            Yeni adresinize doğrulama bağlantısı gönderildi. Gelen kutunuzu
            (gerekirse spam klasörünü) kontrol edin — bağlantıya tıkladığınızda
            e-postanız değişecek ve yeni adresinizle giriş yapabileceksiniz.
          </p>
        )}

        <button type="submit" disabled={emBusy} className="btn-primary mt-5 !py-2.5 text-xs disabled:opacity-60">
          {emBusy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          E-postayı Güncelle
        </button>
      </form>
    </div>
  );
}
