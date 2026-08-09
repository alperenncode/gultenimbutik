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
        <h2 className={hCls}>2. Hizmet Sağlayıcı Bilgileri</h2>
        <p className={pCls}>
          6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun uyarınca:
        </p>
        <ul className="list-disc pl-5 text-sm leading-relaxed text-bordeaux/65 mb-3 space-y-1">
          <li>Ünvan: Gültenim Boutique</li>
          <li>Adres: {SITE.address}</li>
          <li>Vergi Dairesi: Kazım Karabekir Vergi Dairesi</li>
          <li>Vergi Numarası: 2250484900</li>
          <li>E-posta: {SITE.email}</li>
          <li>Telefon: {SITE.phoneDisplay}</li>
        </ul>
      </section>

      <section className={sectionCls}>
        <h2 className={hCls}>3. Fiyatlar ve Stok</h2>
        <p className={pCls}>
          Sitede gösterilen fiyatlar bilgilendirme amaçlıdır ve Türk Lirası
          cinsindendir. Fiyatlar ve stok durumu önceden bildirilmeksizin
          değişebilir; bağlayıcı fiyat, sipariş yazışması sırasında teyit edilen
          fiyattır. Ürün görselleri ile gerçek renkler arasında, ekran
          ayarlarından kaynaklı küçük ton farkları olabilir.
        </p>
      </section>

      <section className={sectionCls}>
        <h2 className={hCls}>4. Teslimat</h2>
        <p className={pCls}>
          Teslimat süresi, kargo firması ve kargo ücreti, sipariş yazışması
          sırasında açıkça bildirilir. Sorularınız için bize WhatsApp üzerinden
          ulaşabilirsiniz.
        </p>
      </section>

      <section className={sectionCls}>
        <h2 className={hCls}>5. Mesafeli Satış ve Cayma Hakkı</h2>
        <p className={pCls}>
          WhatsApp veya Instagram üzerinden yazışarak verdiğiniz siparişler,
          6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli
          Sözleşmeler Yönetmeliği kapsamında &ldquo;mesafeli satış
          sözleşmesi&rdquo; sayılır. Bu kapsamda tüketici olarak aşağıdaki
          haklara sahipsiniz:
        </p>
        <p className={pCls}>
          <strong className="text-bordeaux">Cayma hakkı:</strong> Ürünü teslim
          aldığınız tarihten itibaren <strong className="text-bordeaux">14 gün
          içinde</strong>, hiçbir gerekçe göstermeksizin ve cezai şart
          ödemeksizin sözleşmeden cayabilir, ürünü iade edebilirsiniz. Cayma
          hakkınızı kullanmak için bu süre içinde WhatsApp
          ({SITE.phoneDisplay}) veya {SITE.email} adresinden bize açıkça
          bildirmeniz yeterlidir; aşağıdaki örnek metni kullanabilirsiniz.
        </p>
        <div className="border border-bordeaux/15 bg-white px-5 py-4 text-sm text-bordeaux/70 mb-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-bordeaux/50">
            Örnek Cayma Bildirimi
          </p>
          <p className="italic">
            &ldquo;[Sipariş tarihi] tarihinde teslim aldığım [ürün adı] ürünü
            için cayma hakkımı kullanıyorum. Ad Soyad: [___] Sipariş No / Tarih:
            [___] İade IBAN (varsa): [___]&rdquo;
          </p>
        </div>
        <p className={pCls}>
          Cayma bildiriminiz bize ulaştıktan sonra ürünü, etiketleri sökülmemiş
          ve kullanılmamış (denenmiş olması iadeye engel değildir) şekilde 10
          gün içinde tarafımıza göndermeniz gerekir. Ürün bedeli, iade edilen
          ürünün bize ulaşmasından itibaren <strong className="text-bordeaux">
          14 gün içinde</strong>, ödemeyi yaptığınız yöntemle iade edilir.
          Kişiye özel ölçüyle diktirilen veya isteğiniz üzerine sonradan
          değiştirilen (örn. boy kısaltma) ürünlerde cayma hakkı, Mesafeli
          Sözleşmeler Yönetmeliği m.15 uyarınca kullanılamayabilir; bu durum
          sipariş sırasında ayrıca belirtilir.
        </p>
      </section>

      <section className={sectionCls}>
        <h2 className={hCls}>6. Fikri Mülkiyet</h2>
        <p className={pCls}>
          Sitedeki tüm görseller, metinler ve marka unsurları {SITE.name}&apos;e
          veya ilgili marka sahiplerine aittir; yazılı izin olmaksızın
          kopyalanamaz ve ticari amaçla kullanılamaz.
        </p>
      </section>

      <section className={sectionCls}>
        <h2 className={hCls}>7. Üyelik</h2>
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
