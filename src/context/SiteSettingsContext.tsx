"use client";

/**
 * Site ayarları context'i — sunucuda çekilen settings/site verisi,
 * client bileşenlerine (Header, Footer, WhatsApp butonları vb.) buradan dağıtılır.
 * Provider dışında kullanılırsa varsayılan sabitler döner (admin paneli gibi).
 */
import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_SETTINGS, instagramUrlOf } from "@/lib/site";
import type { SiteSettings } from "@/types";

const SiteSettingsContext = createContext<SiteSettings>(DEFAULT_SETTINGS);

export function SiteSettingsProvider({
  settings,
  children,
}: {
  settings?: SiteSettings;
  children: ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider value={settings ?? DEFAULT_SETTINGS}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettings & { instagramUrl: string } {
  const settings = useContext(SiteSettingsContext);
  return { ...settings, instagramUrl: instagramUrlOf(settings.instagramHandle) };
}
