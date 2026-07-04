"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./AuthContext";
import { WishlistProvider } from "./WishlistContext";
import { SiteSettingsProvider } from "./SiteSettingsContext";
import type { SiteSettings } from "@/types";

/** Tüm client context'leri tek yerde toplar — layout'larda tek satırla sarmalanır. */
export function Providers({
  children,
  settings,
}: {
  children: ReactNode;
  /** Sunucuda çekilen site ayarları — verilmezse varsayılan sabitler kullanılır */
  settings?: SiteSettings;
}) {
  return (
    <SiteSettingsProvider settings={settings}>
      <AuthProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </AuthProvider>
    </SiteSettingsProvider>
  );
}
