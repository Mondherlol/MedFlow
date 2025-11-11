import React, { useMemo, useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useClinic } from "../../../context/clinicContext";
import { getImageUrl } from "../../../utils/image";

export default function GallerySection({ clinic }) {
  const { theme } = useClinic() || {};
  const accent = theme?.accent || "#f59e0b";

  // support multiple possible shapes: clinic.images_urls (strings), clinic.images (array of objects), clinic.gallery
  const images = useMemo(() => {
    const raw = clinic?.images_urls || clinic?.images || clinic?.gallery || [];
    return Array.isArray(raw)
      ? raw.map((it) => (typeof it === "string" ? it : it?.url || it?.image || null)).filter(Boolean)
      : [];
  }, [clinic]);

  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const openAt = (i) => {
    setIndex(i);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);
  const prev = () => setIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
  const next = () => setIndex((i) => (i >= images.length - 1 ? 0 : i + 1));

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, images.length]);

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Découvrez notre clinique</h2>
          <p className="text-sm text-slate-500">{images.length} image{images.length > 1 ? "s" : ""}</p>
        </div>

        {images && images.length ? (
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {images.map((img, i) => (
              <button
                key={img + String(i)}
                onClick={() => openAt(i)}
                className="relative group w-full h-40 rounded overflow-hidden focus:outline-none focus:ring-2 focus:ring-sky-300"
                aria-label={`Ouvrir l'image ${i + 1}`}
              >
                <img
                  src={getImageUrl(img)}
                  alt={`Image ${i + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition duration-200" />
                <div className="absolute left-2 bottom-2 text-xs text-white flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                  <span className="px-2 py-1 rounded bg-black/50">#{i + 1}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
            <p className="text-slate-600">Aucune image pour le moment.</p>
            <p className="text-xs text-slate-400 mt-2">Ajoutez des images depuis l'espace d'administration pour les afficher ici.</p>
          </div>
        )}

        {/* Lightbox modal */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={close} />
            <div className="relative max-w-5xl w-full max-h-full">
              <button onClick={close} className="absolute top-3 right-3 z-10 bg-white/90 rounded-full p-2">
                <X className="w-5 h-5 text-slate-800" />
              </button>

              <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 rounded-full p-2">
                <ChevronLeft className="w-6 h-6 text-slate-800" />
              </button>

              <div className="w-full h-[70vh] bg-slate-900 flex items-center justify-center overflow-hidden rounded">
                <img src={getImageUrl(images[index])} alt={`Image ${index + 1}`} className="max-w-full max-h-full object-contain" />
              </div>

              <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 rounded-full p-2">
                <ChevronRight className="w-6 h-6 text-slate-800" />
              </button>

              <div className="flex items-center justify-between mt-3 text-sm text-slate-200">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-black/40 rounded">{index + 1} / {images.length}</span>
                  <a href={getImageUrl(images[index])} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-white/90 hover:underline">
                    Voir l'image <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div className="text-xs text-slate-300">Appuyez sur ← → pour naviguer, Échap pour fermer</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
