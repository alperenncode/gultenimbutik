"use client";

/** Service worker kaydı — PWA'nın telefona eklenebilmesi için. */
import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("Service worker kaydedilemedi:", err));
    }
  }, []);
  return null;
}
