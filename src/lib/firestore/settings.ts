/**
 * Site ayarları — CLIENT SDK (admin paneli "Site Ayarları" sayfası kullanır).
 * Tek doküman: settings/site. Vitrin tarafı bu veriyi sunucudan
 * (lib/data.ts → getSiteSettings) çeker.
 */
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { mergeSettings } from "@/lib/site";
import type { SiteSettings } from "@/types";

const SETTINGS_REF = () => doc(db, "settings", "site");

export async function fetchSiteSettingsClient(): Promise<SiteSettings> {
  const snap = await getDoc(SETTINGS_REF());
  return mergeSettings(snap.exists() ? snap.data() : null);
}

export async function saveSiteSettings(input: SiteSettings): Promise<void> {
  await setDoc(SETTINGS_REF(), input, { merge: true });
}
