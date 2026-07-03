"use client";

/** Ürün listesi — düzenle/sil/aktiflik durumu. */
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/site";
import type { Product } from "@/types";
import { fetchAllProductsAdmin, deleteProduct, updateProduct } from "@/lib/firestore/products";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    fetchAllProductsAdmin().then(setProducts).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function toggleActive(p: Product) {
    setBusyId(p.id);
    try {
      await updateProduct(p.id, { isActive: !p.isActive });
      setProducts((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, isActive: !p.isActive } : x))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setBusyId("");
    }
  }

  async function onDelete(p: Product) {
    if (!confirm(`"${p.name}" kalıcı olarak silinsin mi?\n\nİpucu: Silmek yerine "Pasif" yapabilirsiniz.`))
      return;
    setBusyId(p.id);
    try {
      await deleteProduct(p.id);
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    } catch (err) {
      console.error(err);
    } finally {
      setBusyId("");
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-bordeaux">Ürünler</h1>
          <p className="mt-1 text-sm text-bordeaux/50">{products.length} ürün</p>
        </div>
        <Link href="/admin/urunler/yeni" className="btn-primary !py-2.5 text-xs">
          <Plus size={15} /> Yeni Ürün
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 size={28} className="animate-spin text-rosegold-dark" />
        </div>
      ) : products.length === 0 ? (
        <div className="border border-bordeaux/10 bg-white py-20 text-center">
          <p className="text-sm text-bordeaux/50">
            Henüz ürün yok. İlk ürününüzü ekleyin veya seed script&apos;ini çalıştırın.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-bordeaux/10 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bordeaux/10 text-left text-xs uppercase
                tracking-wider text-bordeaux/50">
                <th className="px-4 py-3.5">Ürün</th>
                <th className="px-4 py-3.5">Kategori</th>
                <th className="px-4 py-3.5">Marka</th>
                <th className="px-4 py-3.5">Fiyat</th>
                <th className="px-4 py-3.5">Durum</th>
                <th className="px-4 py-3.5 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-bordeaux/5 hover:bg-cream/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-10 shrink-0 overflow-hidden bg-cream-dark">
                        {p.images[0] && (
                          <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-bordeaux line-clamp-1">{p.name}</p>
                        <p className="text-xs text-bordeaux/40">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-bordeaux/60">{p.categorySlug}</td>
                  <td className="px-4 py-3 text-bordeaux/60">{p.brand}</td>
                  <td className="px-4 py-3 text-bordeaux">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(p)}
                      disabled={busyId === p.id}
                      className={`px-2.5 py-1 text-[11px] uppercase tracking-wider transition-colors ${
                        p.isActive
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {p.isActive ? "Aktif" : "Pasif"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/admin/urunler/${p.id}/duzenle`}
                        className="p-2 text-bordeaux/50 hover:text-rosegold-dark transition-colors"
                        aria-label="Düzenle"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => onDelete(p)}
                        disabled={busyId === p.id}
                        className="p-2 text-bordeaux/50 hover:text-red-600 transition-colors"
                        aria-label="Sil"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
