"use client";

/**
 * Admin girişi — normal Firebase Auth girişi yapılır, ardından admins/{email}
 * dokümanı kontrol edilir. Admin değilse oturum kapatılır ve uyarı gösterilir.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck } from "lucide-react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { checkIsAdmin } from "@/lib/firestore/users";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const normalized = email.trim().toLowerCase();
      await signInWithEmailAndPassword(auth, normalized, password);
      const admin = await checkIsAdmin(normalized);
      if (!admin) {
        await signOut(auth);
        setError("Bu hesabın yönetim paneline erişim yetkisi yok.");
        setBusy(false);
        return;
      }
      router.push("/admin");
    } catch {
      setError("E-posta veya şifre hatalı.");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bordeaux px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm bg-cream p-9 shadow-lifted"
      >
        <div className="mb-8 text-center">
          <ShieldCheck size={30} className="mx-auto text-rosegold-dark" strokeWidth={1.4} />
          <h1 className="mt-4 font-display text-2xl text-bordeaux">Yönetim Paneli</h1>
          <p className="mt-1.5 text-xs text-bordeaux/50">Gültenim Butik</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="input-label">E-posta</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="password" className="input-label">Şifre</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>

          {error && (
            <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? <Loader2 size={16} className="animate-spin" /> : "Giriş Yap"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
