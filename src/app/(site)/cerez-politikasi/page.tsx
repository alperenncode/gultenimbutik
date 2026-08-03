import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Çerez Politikası",
  robots: { index: false },
};

const sectionCls = "mt-10";
const hCls = "font-display text-xl text-bordeaux mb-3";
const pCls = "text-sm leading-relaxed text-bordeaux/65 mb-3";

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="section-subtitle">Yasal</p>
      <h1 className="section-title mt-3">Çerez ve Benzer Teknolojiler Politikası</h1>
      <p className="mt-4 text-xs text-bordeaux/40">Son güncelleme: Temmuz 2026</p>

      <section className={sectionCls}>
        <h2 className={hCls}>1. Genel Bilgi</h2>
        <p className={pCls}>
          Sitemizde reklam, pazarlama veya üçüncü taraf çapraz-site takibi amaçlı
          çerez kullanılmaz ve hiçbir kişisel veri üçüncü taraf reklam ağlarıyla
          paylaşılmaz. Kullandığımız tek teknoloji, tarayıcınızın kendi
          hafızasında (çerez, oturum deposu veya cihaz içi veritabanı) tutulan ve
          yalnızca sitenin temel işlevlerini çalıştırmak için gerekli olan
          verilerdir. Aşağıda bunların tamamı tek tek listelenmiştir.
        </p>
      </section>

      <section className={sectionCls}>
        <h2 className={hCls}>2. Kullanılan Depolama Teknolojileri</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-bordeaux/15 text-left text-xs uppercase tracking-wider text-bordeaux/50">
                <th className="py-2 pr-3">Ad</th>
                <th className="py-2 pr-3">Tür</th>
                <th className="py-2 pr-3">Amaç</th>
                <th className="py-2">Süre</th>
              </tr>
            </thead>
            <tbody className="text-bordeaux/65">
              <tr className="border-b border-bordeaux/10">
                <td className="py-2 pr-3 font-mono text-xs">gb-visit-counted</td>
                <td className="py-2 pr-3">Oturum deposu (sessionStorage)</td>
                <td className="py-2 pr-3">
                  Ziyaret sayacının aynı oturumda birden fazla kez artmasını önler
                  (anonim, kişiye bağlı değildir)
                </td>
                <td className="py-2">Sekme kapanana kadar</td>
              </tr>
              <tr className="border-b border-bordeaux/10">
                <td className="py-2 pr-3 font-mono text-xs">gb-session-id</td>
                <td className="py-2 pr-3">Oturum deposu (sessionStorage)</td>
                <td className="py-2 pr-3">
                  Anlık &ldquo;şu an sitede kaç kişi var&rdquo; sayacı için rastgele,
                  anonim bir oturum kimliği
                </td>
                <td className="py-2">Sekme kapanana kadar</td>
              </tr>
              <tr className="border-b border-bordeaux/10">
                <td className="py-2 pr-3 font-mono text-xs">Firebase Authentication</td>
                <td className="py-2 pr-3">Cihaz içi veritabanı (IndexedDB)</td>
                <td className="py-2 pr-3">
                  Üye girişini hatırlar, her sayfada yeniden şifre sormaz —
                  yalnızca üye olan ziyaretçilerde oluşur
                </td>
                <td className="py-2">Siz çıkış yapana kadar</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-mono text-xs">Servis çalışanı (Service Worker)</td>
                <td className="py-2 pr-3">Tarayıcı önbelleği</td>
                <td className="py-2 pr-3">
                  Siteyi telefona/bilgisayara &ldquo;uygulama&rdquo; gibi
                  yükleyebilmenizi (PWA) ve tekrar ziyaretlerde daha hızlı
                  açılmasını sağlar
                </td>
                <td className="py-2">Tarayıcı verilerini temizleyene kadar</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={sectionCls}>
        <h2 className={hCls}>3. Rıza Gerekir mi?</h2>
        <p className={pCls}>
          Yukarıdaki teknolojilerin tamamı, sitenin temel bir işlevini (ziyaretçi
          istatistiği, üyelik oturumu, uygulama gibi çalışma) sağlamak için
          zorunludur; reklam veya profilleme amacı taşımaz. Kişisel Verileri
          Koruma Kurumu&apos;nun çerez rehberi uyarınca bu tür zorunlu/teknik
          amaçlı depolama için ayrıca açık rıza alınması gerekmez, yalnızca
          şeffaf bilgilendirme yapılması yeterlidir — bu sayfa o
          bilgilendirmedir. Tarayıcınızın ayarlarından bu verileri istediğiniz
          zaman silebilir veya engelleyebilirsiniz; bu durumda ziyaretçi
          sayacı ve oturum açık kalma özelliği çalışmayabilir.
        </p>
      </section>

      <section className={sectionCls}>
        <h2 className={hCls}>4. Daha Fazla Bilgi</h2>
        <p className={pCls}>
          Kişisel verilerinizin işlenmesine ilişkin genel bilgiler için{" "}
          <a href="/gizlilik-politikasi" className="underline underline-offset-2 text-rosegold-dark">
            Gizlilik Politikası ve KVKK Aydınlatma Metni
          </a>
          &apos;ni inceleyebilir, sorularınız için {SITE.email} adresine
          yazabilirsiniz.
        </p>
      </section>
    </div>
  );
}
