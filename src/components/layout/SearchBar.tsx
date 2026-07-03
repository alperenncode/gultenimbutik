"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

/** Tam ekran üstten açılan arama paneli — Enter ile /urunler?ara= sayfasına gider. */
export function SearchBar({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/urunler?ara=${encodeURIComponent(q)}`);
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-bordeaux/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: 0 }}
        exit={{ y: "-100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="bg-cream shadow-lifted"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto max-w-3xl px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <p className="section-subtitle">Arama</p>
            <button
              onClick={onClose}
              className="p-2 text-bordeaux/60 hover:text-bordeaux transition-colors"
              aria-label="Aramayı kapat"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={submit} className="relative">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Elbise, takım, tunik…"
              className="w-full border-b-2 border-rosegold/40 bg-transparent pb-3 pr-10
                font-display text-2xl md:text-3xl text-bordeaux placeholder:text-bordeaux/30
                focus:border-rosegold-dark focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-0 bottom-3 text-rosegold-dark hover:text-bordeaux transition-colors"
              aria-label="Ara"
            >
              <Search size={24} strokeWidth={1.5} />
            </button>
          </form>
          <p className="mt-4 text-xs text-bordeaux/50 tracking-wide">
            Aramak için Enter&apos;a basın · Kapatmak için Esc
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
