"use client";

/**
 * Yardım balonu — admin arayüzünde başlıkların/alanların yanındaki
 * küçük "?" butonu. Tıklanınca detaylı, öğretici bir açıklama penceresi açılır.
 * İçerik ReactNode olduğundan paragraf, liste ve vurgular kullanılabilir.
 */
import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, HelpCircle } from "lucide-react";

export function HelpTip({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Yardım: ${title}`}
        title="Nasıl kullanılır?"
        className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center
          rounded-full border border-rosegold-dark/60 align-middle text-[11px] font-semibold
          text-rosegold-dark transition-colors hover:bg-rosegold-dark hover:text-white"
      >
        ?
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-bordeaux/50
              backdrop-blur-sm p-4 sm:items-center"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 16 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              className="max-h-[85vh] w-full max-w-lg overflow-y-auto bg-cream p-6 shadow-lifted sm:p-7"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`Yardım: ${title}`}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <h3 className="flex items-center gap-2 font-display text-lg text-bordeaux">
                  <HelpCircle size={18} className="shrink-0 text-rosegold-dark" />
                  {title}
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 text-bordeaux/60 transition-colors hover:text-bordeaux"
                  aria-label="Yardımı kapat"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-sm leading-relaxed text-bordeaux/75
                [&_strong]:text-bordeaux [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5
                [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5">
                {children}
              </div>

              <button onClick={() => setOpen(false)} className="btn-outline mt-6 w-full !py-2.5 text-xs">
                Anladım
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
