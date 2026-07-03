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
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import {
  ensureUserProfile,
  fetchUserProfile,
  checkIsAdmin,
} from "@/lib/firestore/users";
import type { UserProfile } from "@/types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
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
    setProfile(p);
    setIsAdmin(admin);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
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

  return (
    <AuthContext.Provider
      value={{ user, profile, isAdmin, loading, signUp, signIn, signOutUser, refreshProfile }}
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
