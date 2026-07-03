import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
  robots: { index: false },
};

const sectionCls = "mt-10";
const hCls = "font-display text-xl text-bordeaux mb-3";
const pCls = "text-sm leading-relaxed text-bordeaux/65 mb-3";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="section-subtitle">Yasal</p>
      <h1 className="section-title mt-3">Kullanım Koşulları</h1>
      <p className="mt-4 text-xs text-bordeaux/40">Son güncelleme: Temmuz 2026</p>

      <section className={sectionCls}>
        <h2 className={hCls}>1. Sitenin Niteliği</h2>
        <p className={pCls}>
          Bu site, {SITE.name}&apos;in ürünlerini sergileyen bir dijital
          kataloğudur. Site üzerinden çevrimiçi ödeme alınmaz ve sipariş
          tamamlanmaz; tüm siparişler WhatsApp ({SITE.phoneDisplay}) veya
          Instagram (@{SITE.instagramHandle}) üzerinden, karşılıklı yazışma ile
          oluşturulur.
        </p>
      </section>

      <section className={sectionCls}>
        <h2 className={hCls}>2. Fiyatlar ve Stok</h2>
        <p className={pCls}>
          Sitede gösterilen fiyatlar bilgilendirme amaçlıdır ve Türk Lirası
          cinsindendir. Fiyatlar ve stok durumu önceden bildirilmeksizin
          değişebilir; bağlayıcı fiyat, sipariş yazışması sırasında teyit edilen
          fiyattır. Ürün görselleri ile gerçek renkler arasında, ekran
          ayarlarından kaynaklı küçük ton farkları olabilir.
        </p>
      </section>

      <section className={sectionCls}>
        <h2 className={hCls}>3. Teslimat ve İade</h2>
        <p className={pCls}>
          Teslimat ve iade koşulları, sipariş yazışması sırasında açıkça
          bildirilir ve karşılıklı mutabakatla kesinleşir. Sorularınız için bize
          WhatsApp üzerinden ulaşabilirsiniz.
        </p>
      </section>

      <section className={sectionCls}>
        <h2 className={hCls}>4. Fikri Mülkiyet</h2>
        <p className={pCls}>
          Sitedeki tüm görseller, metinler ve marka unsurları {SITE.name}&apos;e
          veya ilgili marka sahiplerine aittir; yazılı izin olmaksızın
          kopyalanamaz ve ticari amaçla kullanılamaz.
        </p>
      </section>

      <section className={sectionCls}>
        <h2 className={hCls}>5. Üyelik</h2>
        <p className={pCls}>
          Üyelik yalnızca favori listesi özelliği içindir ve ücretsizdir. Yanlış
          bilgi verilmesi veya kötüye kullanım hâlinde Butik, üyeliği askıya alma
          hakkını saklı tutar. Kişisel verilerin işlenmesine ilişkin detaylar
          için Gizlilik Politikası&apos;na bakınız.
        </p>
      </section>
    </div>
  );
}
