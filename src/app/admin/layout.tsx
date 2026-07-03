"use client";

/**
 * Admin paneli layout'u — vitrin layout'undan tamamen bağımsızdır.
 * AdminGuard: giriş yapmamış veya admin olmayan herkesi /admin/login'e yollar.
 * Gerçek güvenlik Firestore/Storage kurallarındadır; bu guard yalnızca arayüz katmanıdır.
 */
import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  MessageSquareQuote,
  Images,
  LogOut,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Providers } from "@/context/Providers";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/urunler", label: "Ürünler", icon: Package },
  { href: "/admin/kategoriler", label: "Kategoriler", icon: FolderTree },
  { href: "/admin/lookbook", label: "Lookbook", icon: Images },
  { href: "/admin/yorumlar", label: "Yorumlar", icon: MessageSquareQuote },
];

function AdminShell({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading, signOutUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const denied = !loading && (!user || !isAdmin);

  // Yönlendirme render sırasında değil, effect içinde yapılır (titreme önlenir)
  useEffect(() => {
    if (!isLoginPage && denied) router.replace("/admin/login");
  }, [isLoginPage, denied, router]);

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
    <div className="flex min-h-screen bg-cream">
      {/* Kenar çubuğu */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-56 flex-col bg-bordeaux text-cream">
        <div className="px-6 py-6 border-b border-cream/10">
          <p className="font-display text-xl">Gültenim</p>
          <p className="text-[10px] uppercase tracking-luxe text-rosegold mt-0.5">
            Yönetim Paneli
          </p>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
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
      </aside>

      {/* İçerik */}
      <main className="ml-56 flex-1 p-8">{children}</main>
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
