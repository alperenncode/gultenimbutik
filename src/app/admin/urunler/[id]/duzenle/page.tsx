"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Product } from "@/types";
import { fetchProductById } from "@/lib/firestore/products";
import { ProductForm } from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchProductById(id)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 size={28} className="animate-spin text-rosegold-dark" />
      </div>
    );
  }

  if (!product) {
    return <p className="text-sm text-bordeaux/50">Ürün bulunamadı.</p>;
  }

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl text-bordeaux">Ürünü Düzenle</h1>
      <ProductForm product={product} />
    </div>
  );
}
