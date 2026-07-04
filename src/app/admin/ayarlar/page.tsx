"use client";

/**
 * Site Ayarları — iletişim bilgileri, üst duyuru şeridi ve Hakkımızda sayfası
 * içeriği buradan düzenlenir. Kaydedilen değerler settings/site dokümanına
 * yazılır; vitrin en geç 10 dakika içinde yeni değerleri gösterir.
 */
import { useEffect, useState } from "react";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import type { SiteSettings } from "@/types";
import { fetchSiteSettingsClient, saveSiteSettings } from "@/lib/firestore/settings";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSiteSettingsClient()
      .then(setSettings)
      .catch((err) => {
        console.error(err);
        setError("Ayarlar yüklenemedi. Sayfayı yenileyin.");
      });
  }, []);

  function set<K extends keyof SiteSettings>(key: K, value: string) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setError("");

    // WhatsApp numarası: yalnızca rakam, 90 ile başlamalı (wa.me formatı)
    const number = settings.whatsappNumber.replace(/\D/g, "");
    if (!/^90\d{10}$/.test(number)) {
      setError(
        "WhatsApp numarası uluslararası formatta olmalı: 90 ile başlayan 12 rakam. Örnek: 905332853639"
      );
      return;
    }

    setBusy(true);
    try {
      await saveSiteSettings({ ...settings, whatsappNumber: number });
      setSaved(true);
    } catch (err) {
      console.error(err);
      setError("Kaydedilemedi. Yetkinizi ve bağlantınızı kontrol edin.");
    } finally {
      setBusy(false);
    }
  }

  if (!settings) {
    return (
      <div className="flex justify-center py-24">
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <Loader2 size={28} className="animate-spin text-rosegold-dark" />
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl text-bordeaux">Site Ayarları</h1>
        <p className="mt-1 text-sm text-bordeaux/50">
          İletişim bilgileri, duyuru şeridi ve Hakkımızda içeriği — değişiklikler
          sitede en geç 10 dakika içinde görünür
        </p>
      </div>

      <form onSubmit={onSubmit} className="max-w-3xl space-y-10">
        {/* İletişim bilgileri */}
        <section>
          <h2 className="mb-4 border-b border-rosegold/20 pb-2 text-sm font-medium
            uppercase tracking-wider text-bordeaux">
            İletişim Bilgileri
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="input-label">Görünen Telefon</label>
              <input
                value={settings.phoneDisplay}
                onChange={(e) => set("phoneDisplay", e.target.value)}
                className="input-field"
                placeholder="0533 285 36 39"
              />
              <p className="mt-1 text-xs text-bordeaux/40">Sitede yazı olarak görünen format</p>
            </div>
            <div>
              <label className="input-label">WhatsApp Numarası (teknik)</label>
              <input
                value={settings.whatsappNumber}
                onChange={(e) => set("whatsappNumber", e.target.value)}
                className="input-field font-mono"
                placeholder="905332853639"
              />
              <p className="mt-1 text-xs text-bordeaux/40">
                90 ile başlar, boşluksuz — sipariş butonları bu numaraya mesaj açar
              </p>
            </div>
            <div>
              <label className="input-label">Instagram Kullanıcı Adı</label>
              <input
                value={settings.instagramHandle}
                onChange={(e) => set("instagramHandle", e.target.value.replace(/^@/, ""))}
                className="input-field"
                placeholder="gultenim_boutique"
              />
            </div>
            <div>
              <label className="input-label">E-posta</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => set("email", e.target.value)}
                className="input-field"
                placeholder="info@gultenimbutik.com.tr"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="input-label">Mağaza Adresi</label>
              <input
                value={settings.address}
                onChange={(e) => set("address", e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </section>

        {/* Duyuru şeridi */}
        <section>
          <h2 className="mb-4 border-b border-rosegold/20 pb-2 text-sm font-medium
            uppercase tracking-wider text-bordeaux">
            Üst Duyuru Şeridi
          </h2>
          <input
            value={settings.announcement}
            onChange={(e) => set("announcement", e.target.value)}
            className="input-field"
            placeholder="Tüm Türkiye'ye gönderim — Sipariş için WhatsApp: 0533 285 36 39"
          />
          <p className="mt-1 text-xs text-bordeaux/40">
            Her sayfanın en üstündeki bordo şeritte görünen yazı
          </p>
        </section>

        {/* Hakkımızda */}
        <section>
          <h2 className="mb-4 border-b border-rosegold/20 pb-2 text-sm font-medium
            uppercase tracking-wider text-bordeaux">
            Hakkımızda Sayfası
          </h2>
          <div className="space-y-5">
            <div>
              <label className="input-label">Başlık</label>
              <input
                value={settings.aboutTitle}
                onChange={(e) => set("aboutTitle", e.target.value)}
                className="input-field"
                placeholder="Gültenim Butik"
              />
            </div>
            <div>
              <label className="input-label">Metin</label>
              <textarea
                value={settings.aboutText}
                onChange={(e) => set("aboutText", e.target.value)}
                rows={12}
                className="input-field resize-y"
                placeholder="Hikayenizi yazın…"
              />
              <p className="mt-1 text-xs text-bordeaux/40">
                Paragraf ayırmak için arada bir boş satır bırakın
              </p>
            </div>
            <div>
              <label className="input-label">Alt Söz (tırnak içinde gösterilir)</label>
              <input
                value={settings.aboutQuote}
                onChange={(e) => set("aboutQuote", e.target.value)}
                className="input-field"
                placeholder="Zarafet, detaylarda gizlidir."
              />
            </div>
          </div>
        </section>

        {error && (
          <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Ayarları Kaydet
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-700">
              <CheckCircle2 size={16} /> Kaydedildi
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
