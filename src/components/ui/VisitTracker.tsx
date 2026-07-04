"use client";

/**
 * Ziyaretçi takibi — iki görev:
 *  1) Sayaç: sayfa ilk açıldığında stats/visits dokümanını 1 artırır
 *     (oturum başına bir kez; sessionStorage ile korunur).
 *  2) Anlık varlık (presence): sekme açıkken dakikada bir presence/{oturum}
 *     dokümanına "buradayım" sinyali yazar — admin panelindeki
 *     "şu an sitede" sayısı buradan hesaplanır.
 * Her iki yazma da kritik değildir; hata sessizce yutulur.
 */
import { useEffect } from "react";
import { doc, setDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase-client";

const SESSION_KEY = "gb-visit-counted";
const SID_KEY = "gb-session-id";
const HEARTBEAT_MS = 60_000;

/** Oturum kimliği — sekme kapatılana kadar sabit kalır */
function getSessionId(): string | null {
  try {
    let sid = sessionStorage.getItem(SID_KEY);
    if (!sid) {
      sid =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    return null; // gizli modda depolama kapalıysa takip yapılmaz
  }
}

export function VisitTracker() {
  // 1) Ziyaret sayacı — oturum başına bir kez
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      return;
    }

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
      .catch(() => {});
  }, []);

  // 2) Anlık varlık sinyali — sekme görünürken dakikada bir
  useEffect(() => {
    const sid = getSessionId();
    if (!sid) return;

    const beat = () => {
      setDoc(doc(db, "presence", sid), { lastSeen: serverTimestamp() }).catch(() => {});
    };

    beat();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") beat();
    }, HEARTBEAT_MS);

    // Sekmeye geri dönülünce hemen sinyal ver
    const onVisible = () => {
      if (document.visibilityState === "visible") beat();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
