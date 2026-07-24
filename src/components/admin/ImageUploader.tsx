"use client";

/**
 * Çoklu görsel yükleyici — admin formlarında kullanılır.
 * - Sürükle-bırak veya dosya seçimiyle yükleme, dosya başına ilerleme çubuğu
 * - Ok butonlarıyla sıralama (ilk görsel = vitrindeki kart görseli)
 * - Silme: Storage'dan da kaldırılır
 * - Kısmi hata yönetimi: başarısız dosya listede hata olarak görünür, kalanlar eklenir
 */
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, X, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { uploadImage, deleteImageByUrl } from "@/lib/storage";

/** Küçük resme tıklanınca açılan tam ekran büyütme penceresi */
function ImageLightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate(index > 0 ? index - 1 : images.length - 1);
      if (e.key === "ArrowRight") onNavigate(index < images.length - 1 ? index + 1 : 0);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, images.length, onClose, onNavigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-bordeaux/90 p-4 sm:p-10"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Görseli büyüt"
    >
      <motion.div
        initial={{ scale: 0.94 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        className="relative h-full w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[index]}
          alt={`Görsel ${index + 1}`}
          fill
          sizes="90vw"
          className="object-contain"
          priority
        />
      </motion.div>

      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 p-2 text-cream/80 transition-colors hover:text-cream"
        aria-label="Kapat"
      >
        <X size={26} />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(index > 0 ? index - 1 : images.length - 1);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-cream/80 transition-colors hover:text-cream sm:left-4"
            aria-label="Önceki görsel"
          >
            <ChevronLeft size={30} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(index < images.length - 1 ? index + 1 : 0);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cream/80 transition-colors hover:text-cream sm:right-4"
            aria-label="Sonraki görsel"
          >
            <ChevronRight size={30} />
          </button>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs tracking-wider text-cream/70">
            {index + 1} / {images.length}
          </span>
        </>
      )}
    </motion.div>
  );
}

interface UploadingFile {
  id: string;
  name: string;
  percent: number;
  error?: string;
}

export function ImageUploader({
  images,
  onChange,
  folder,
  max = 10,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  folder: string;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  async function handleFiles(files: FileList | File[]) {
    const list = [...files]
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, max - images.length);

    // Her dosya bağımsız yüklenir; biri başarısız olsa diğerleri etkilenmez
    await Promise.all(
      list.map(async (file) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setUploading((prev) => [...prev, { id, name: file.name, percent: 0 }]);
        try {
          const url = await uploadImage(file, folder, (percent) =>
            setUploading((prev) =>
              prev.map((u) => (u.id === id ? { ...u, percent } : u))
            )
          );
          setUploading((prev) => prev.filter((u) => u.id !== id));
          onChange([...imagesRef.current, url]);
        } catch (err) {
          // Sunucudan gelen gerçek hata mesajını göster (JSON gövdesi varsa ayıkla)
          let message = err instanceof Error ? err.message : "Yüklenemedi";
          const jsonMatch = message.match(/\{"error":"([^"]+)"\}/);
          if (jsonMatch) message = jsonMatch[1];
          setUploading((prev) =>
            prev.map((u) => (u.id === id ? { ...u, error: message } : u))
          );
        }
      })
    );
  }

  // onChange closure'ının eski images ile çalışmaması için güncel referans tutulur
  const imagesRef = useRef(images);
  imagesRef.current = images;

  function move(index: number, dir: -1 | 1) {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  async function remove(index: number) {
    const url = images[index];
    onChange(images.filter((_, i) => i !== index));
    // Storage temizliği arka planda — hata olsa bile form akışı bozulmaz
    deleteImageByUrl(url).catch(() => {});
  }

  return (
    <div>
      {/* Bırakma alanı */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex w-full flex-col items-center justify-center gap-2 border-2 border-dashed
          px-6 py-9 text-sm transition-colors ${
            dragOver
              ? "border-rosegold-dark bg-rosegold/10 text-rosegold-dark"
              : "border-bordeaux/20 text-bordeaux/50 hover:border-rosegold hover:text-bordeaux"
          }`}
      >
        <UploadCloud size={26} strokeWidth={1.4} />
        <span>Görselleri sürükleyin veya tıklayıp seçin</span>
        <span className="font-medium text-rosegold-dark">
          Kabul edilen formatlar: JPG · PNG · WebP · GIF
        </span>
        <span className="text-xs text-bordeaux/40">
          En fazla {max} görsel · dosya başına en çok 10 MB
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Yüklenmekte olanlar */}
      <AnimatePresence>
        {uploading.map((u) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3"
          >
            <div className="flex items-center justify-between text-xs text-bordeaux/60">
              <span className="truncate">{u.name}</span>
              {u.error ? (
                <span className="flex items-center gap-1 text-red-600">
                  <AlertCircle size={12} /> {u.error}
                  <button
                    type="button"
                    onClick={() =>
                      setUploading((prev) => prev.filter((x) => x.id !== u.id))
                    }
                    className="ml-1 underline"
                  >
                    kapat
                  </button>
                </span>
              ) : (
                <span>%{u.percent}</span>
              )}
            </div>
            {!u.error && (
              <div className="mt-1 h-1 bg-cream-dark">
                <div
                  className="h-full bg-rosegold-dark transition-all duration-200"
                  style={{ width: `${u.percent}%` }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Yüklü görseller — sıralanabilir */}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {images.map((url, i) => (
            <div
              key={url}
              onClick={() => setPreviewIndex(i)}
              className="group relative aspect-[3/4] cursor-zoom-in overflow-hidden bg-cream-dark"
            >
              <Image src={url} alt={`Görsel ${i + 1}`} fill sizes="120px" className="object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 bg-bordeaux px-1.5 py-0.5 text-[9px]
                  uppercase tracking-wider text-cream">
                  Kapak
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between
                bg-bordeaux/70 px-1 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    move(i, -1);
                  }}
                  disabled={i === 0}
                  className="p-1 text-cream disabled:opacity-30"
                  aria-label="Sola taşı"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(i);
                  }}
                  className="p-1 text-cream hover:text-red-300"
                  aria-label="Görseli sil"
                >
                  <X size={14} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    move(i, 1);
                  }}
                  disabled={i === images.length - 1}
                  className="p-1 text-cream disabled:opacity-30"
                  aria-label="Sağa taşı"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewIndex !== null && (
        <ImageLightbox
          images={images}
          index={previewIndex}
          onClose={() => setPreviewIndex(null)}
          onNavigate={setPreviewIndex}
        />
      )}
    </div>
  );
}
