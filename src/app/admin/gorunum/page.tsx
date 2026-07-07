"use client";

/**
 * Görünüm — ana sayfa + header + footer + logo alanlarının renk teması ve
 * ana sayfa bölüm sırası/görünürlüğü buradan yönetilir. Kaydedilen değerler
 * settings/site dokümanına (theme + homeSections alanları) yazılır ve
 * kaydettikten sonra anında (revalidate ile) siteye yansır.
 */
import { useEffect, useState } from "react";
import { Loader2, Save, CheckCircle2, ArrowUp, ArrowDown } from "lucide-react";
import { HelpTip } from "@/components/admin/HelpTip";
import type { HomeSectionConfig, HomeSectionKey, SiteSettings } from "@/types";
import { fetchSiteSettingsClient, saveSiteSettings } from "@/lib/firestore/settings";
import { triggerRevalidate } from "@/lib/revalidate";

const SECTION_LABELS: Record<HomeSectionKey, string> = {
  popular: "Popüler Ürünler",
  lookbook: "Lookbook",
  categories: "Kategoriler",
  new: "Yeni Gelenler",
  testimonials: "Yorumlar (Sizden Gelenler)",
};

function ColorField({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  help?: string;
}) {
  return (
    <div>
      <label className="input-label">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 shrink-0 cursor-pointer border border-bordeaux/15 bg-white p-1"
          aria-label={label}
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field font-mono"
          placeholder="#000000"
        />
      </div>
      {help && <p className="mt-1 text-xs text-bordeaux/40">{help}</p>}
    </div>
  );
}

export default function AdminAppearancePage() {
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

  function setTheme<K extends keyof SiteSettings["theme"]>(key: K, value: SiteSettings["theme"][K]) {
    setSettings((prev) => (prev ? { ...prev, theme: { ...prev.theme, [key]: value } } : prev));
    setSaved(false);
  }

  function moveSection(index: number, direction: -1 | 1) {
    setSettings((prev) => {
      if (!prev) return prev;
      const list = [...prev.homeSections];
      const target = index + direction;
      if (target < 0 || target >= list.length) return prev;
      [list[index], list[target]] = [list[target], list[index]];
      return { ...prev, homeSections: list };
    });
    setSaved(false);
  }

  function toggleSection(index: number) {
    setSettings((prev) => {
      if (!prev) return prev;
      const list: HomeSectionConfig[] = prev.homeSections.map((s, i) =>
        i === index ? { ...s, enabled: !s.enabled } : s
      );
      return { ...prev, homeSections: list };
    });
    setSaved(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setError("");
    setBusy(true);
    try {
      await saveSiteSettings(settings);
      setSaved(true);
      triggerRevalidate();
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

  const { theme } = settings;

  return (
    <div>
      <div className="mb-8">
        <h1 className="flex items-center gap-2 font-display text-2xl text-bordeaux">
          Görünüm
          <HelpTip title="Görünüm Sayfası Neyi Değiştirir?">
            <p>
              Burada <strong>ana sayfa, header (üst menü), footer (alt bilgi) ve logo
              alanlarının</strong> rengini ve ana sayfadaki bölümlerin sırasını
              kendiniz ayarlayabilirsiniz — geliştiriciye ihtiyaç duymadan.
            </p>
            <p>
              <strong>Ürün sayfaları ve admin panelinin kendi görünümü buradan
              etkilenmez</strong> — yalnızca vitrin (müşterinin gördüğü ana sayfa,
              üst menü ve alt bilgi) değişir.
            </p>
            <p>
              Kaydettikten sonra değişiklikler <strong>anında</strong> sitede
              görünür.
            </p>
          </HelpTip>
        </h1>
        <p className="mt-1 text-sm text-bordeaux/50">
          Ana sayfa renk teması, logo arka planı ve bölüm sırası
        </p>
      </div>

      <form onSubmit={onSubmit} className="max-w-3xl space-y-10">
        {/* Renk Teması */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 border-b border-rosegold/20 pb-2
            text-sm font-medium uppercase tracking-wider text-bordeaux">
            Renk Teması
            <HelpTip title="Renk Teması — Hangi Renk Nereyi Etkiler?">
              <ul>
                <li><strong>Sayfa Zemini:</strong> Ana sayfanın ve üst menünün arka planı.</li>
                <li><strong>Koyu Bölüm Rengi:</strong> En üstteki duyuru şeridi, en alttaki
                  footer ve &ldquo;Sizden Gelenler&rdquo; yorum bandının arka planı — üçü
                  birlikte değişir, uyumlu görünsün diye.</li>
                <li><strong>Başlık Rengi:</strong> Ana sayfadaki büyük başlıklar.</li>
                <li><strong>Vurgu (Koyu Zemin Üstü):</strong> Koyu bölümdeki (yorumlar
                  bandı) ikon ve etiket rengi.</li>
                <li><strong>Vurgu (Açık Zemin Üstü):</strong> Açık zeminlerdeki alt
                  başlık etiketleri (ör. &ldquo;Yeni Sezon&rdquo;).</li>
              </ul>
            </HelpTip>
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <ColorField
              label="Sayfa Zemini"
              value={theme.pageBackground}
              onChange={(v) => setTheme("pageBackground", v)}
            />
            <ColorField
              label="Koyu Bölüm Rengi (Şerit + Footer + Yorumlar)"
              value={theme.darkSectionBackground}
              onChange={(v) => setTheme("darkSectionBackground", v)}
            />
            <ColorField
              label="Başlık Rengi"
              value={theme.headingColor}
              onChange={(v) => setTheme("headingColor", v)}
            />
            <ColorField
              label="Vurgu (Koyu Zemin Üstü)"
              value={theme.accentColor}
              onChange={(v) => setTheme("accentColor", v)}
            />
            <ColorField
              label="Vurgu (Açık Zemin Üstü)"
              value={theme.accentColorDark}
              onChange={(v) => setTheme("accentColorDark", v)}
            />
          </div>
        </section>

        {/* Logo Alanı */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 border-b border-rosegold/20 pb-2
            text-sm font-medium uppercase tracking-wider text-bordeaux">
            Logo Alanı
            <HelpTip title="Logo Arka Planı Nasıl Çalışır?">
              <p>
                Logonun kendi görseli değişmez — yalnızca <strong>arkasındaki
                zemin/plaka rengini</strong> açıp kapatabilir, rengini seçebilirsiniz.
                Kapalıyken logo bugünkü gibi, plakasız görünür.
              </p>
            </HelpTip>
          </h2>
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm text-bordeaux">
                <input
                  type="checkbox"
                  checked={theme.logoPlateEnabled}
                  onChange={(e) => setTheme("logoPlateEnabled", e.target.checked)}
                  className="h-4 w-4"
                />
                Header logosunun arkasına plaka ekle
              </label>
              {theme.logoPlateEnabled && (
                <div className="mt-3 max-w-xs">
                  <ColorField
                    label="Header Logo Plaka Rengi"
                    value={theme.logoPlateColor}
                    onChange={(v) => setTheme("logoPlateColor", v)}
                  />
                </div>
              )}
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-bordeaux">
                <input
                  type="checkbox"
                  checked={theme.footerLogoPlateEnabled}
                  onChange={(e) => setTheme("footerLogoPlateEnabled", e.target.checked)}
                  className="h-4 w-4"
                />
                Footer logosunun arkasına plaka ekle
              </label>
              {theme.footerLogoPlateEnabled && (
                <div className="mt-3 max-w-xs">
                  <ColorField
                    label="Footer Logo Plaka Rengi"
                    value={theme.footerLogoPlateColor}
                    onChange={(v) => setTheme("footerLogoPlateColor", v)}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Ana Sayfa Bölüm Sırası */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 border-b border-rosegold/20 pb-2
            text-sm font-medium uppercase tracking-wider text-bordeaux">
            Ana Sayfa Bölüm Sırası
            <HelpTip title="Bölüm Sırası Nasıl Değiştirilir?">
              <p>
                Ok butonlarıyla bölümlerin sırasını değiştirebilir, anahtarla bir
                bölümü tamamen kapatabilirsiniz (ör. Lookbook henüz hazır değilse).
              </p>
              <p>
                <strong>Üst kısım (Hero — logo/başlık alanı) her zaman en başta
                sabittir</strong>, değiştirilemez.
              </p>
            </HelpTip>
          </h2>

          <div className="flex items-center justify-between border border-bordeaux/10 bg-cream-dark/40 px-4 py-3 text-sm text-bordeaux/50">
            <span>Üst Bölüm (Hero — logo/başlık)</span>
            <span className="text-xs uppercase tracking-wider">Sabit</span>
          </div>

          <div className="mt-2 space-y-2">
            {settings.homeSections.map((section, i) => (
              <div
                key={section.key}
                className="flex items-center justify-between gap-3 border border-bordeaux/10 bg-white px-4 py-3"
              >
                <span className={`text-sm ${section.enabled ? "text-bordeaux" : "text-bordeaux/35 line-through"}`}>
                  {SECTION_LABELS[section.key]}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveSection(i, -1)}
                    disabled={i === 0}
                    className="p-1.5 text-bordeaux/50 transition-colors hover:text-rosegold-dark disabled:opacity-25"
                    aria-label="Yukarı taşı"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(i, 1)}
                    disabled={i === settings.homeSections.length - 1}
                    className="p-1.5 text-bordeaux/50 transition-colors hover:text-rosegold-dark disabled:opacity-25"
                    aria-label="Aşağı taşı"
                  >
                    <ArrowDown size={15} />
                  </button>
                  <label className="ml-2 inline-flex items-center gap-1.5 text-xs text-bordeaux/60">
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={() => toggleSection(i)}
                      className="h-4 w-4"
                    />
                    Açık
                  </label>
                </div>
              </div>
            ))}
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
            Görünümü Kaydet
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
