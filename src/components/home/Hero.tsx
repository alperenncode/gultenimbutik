"use client";

/**
 * Hero — tam genişlik, zarif tipografi ve katmanlı giriş animasyonları.
 * Görsel varsa sağda sergilenir; yoksa dekoratif zemin tek başına da şık durur.
 */
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: [0.21, 0.65, 0.36, 1] as const },
  }),
};

export function Hero({ imageUrl }: { imageUrl?: string }) {
  return (
    <section className="relative overflow-hidden bg-cream">
      {/* Dekoratif zemin halkaları */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px]
        rounded-full border border-rosegold/20" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-[480px] w-[480px]
        rounded-full border border-rosegold/10" />
      <div className="pointer-events-none absolute -left-52 bottom-0 h-[400px] w-[400px]
        rounded-full bg-rosegold/5" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid min-h-[78vh] items-center gap-12 py-16 lg:grid-cols-2 lg:py-0">
          {/* Metin */}
          <div className="relative z-10 text-center lg:text-left">
            <motion.p
              custom={0.1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="section-subtitle"
            >
              Yeni Sezon Koleksiyonu
            </motion.p>

            <motion.h1
              custom={0.25}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-5 font-display text-4xl leading-[1.15] text-bordeaux
                sm:text-5xl lg:text-6xl xl:text-[4.2rem]"
            >
              Zarafet,
              <br />
              <span className="italic text-rosegold-dark">her detayda</span>
              <br />
              sizinle.
            </motion.h1>

            <motion.p
              custom={0.4}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-bordeaux/60 lg:mx-0"
            >
              Selvi Çetin ve İnvee koleksiyonlarından özenle seçilmiş elbise,
              takım ve dış giyim modelleri. Beğendiğiniz ürünü WhatsApp&apos;tan
              tek mesajla sipariş edin.
            </motion.p>

            <motion.div
              custom={0.55}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-9 flex flex-col items-center gap-4 sm:flex-row lg:justify-start justify-center"
            >
              <Link href="/urunler" className="btn-primary group">
                Koleksiyonu Keşfet
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href={buildGeneralWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                <MessageCircle size={16} />
                WhatsApp&apos;tan Sor
              </a>
            </motion.div>
          </div>

          {/* Görsel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.21, 0.65, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative mx-auto aspect-[3/4] max-w-md overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Gültenim Butik yeni sezon"
                  fill
                  priority
                  quality={90}
                  sizes="(max-width: 1024px) 0px, 448px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br
                  from-cream-dark via-rosegold-light/40 to-rosegold/30">
                  <span className="font-display text-[10rem] italic text-bordeaux/10">G</span>
                </div>
              )}
              {/* Çerçeve detayı */}
              <div className="pointer-events-none absolute inset-4 border border-cream/60" />
            </div>
            {/* Arka plan aksan bloğu */}
            <div className="absolute -bottom-6 -right-2 -z-10 h-2/3 w-2/3 bg-rosegold/15" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
