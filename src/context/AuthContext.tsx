"use client";

/**
 * Oturum durumu — Firebase Auth dinleyicisi + kullanıcı profili + admin kontrolü.
 * Tüm site (site) layout'unda Providers ile sarmalanır.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  updateEmail,
  verifyBeforeUpdateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import {
  ensureUserProfile,
  fetchUserProfile,
  updateUserEmail,
  checkIsAdmin,
} from "@/lib/firestore/users";
import type { UserProfile } from "@/types";

/** E-posta değişikliği sonucu: hemen değişti mi, doğrulama linki mi gitti */
export type EmailChangeResult = "updated" | "verification-sent";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  /** Mevcut şifre doğrulanır, sonra yeni şifre atanır */
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  /** Mevcut şifre doğrulanır; e-posta ya hemen değişir ya da doğrulama linki gönderilir */
  changeEmail: (currentPassword: string, newEmail: string) => Promise<EmailChangeResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (u: User) => {
    // Profil dokümanı yoksa oluştur (ör. ilk giriş)
    await ensureUserProfile(u.uid, u.email ?? "", u.displayName ?? "");
    const [p, admin] = await Promise.all([
      fetchUserProfile(u.uid),
      u.email ? checkIsAdmin(u.email) : Promise.resolve(false),
    ]);
    // E-posta doğrulama linkiyle değiştiyse profil dokümanını eşitle
    if (p && u.email && p.email !== u.email.toLowerCase()) {
      updateUserEmail(u.uid, u.email.toLowerCase()).catch(() => {});
      p.email = u.email.toLowerCase();
    }
    setProfile(p);
    setIsAdmin(admin);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      // Profil ve admin kontrolü bitene kadar "yükleniyor" kalmalı —
      // yoksa AdminGuard, yetki henüz doğrulanmadan kullanıcıyı login'e geri atar
      setLoading(true);
      setUser(u);
      if (u) {
        try {
          await loadProfile(u);
        } catch (err) {
          console.error("Profil yüklenemedi:", err);
        }
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsub;
  }, [loadProfile]);

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      // E-posta her yerde küçük harf — güvenlik kuralları büyük/küçük harfe duyarlı
      const normalized = email.trim().toLowerCase();
      const cred = await createUserWithEmailAndPassword(auth, normalized, password);
      if (displayName) await updateProfile(cred.user, { displayName });
      await ensureUserProfile(cred.user.uid, normalized, displayName);
      await loadProfile(cred.user);
    },
    [loadProfile]
  );

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user);
  }, [user, loadProfile]);

  /** Hassas işlemlerden önce mevcut şifreyle yeniden kimlik doğrulama (Firebase şartı) */
  const reauthenticate = useCallback(async (currentPassword: string) => {
    const u = auth.currentUser;
    if (!u?.email) throw new Error("Oturum bulunamadı — yeniden giriş yapın.");
    const credential = EmailAuthProvider.credential(u.email, currentPassword);
    await reauthenticateWithCredential(u, credential);
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      await reauthenticate(currentPassword);
      const u = auth.currentUser;
      if (!u) throw new Error("Oturum bulunamadı.");
      await updatePassword(u, newPassword);
    },
    [reauthenticate]
  );

  const changeEmail = useCallback(
    async (currentPassword: string, newEmail: string): Promise<EmailChangeResult> => {
      await reauthenticate(currentPassword);
      const u = auth.currentUser;
      if (!u) throw new Error("Oturum bulunamadı.");
      const normalized = newEmail.trim().toLowerCase();

      try {
        await updateEmail(u, normalized);
      } catch (err) {
        // Yeni Firebase projelerinde doğrudan değişiklik kapalıdır:
        // yeni adrese doğrulama linki gönderilir, tıklanınca e-posta değişir
        const code = (err as { code?: string })?.code;
        if (code === "auth/operation-not-allowed") {
          await verifyBeforeUpdateEmail(u, normalized);
          return "verification-sent";
        }
        throw err;
      }

      // Firestore'daki profil dokümanını da eşitle (favoriler bozulmasın)
      try {
        await updateUserEmail(u.uid, normalized);
      } catch {
        /* profil eşitlemesi sonraki girişte loadProfile ile tamamlanır */
      }
      await loadProfile(u);
      return "updated";
    },
    [reauthenticate, loadProfile]
  );

  return (
    <AuthContext.Provider
      value={{
        user, profile, isAdmin, loading,
        signUp, signIn, signOutUser, refreshProfile,
        changePassword, changeEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth, AuthProvider içinde kullanılmalıdır");
  return ctx;
}
