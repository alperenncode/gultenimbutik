import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: `${SITE.name} — Erzurum'dan Türkiye'nin her yerine premium tesettür giyim. Selvi Çetin ve İnvee koleksiyonları.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <Reveal className="text-center">
        <p className="section-subtitle">Hikayemiz</p>
        <h1 className="section-title mt-3">Gültenim Butik</h1>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="mt-12 space-y-6 text-[15px] leading-relaxed text-bordeaux/70">
          <p>
            Gültenim Butik, tesettür giyimde zarafeti ve kaliteyi bir araya
            getirme hayaliyle Erzurum&apos;da doğdu. Bugün{" "}
            <strong className="text-bordeaux">Selvi Çetin</strong> ve{" "}
            <strong className="text-bordeaux">İnvee</strong> koleksiyonlarıyla
            Türkiye&apos;nin dört bir yanındaki müşterilerimize ulaşıyoruz.
          </p>
          <p>
            Her parçayı tek tek, özenle seçiyoruz. Vitrinimizde gördüğünüz her
            elbise, takım ve dış giyim modeli; kumaşı, dikişi ve duruşuyla
            titizlikle incelenmiş, &ldquo;kendimiz giyer miydik?&rdquo; sorusunu
            geçmiş üründür.
          </p>
          <p>
            Alışveriş deneyimimiz de kendimize has: sepet yok, karmaşık ödeme
            adımları yok. Beğendiğiniz ürünü WhatsApp&apos;tan tek mesajla
            sorarsınız; rengi, bedeni, kombin önerisiyle birlikte size özel
            ilgileniriz. Çünkü bize göre alışveriş bir işlem değil, bir sohbettir.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.25} className="mt-14 border-t border-rosegold/20 pt-10 text-center">
        <p className="font-display text-xl italic text-rosegold-dark">
          &ldquo;Zarafet, detaylarda gizlidir.&rdquo;
        </p>
        <Link href="/urunler" className="btn-primary mt-8 inline-flex">
          Koleksiyonu Keşfet
        </Link>
      </Reveal>
    </div>
  );
}
