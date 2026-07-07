"use client";

/**
 * Site Ayarları — iletişim bilgileri, üst duyuru şeridi ve Hakkımızda sayfası
 * içeriği buradan düzenlenir. Kaydedilen değerler settings/site dokümanına
 * yazılır; vitrin en geç 10 dakika içinde yeni değerleri gösterir.
 */
import { useEffect, useState } from "react";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { HelpTip } from "@/components/admin/HelpTip";
import type { SiteSettings } from "@/types";
import { fetchSiteSettingsClient, saveSiteSettings } from "@/lib/firestore/settings";
import { triggerRevalidate } from "@/lib/revalidate";

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="flex items-center gap-2 font-display text-2xl text-bordeaux">
          Site Ayarları
          <HelpTip title="Site Ayarları Neyi Değiştirir?">
            <p>
              Buradaki bilgiler sitenin <strong>her yerinde</strong> otomatik kullanılır —
              tek yerden değiştirirsiniz, her yer güncellenir:
            </p>
            <ul>
              <li><strong>Telefon &amp; WhatsApp:</strong> Üst duyuru, alt bilgi (footer),
                iletişim sayfası ve tüm &ldquo;WhatsApp&apos;tan Sipariş Ver&rdquo; butonları.</li>
              <li><strong>Instagram:</strong> Sağ alttaki yüzen buton, footer ve iletişim sayfası.</li>
              <li><strong>E-posta &amp; Adres:</strong> Footer ve iletişim sayfası.</li>
              <li><strong>Duyuru şeridi:</strong> Her sayfanın en üstündeki bordo şerit.</li>
              <li><strong>Hakkımızda:</strong> Hakkımızda sayfasının tamamı.</li>
            </ul>
            <p>
              Değişiklikler kaydettikten sonra sitede <strong>en geç 10 dakika</strong>{" "}
              içinde görünür. Her bölümün yanındaki <strong>?</strong> işaretinden ayrıntılı
              açıklama okuyabilirsiniz.
            </p>
          </HelpTip>
        </h1>
        <p className="mt-1 text-sm text-bordeaux/50">
          İletişim bilgileri, duyuru şeridi ve Hakkımızda içeriği — değişiklikler
          sitede en geç 10 dakika içinde görünür
        </p>
      </div>

      <form onSubmit={onSubmit} className="max-w-3xl space-y-10">
        {/* İletişim bilgileri */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 border-b border-rosegold/20 pb-2
            text-sm font-medium uppercase tracking-wider text-bordeaux">
            İletişim Bilgileri
            <HelpTip title="İletişim Bilgileri — Alan Alan Açıklama">
              <ul>
                <li>
                  <strong>Görünen Telefon:</strong> Müşterilerin sitede okuyacağı
                  biçim, ör. <strong>0533 285 36 39</strong>. İstediğiniz gibi boşluk
                  koyabilirsiniz.
                </li>
                <li>
                  <strong>WhatsApp Numarası (teknik):</strong> Sipariş butonlarının
                  arka planda kullandığı numaradır. <strong>90 ile başlamalı ve boşluksuz
                  12 rakam</strong> olmalı, ör. <strong>905332853639</strong>. Yanlış yazılırsa
                  müşterinin WhatsApp mesajı yanlış numaraya gider — kaydettikten sonra
                  sitedeki butonu bir kez deneyin.
                </li>
                <li>
                  <strong>Instagram Kullanıcı Adı:</strong> @ işareti olmadan yazın,
                  ör. <strong>gultenim_boutique</strong>.
                </li>
                <li>
                  <strong>E-posta ve Adres:</strong> Footer ve İletişim sayfasında görünür.
                </li>
              </ul>
            </HelpTip>
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
          <h2 className="mb-4 flex items-center gap-2 border-b border-rosegold/20 pb-2
            text-sm font-medium uppercase tracking-wider text-bordeaux">
            Üst Duyuru Şeridi
            <HelpTip title="Duyuru Şeridi Ne İşe Yarar?">
              <p>
                Sitenin en tepesindeki ince bordo şeritte yazan metindir ve{" "}
                <strong>her sayfada</strong> görünür. Müşterinin gözüne ilk çarpan yer
                olduğu için kampanya ve önemli duyurular için idealdir.
              </p>
              <p>Örnekler:</p>
              <ul>
                <li>&ldquo;Bayrama özel tüm takımlarda %20 indirim&rdquo;</li>
                <li>&ldquo;500 TL üzeri siparişlerde kargo bedava&rdquo;</li>
                <li>&ldquo;Yeni sezon ürünleri yüklendi — Koleksiyona göz atın&rdquo;</li>
              </ul>
              <p>
                Kısa tutun (tek satır) — telefonda uzun metin iki satıra sarkar.
              </p>
            </HelpTip>
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
          <h2 className="mb-4 flex items-center gap-2 border-b border-rosegold/20 pb-2
            text-sm font-medium uppercase tracking-wider text-bordeaux">
            Hakkımızda Sayfası
            <HelpTip title="Hakkımızda Sayfası Nasıl Yazılır?">
              <p>
                Buraya yazdıklarınız sitenizin <strong>Hakkımızda</strong> sayfasında
                aynen görünür.
              </p>
              <ul>
                <li><strong>Başlık:</strong> Sayfanın en üstündeki büyük yazı
                  (genelde mağaza adı).</li>
                <li>
                  <strong>Metin:</strong> Hikayeniz. <strong>Paragraf ayırmak için iki
                  paragraf arasında bir boş satır bırakın</strong> — sitede ayrı
                  paragraflar olarak, ferah şekilde gösterilir.
                </li>
                <li><strong>Alt Söz:</strong> Sayfanın sonunda tırnak içinde, el yazısı
                  hissiyatında gösterilen kısa slogan (ör. &ldquo;Zarafet, detaylarda
                  gizlidir.&rdquo;). Boş bırakırsanız hiç görünmez.</li>
              </ul>
              <p>
                İpucu: Samimi anlatım güven verir — nasıl başladığınız, ürünleri
                nasıl seçtiğiniz, siparişin nasıl işlediği güzel konulardır.
              </p>
            </HelpTip>
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
