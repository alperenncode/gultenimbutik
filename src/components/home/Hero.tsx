"use client";

/**
 * Hero — tam genişlik, zarif tipografi ve katmanlı giriş animasyonları.
 * Sağ tarafta ürün fotoğrafı yerine marka logosu; yumuşak bir madalyon
 * içinde hafifçe süzülerek (float) sergilenir.
 */
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { hexToRgba } from "@/lib/color";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: [0.21, 0.65, 0.36, 1] as const },
  }),
};

export function Hero() {
  const settings = useSiteSettings();
  const theme = settings.theme;
  return (
    <section className="relative overflow-hidden bg-cream">
      {/* Dekoratif zemin halkaları */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px]
        rounded-full border border-rosegold/20" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-[480px] w-[480px]
        rounded-full border border-rosegold/10" />
      <div className="pointer-events-none absolute -left-52 bottom-0 h-[400px] w-[400px]
        rounded-full bg-rosegold/5" />

      {/* İnce dantel/tül hissi veren nokta dokusu — çok düşük opaklıkta, tüm bölüme yayılır */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(212,175,136,0.5) 1px, transparent 1.6px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Yavaşça nefes alan altın ışık */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[560px] w-[560px]
          -translate-x-1/2 -translate-y-1/2 rounded-full bg-rosegold/10 blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.45, 0.75, 0.45] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid min-h-[56vh] grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2 lg:py-0">
          {/* Metin */}
          <div className="relative z-10 text-center lg:text-left">
            <motion.p
              custom={0.1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              style={{ color: theme.accentColorDark }}
              className="text-xs uppercase tracking-luxe font-medium"
            >
              Yeni Sezon Koleksiyonu
            </motion.p>

            <motion.h1
              custom={0.25}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              style={{ color: theme.headingColor }}
              className="mt-5 font-display text-4xl leading-[1.15]
                sm:text-5xl lg:text-6xl xl:text-[4.2rem]"
            >
              Zarafet,
              <br />
              <span className="italic" style={{ color: theme.accentColorDark }}>her detayda</span>
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
                href={buildGeneralWhatsAppLink(settings.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                <MessageCircle size={16} />
                WhatsApp&apos;tan Sor
              </a>
            </motion.div>
          </div>

          {/* Logo madalyonu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.21, 0.65, 0.36, 1] }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div
              style={{
                background: `linear-gradient(135deg, ${hexToRgba(theme.heroMedallionGradientStart, 0.4)}, ${hexToRgba(theme.heroMedallionGradientMid, 0.5)}, ${hexToRgba(theme.heroMedallionGradientEnd, 0.25)})`,
              }}
              className="relative flex aspect-square w-full max-w-md items-center
              justify-center rounded-full"
            >
              {/* Yavaşça dönen ince halka */}
              <motion.div
                aria-hidden="true"
                style={{ borderColor: hexToRgba(theme.heroMedallionRingColor, 0.3) }}
                className="absolute inset-6 rounded-full border"
                animate={{ rotate: 360 }}
                transition={{ duration: 44, repeat: Infinity, ease: "linear" }}
              />
              <div
                aria-hidden="true"
                style={{ borderColor: hexToRgba(theme.heroMedallionRingColor, 0.2) }}
                className="absolute inset-14 rounded-full border border-dashed"
              />

              {/* Logo — hafifçe yukarı aşağı süzülür */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 w-[76%]"
              >
                <Image
                  src="/logo-plaka.png"
                  alt="Gültenim Boutique"
                  width={1200}
                  height={302}
                  priority
                  className="h-auto w-full drop-shadow-[0_20px_45px_rgba(44,26,26,0.18)]"
                />
              </motion.div>

              {/* Zarif parıltı noktaları */}
              <motion.span
                aria-hidden="true"
                style={{ backgroundColor: theme.accentColor }}
                className="absolute right-10 top-12 h-2 w-2 rounded-full"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 2.4, repeat: Infinity }}
              />
              <motion.span
                aria-hidden="true"
                style={{ backgroundColor: theme.accentColorDark }}
                className="absolute left-12 bottom-16 h-1.5 w-1.5 rounded-full"
                animate={{ opacity: [0.15, 0.9, 0.15] }}
                transition={{ duration: 3.1, repeat: Infinity, delay: 0.6 }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
