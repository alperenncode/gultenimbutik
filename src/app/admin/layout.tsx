"use client";

/**
 * Admin paneli layout'u — vitrin layout'undan tamamen bağımsızdır.
 * Masaüstü: sabit kenar çubuğu. Mobil: üst bar + hamburger ile açılan çekmece.
 * AdminGuard: giriş yapmamış veya admin olmayan herkesi /admin/login'e yollar.
 * Gerçek güvenlik Firestore/Storage kurallarındadır; bu guard yalnızca arayüz katmanıdır.
 */
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  MessageSquareQuote,
  Images,
  Settings,
  KeyRound,
  LogOut,
  Loader2,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { Providers } from "@/context/Providers";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/urunler", label: "Ürünler", icon: Package },
  { href: "/admin/kategoriler", label: "Kategoriler", icon: FolderTree },
  { href: "/admin/lookbook", label: "Lookbook", icon: Images },
  { href: "/admin/yorumlar", label: "Yorumlar", icon: MessageSquareQuote },
  { href: "/admin/ayarlar", label: "Site Ayarları", icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOutUser } = useAuth();

  return (
    <div className="flex h-full flex-col bg-bordeaux text-cream">
      <div className="px-6 py-6 border-b border-cream/10">
        <p className="font-display text-xl">Gültenim</p>
        <p className="text-[10px] uppercase tracking-luxe text-rosegold mt-0.5">
          Yönetim Paneli
        </p>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-cream/10 text-rosegold"
                  : "text-cream/65 hover:bg-cream/5 hover:text-cream"
              }`}
            >
              <item.icon size={17} strokeWidth={1.6} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-5 space-y-1 border-t border-cream/10 pt-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-cream/65
            hover:text-cream transition-colors"
        >
          <ExternalLink size={17} strokeWidth={1.6} /> Siteyi Gör
        </Link>
        <Link
          href="/hesabim?sekme=profil"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-cream/65
            hover:text-cream transition-colors"
        >
          <KeyRound size={17} strokeWidth={1.6} /> Şifre / E-posta Değiştir
        </Link>
        <button
          onClick={async () => {
            await signOutUser();
            router.push("/admin/login");
          }}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-cream/65
            hover:text-cream transition-colors"
        >
          <LogOut size={17} strokeWidth={1.6} /> Çıkış Yap
        </button>
      </div>
    </div>
  );
}

function AdminShell({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";
  const denied = !loading && (!user || !isAdmin);

  // Yönlendirme render sırasında değil, effect içinde yapılır (titreme önlenir)
  useEffect(() => {
    if (!isLoginPage && denied) router.replace("/admin/login");
  }, [isLoginPage, denied, router]);

  // Sayfa değişince mobil çekmeceyi kapat
  useEffect(() => setDrawerOpen(false), [pathname]);

  // Login sayfası guard'sız gösterilir
  if (isLoginPage) return <>{children}</>;

  if (loading || denied) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <Loader2 size={30} className="animate-spin text-rosegold-dark" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Mobil üst bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-bordeaux
        px-4 py-3 text-cream lg:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 -ml-2"
          aria-label="Menüyü aç"
        >
          <Menu size={22} />
        </button>
        <p className="font-display text-lg">
          Gültenim <span className="text-[10px] uppercase tracking-luxe text-rosegold">Panel</span>
        </p>
        <span className="w-8" />
      </header>

      {/* Mobil çekmece */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-bordeaux/50 backdrop-blur-sm lg:hidden"
            onClick={() => setDrawerOpen(false)}
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative h-full w-[80%] max-w-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarContent onNavigate={() => setDrawerOpen(false)} />
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute right-3 top-5 p-2 text-cream/70"
                aria-label="Menüyü kapat"
              >
                <X size={20} />
              </button>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Masaüstü kenar çubuğu */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 lg:block">
        <SidebarContent />
      </aside>

      {/* İçerik */}
      <main className="p-4 sm:p-6 lg:ml-56 lg:p-8">{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <AdminShell>{children}</AdminShell>
    </Providers>
  );
}
