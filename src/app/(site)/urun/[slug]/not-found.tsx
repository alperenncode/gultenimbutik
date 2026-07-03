import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center
      px-6 py-24 text-center">
      <p className="section-subtitle">Üzgünüz</p>
      <h1 className="section-title mt-3">Bu ürün artık mevcut değil</h1>
      <p className="mt-4 text-sm leading-relaxed text-bordeaux/60">
        Aradığınız ürün satılmış veya vitrinden kaldırılmış olabilir.
        Koleksiyonumuzdaki diğer zarif parçalara göz atın.
      </p>
      <Link href="/urunler" className="btn-primary mt-8">
        Koleksiyonu Keşfet
      </Link>
    </div>
  );
}
