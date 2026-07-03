"use client";

/**
 * Giriş ve kayıt formlarının ortak gövdesi.
 * Firebase Auth hata kodları kullanıcı dostu Türkçe mesajlara çevrilir.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "E-posta veya şifre hatalı.",
  "auth/user-not-found": "Bu e-posta ile kayıtlı bir hesap bulunamadı.",
  "auth/wrong-password": "Şifre hatalı.",
  "auth/email-already-in-use": "Bu e-posta zaten kayıtlı. Giriş yapmayı deneyin.",
  "auth/weak-password": "Şifre en az 6 karakter olmalıdır.",
  "auth/invalid-email": "Geçerli bir e-posta adresi girin.",
  "auth/too-many-requests": "Çok fazla deneme yapıldı. Lütfen biraz bekleyin.",
  "auth/network-request-failed": "Bağlantı hatası. İnternetinizi kontrol edin.",
};

function friendlyError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  return ERROR_MESSAGES[code] ?? "Bir hata oluştu. Lütfen tekrar deneyin.";
}

export function AuthForm({ mode }: { mode: "giris" | "kayit" }) {
  const isLogin = mode === "giris";
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, name.trim());
      }
      // Favori eklemek isterken yönlendirildiyse hesap sayfasına götür
      const from = searchParams.get("yonlendir");
      router.push(from === "favori" ? "/hesabim?sekme=favoriler" : "/hesabim");
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[65vh] max-w-md flex-col justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-9 text-center">
          <p className="section-subtitle">{isLogin ? "Tekrar Hoş Geldiniz" : "Aramıza Katılın"}</p>
          <h1 className="section-title mt-3">{isLogin ? "Giriş Yap" : "Üye Ol"}</h1>
          <p className="mt-3 text-sm text-bordeaux/55">
            Favorilerinizi kaydedin, her cihazdan ulaşın.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          {!isLogin && (
            <div>
              <label htmlFor="name" className="input-label">Ad Soyad</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Adınız Soyadınız"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="input-label">E-posta</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="ornek@eposta.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="input-label">Şifre</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-11"
                placeholder={isLogin ? "Şifreniz" : "En az 6 karakter"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-bordeaux/40
                  hover:text-bordeaux transition-colors"
                aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </motion.p>
          )}

          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Lütfen bekleyin…
              </>
            ) : isLogin ? (
              "Giriş Yap"
            ) : (
              "Üye Ol"
            )}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-bordeaux/55">
          {isLogin ? "Hesabınız yok mu? " : "Zaten üye misiniz? "}
          <Link
            href={isLogin ? "/kayit" : "/giris"}
            className="text-rosegold-dark underline underline-offset-4 hover:text-bordeaux
              transition-colors"
          >
            {isLogin ? "Üye Olun" : "Giriş Yapın"}
          </Link>
        </p>

        {!isLogin && (
          <p className="mt-4 text-center text-xs leading-relaxed text-bordeaux/40">
            Üye olarak{" "}
            <Link href="/kullanim-kosullari" className="underline underline-offset-2">
              Kullanım Koşulları
            </Link>{" "}
            ve{" "}
            <Link href="/gizlilik-politikasi" className="underline underline-offset-2">
              Gizlilik Politikası
            </Link>
            &apos;nı kabul etmiş olursunuz.
          </p>
        )}
      </motion.div>
    </div>
  );
}
