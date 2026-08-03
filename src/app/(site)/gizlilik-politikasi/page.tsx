import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gizlilik Politikası (KVKK)",
  robots: { index: false },
};

const sectionCls = "mt-10";
const hCls = "font-display text-xl text-bordeaux mb-3";
const pCls = "text-sm leading-relaxed text-bordeaux/65 mb-3";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="section-subtitle">Yasal</p>
      <h1 className="section-title mt-3">Gizlilik Politikası ve KVKK Aydınlatma Metni</h1>
      <p className="mt-4 text-xs text-bordeaux/40">Son güncelleme: Temmuz 2026</p>

      <section className={sectionCls}>
        <h2 className={hCls}>1. Veri Sorumlusu</h2>
        <p className={pCls}>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;)
          uyarınca kişisel verileriniz, veri sorumlusu sıfatıyla {SITE.name}
          (&ldquo;Butik&rdquo;) tarafından aşağıda açıklanan kapsamda işlenmektedir.
          Adres: {SITE.address}. İletişim: {SITE.email}
        </p>
      </section>

      <section className={sectionCls}>
        <h2 className={hCls}>2. İşlenen Kişisel Veriler</h2>
        <p className={pCls}>
          Sitemizde üyelik oluşturduğunuzda yalnızca şu veriler işlenir: ad-soyad
          (isteğe bağlı), e-posta adresi ve favorilerinize eklediğiniz ürünlerin
          listesi. Şifreniz tarafımızca görülemez; kimlik doğrulama altyapısı
          (Google Firebase Authentication) tarafından şifrelenmiş olarak saklanır.
        </p>
        <p className={pCls}>
          Sitemizde çerez tabanlı reklam takibi yapılmaz ve üçüncü taraflara veri
          satılmaz. WhatsApp veya Instagram üzerinden ilettiğiniz bilgiler, ilgili
          platformların kendi gizlilik politikalarına tabidir.
        </p>
        <p className={pCls}>
          Üye olarak bir ürüne yorum yazarsanız, adınız kısmen maskelenmiş
          olarak (ör. &ldquo;Ayşe K.&rdquo;) yorumunuzla birlikte sitede
          yayınlanır; yorumlar yayınlanmadan önce tarafımızca onaylanır. Ayrıca
          site trafiğini ölçmek için anonim, kişiyle ilişkilendirilmeyen bir
          ziyaretçi sayacı tutulur (bkz. Çerez Politikası).
        </p>
      </section>

      <section className={sectionCls}>
        <h2 className={hCls}>3. İşleme Amaçları ve Hukuki Sebep</h2>
        <p className={pCls}>
          Verileriniz; üyelik hesabınızın oluşturulması, favori listenizin
          cihazlarınız arasında eşitlenmesi ve talepleriniz halinde size dönüş
          yapılması amaçlarıyla, KVKK m.5/2(c) &ldquo;sözleşmenin kurulması ve
          ifası&rdquo; hukuki sebebine dayanılarak işlenir.
        </p>
      </section>

      <section className={sectionCls}>
        <h2 className={hCls}>4. Verilerin Aktarımı ve Saklanması</h2>
        <p className={pCls}>
          Veriler, altyapı hizmeti aldığımız Google Firebase (Google LLC)
          sunucularında saklanır. Bu kapsamda veriler yurt dışına aktarılabilir;
          Google, endüstri standardı güvenlik sertifikalarına sahiptir. Hesabınızı
          sildiğinizde verileriniz makul süre içinde kalıcı olarak silinir.
        </p>
      </section>

      <section className={sectionCls}>
        <h2 className={hCls}>5. Çerezler</h2>
        <p className={pCls}>
          Sitede kullanılan çerez ve benzer teknolojilerin (oturum deposu,
          cihaz içi veritabanı vb.) tam listesi, amacı ve saklama süresi için{" "}
          <a href="/cerez-politikasi" className="underline underline-offset-2 text-rosegold-dark">
            Çerez Politikası
          </a>{" "}
          sayfamızı inceleyebilirsiniz.
        </p>
      </section>

      <section className={sectionCls}>
        <h2 className={hCls}>6. KVKK Kapsamındaki Haklarınız</h2>
        <p className={pCls}>
          KVKK m.11 uyarınca; verilerinizin işlenip işlenmediğini öğrenme,
          düzeltilmesini veya silinmesini isteme, işlemeye itiraz etme ve zarara
          uğramanız hâlinde tazmin talep etme haklarına sahipsiniz. Talepleriniz
          için {SITE.email} adresine e-posta gönderebilirsiniz; başvurunuz en geç
          30 gün içinde ücretsiz olarak sonuçlandırılır.
        </p>
      </section>
    </div>
  );
}
