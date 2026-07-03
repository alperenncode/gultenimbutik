"use client";

/** Beden tablosu — modal olarak açılır. Standart tesettür giyim ölçüleri. */
import { motion, AnimatePresence } from "framer-motion";
import { X, Ruler } from "lucide-react";
import { useState } from "react";

const ROWS = [
  ["36 / S", "84-88", "66-70", "90-94"],
  ["38 / M", "88-92", "70-74", "94-98"],
  ["40 / L", "92-96", "74-78", "98-102"],
  ["42 / XL", "96-102", "78-84", "102-108"],
  ["44 / XXL", "102-108", "84-90", "108-114"],
  ["46 / 3XL", "108-114", "90-98", "114-120"],
];

export function SizeChart() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-rosegold-dark underline
          underline-offset-4 transition-colors hover:text-bordeaux"
      >
        <Ruler size={14} /> Beden Tablosu
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-bordeaux/50
              backdrop-blur-sm p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 16 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              className="w-full max-w-lg bg-cream p-7 shadow-lifted"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-xl text-bordeaux">Beden Tablosu</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 text-bordeaux/60 hover:text-bordeaux transition-colors"
                  aria-label="Kapat"
                >
                  <X size={18} />
                </button>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-rosegold/30 text-left text-xs uppercase
                    tracking-wider text-bordeaux/60">
                    <th className="pb-3 pr-2">Beden</th>
                    <th className="pb-3 pr-2">Göğüs (cm)</th>
                    <th className="pb-3 pr-2">Bel (cm)</th>
                    <th className="pb-3">Kalça (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map(([size, chest, waist, hip]) => (
                    <tr key={size} className="border-b border-rosegold/10">
                      <td className="py-2.5 pr-2 font-medium text-bordeaux">{size}</td>
                      <td className="py-2.5 pr-2 text-bordeaux/70">{chest}</td>
                      <td className="py-2.5 pr-2 text-bordeaux/70">{waist}</td>
                      <td className="py-2.5 text-bordeaux/70">{hip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="mt-4 text-xs leading-relaxed text-bordeaux/50">
                Ölçüler yaklaşıktır; modele göre küçük farklılıklar olabilir. Emin
                olamadığınız durumda WhatsApp&apos;tan bize yazın, birlikte doğru
                bedeni bulalım.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
