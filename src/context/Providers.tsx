"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./AuthContext";
import { WishlistProvider } from "./WishlistContext";

/** Tüm client context'leri tek yerde toplar — layout'larda tek satırla sarmalanır. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <WishlistProvider>{children}</WishlistProvider>
    </AuthProvider>
  );
}
