"use client";

/**
 * Favoriler — kullanıcının wishlist'i Firestore'da tutulur (cihazlar arası senkron).
 * Giriş yapılmamışsa favori ekleme denemesi kullanıcıyı /giris sayfasına yönlendirir.
 * Optimistic UI: önce arayüz güncellenir, yazma başarısız olursa geri alınır.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { addToWishlist, removeFromWishlist } from "@/lib/firestore/users";

interface WishlistContextValue {
  wishlist: string[];
  count: number;
  isInWishlist: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Profil değişince (giriş/çıkış) senkronize et
  useEffect(() => {
    setWishlist(profile?.wishlist ?? []);
  }, [profile]);

  const isInWishlist = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  const toggle = useCallback(
    async (productId: string) => {
      if (!user) {
        router.push("/giris?yonlendir=favori");
        return;
      }
      const inList = wishlist.includes(productId);
      // Optimistic güncelleme
      setWishlist((prev) =>
        inList ? prev.filter((id) => id !== productId) : [...prev, productId]
      );
      try {
        if (inList) await removeFromWishlist(user.uid, productId);
        else await addToWishlist(user.uid, productId);
      } catch (err) {
        // Başarısızsa geri al
        setWishlist((prev) =>
          inList ? [...prev, productId] : prev.filter((id) => id !== productId)
        );
        console.error("Favori güncellenemedi:", err);
      }
    },
    [user, wishlist, router]
  );

  return (
    <WishlistContext.Provider
      value={{ wishlist, count: wishlist.length, isInWishlist, toggle }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist, WishlistProvider içinde kullanılmalıdır");
  return ctx;
}
