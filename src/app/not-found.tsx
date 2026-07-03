import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <p className="text-xs uppercase tracking-luxe text-rosegold-dark font-medium">404</p>
      <h1 className="mt-3 font-display text-4xl text-bordeaux md:text-5xl">
        Sayfa Bulunamadı
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-bordeaux/60">
        Aradığınız sayfa taşınmış veya kaldırılmış olabilir. Koleksiyonumuza
        göz atmak için ana sayfaya dönebilirsiniz.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center bg-bordeaux px-8 py-3.5
          text-sm uppercase tracking-widest text-cream transition-colors hover:bg-rosegold-dark"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
