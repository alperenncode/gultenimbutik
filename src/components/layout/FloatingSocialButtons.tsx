"use client";

/**
 * Sabit WhatsApp + Instagram butonları — her sayfada sağ altta görünür.
 * WhatsApp'ta dikkat çeken nabız halkası animasyonu, girişte yaylı (spring)
 * sahne alma, hover'da isim etiketi vardır. iOS güvenli alanı gözetilir.
 */
import { motion } from "framer-motion";
import { Instagram, MessageCircle } from "lucide-react";
import { SITE } from "@/lib/site";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";

const entrance = {
  hidden: { opacity: 0, scale: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 14, stiffness: 200, delay },
  }),
};

export function FloatingSocialButtons() {
  return (
    <div className="fixed bottom-5 right-4 sm:bottom-7 sm:right-6 z-50 mb-safe flex flex-col items-end gap-3">
      {/* Instagram */}
      <motion.a
        custom={1.2}
        variants={entrance}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        href={SITE.instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram'da bizi takip edin"
        className="group flex items-center gap-2"
      >
        <span
          className="pointer-events-none max-w-0 overflow-hidden whitespace-nowrap text-xs
            font-medium text-bordeaux opacity-0 transition-all duration-300
            group-hover:max-w-[140px] group-hover:opacity-100 group-hover:mr-1
            bg-cream/95 px-0 group-hover:px-3 py-2 rounded-full shadow-soft"
        >
          @{SITE.instagramHandle}
        </span>
        <span
          className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full
            bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white shadow-card"
        >
          <Instagram size={22} strokeWidth={1.8} />
        </span>
      </motion.a>

      {/* WhatsApp — nabız halkasıyla */}
      <motion.a
        custom={0.9}
        variants={entrance}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        href={buildGeneralWhatsAppLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp'tan yazın"
        className="group flex items-center gap-2"
      >
        <span
          className="pointer-events-none max-w-0 overflow-hidden whitespace-nowrap text-xs
            font-medium text-bordeaux opacity-0 transition-all duration-300
            group-hover:max-w-[160px] group-hover:opacity-100 group-hover:mr-1
            bg-cream/95 px-0 group-hover:px-3 py-2 rounded-full shadow-soft"
        >
          Sipariş / Bilgi
        </span>
        <span className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center">
          {/* Nabız halkası */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse-ring" />
          <span
            className="relative flex h-full w-full items-center justify-center rounded-full
              bg-[#25D366] text-white shadow-card"
          >
            <MessageCircle size={24} strokeWidth={1.8} />
          </span>
        </span>
      </motion.a>
    </div>
  );
}
