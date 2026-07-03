"use client";

import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-8 font-display text-2xl text-bordeaux">Yeni Ürün</h1>
      <ProductForm />
    </div>
  );
}
