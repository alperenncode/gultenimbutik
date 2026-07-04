"use client";

/**
 * Ziyaretçi sayacı — sayfa ilk açıldığında Firestore'daki stats/visits
 * dokümanını 1 artırır. Aynı tarayıcı oturumunda tekrar saymaz
 * (sessionStorage). Sayaç artmazsa site etkilenmez (sessizce geçilir).
 */
import { useEffect } from "react";
import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase-client";

const SESSION_KEY = "gb-visit-counted";

export function VisitTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      return; // gizli modda depolama kapalıysa sayma
    }

    // Yerel tarihe göre YYYY-AA-GG (günlük kırılım için)
    const today = new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    setDoc(
      doc(db, "stats", "visits"),
      { total: increment(1), days: { [today]: increment(1) } },
      { merge: true }
    )
      .then(() => {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          /* önemsiz */
        }
      })
      .catch(() => {
        /* sayaç kritik değil — hata sessizce yutulur */
      });
  }, []);

  return null;
}
