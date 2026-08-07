"use client";

/**
 * Sitenin ilk açılışında (bir kez) görünen yasal bilgilendirme çubuğu.
 * Sabit/kaplayan bir pencere DEĞİL — sayfanın en üstünde ince bir şerit,
 * sağ alttaki WhatsApp/Instagram butonlarıyla çakışmaz. "Kabul Ediyorum"a
 * basılınca localStorage'a yazılır ve bir daha çıkmaz.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const STORAGE_KEY = "gb-legal-consent";

export function LegalConsentBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      /* localStorage kapalıysa çubuk hiç gösterilmez, sorun değil */
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* önemsiz */
    }
  }

  if (!visible) return null;

  return (
    <div className="relative z-30 border-b border-rosegold/20 bg-cream-dark px-4 py-3 text-center text-[11px]
      leading-relaxed text-bordeaux/70 sm:text-xs">
      <div className="mx-auto max-w-4xl pr-6">
        Bu siteyi kullanarak{" "}
        <Link href="/kullanim-kosullari" className="underline underline-offset-2 hover:text-bordeaux">
          Mesafeli Satış Bilgilendirmesi ve Kullanım Koşulları
        </Link>
        ,{" "}
        <Link href="/gizlilik-politikasi" className="underline underline-offset-2 hover:text-bordeaux">
          KVKK Aydınlatma Metni
        </Link>
        {" "}ve{" "}
        <Link href="/cerez-politikasi" className="underline underline-offset-2 hover:text-bordeaux">
          Çerez Politikası
        </Link>
        &apos;nı okuduğunuzu ve kabul ettiğinizi onaylamış olursunuz.
        <button
          type="button"
          onClick={dismiss}
          className="ml-2.5 inline-block whitespace-nowrap underline underline-offset-2 font-medium text-rosegold-dark hover:text-bordeaux"
        >
          Anladım, Kabul Ediyorum
        </button>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Kapat"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-bordeaux/40 hover:text-bordeaux"
      >
        <X size={14} />
      </button>
    </div>
  );
}
