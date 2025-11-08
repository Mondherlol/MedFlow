import React, { useEffect, useState, useRef } from "react";
import { Image as ImageIcon } from "lucide-react";

const cx = (...cls) => cls.filter(Boolean).join(" ");

export default function ClinicImage({ src, alt, className = "", rounded = "rounded-2xl" }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!src) {
      setImageLoading(false);
      setImageError(true);
      return;
    }

    let mounted = true;
    // mark loading in both state and ref so the timeout can read latest value
    setImageLoading(true);
    loadingRef.current = true;
    setImageError(false);

    const img = new window.Image();
    img.src = src;

    const onLoad = () => {
      if (!mounted) return;
      setImageLoading(false);
      loadingRef.current = false;
      setImageError(false);
    };
    const onError = () => {
      if (!mounted) return;
      setImageLoading(false);
      loadingRef.current = false;
      setImageError(true);
    };

    img.addEventListener("load", onLoad);
    img.addEventListener("error", onError);

    // Fallback timeout in case events never fire
    const timeout = setTimeout(() => {
      if (!mounted) return;
      // use loadingRef.current (not the stale state captured by the closure)
      if (loadingRef.current) {
        setImageLoading(false);
        // Do not assume success — mark error to show fallback
        setImageError(true);
      }
    }, 8000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", onError);
    };
  }, [src]);

  if (imageError || !src) {
    return (
      <div className={cx(className, rounded, "bg-gray-200/70 backdrop-blur-sm border border-gray-200 flex items-center justify-center")} role="img" aria-label={alt || "Image non disponible"}>
        <div className="text-center text-gray-500">
          <ImageIcon className="w-10 h-10 mx-auto mb-2" />
          <p className="text-sm">Image non disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cx(className, rounded, "relative overflow-hidden")} style={{ maskImage: "radial-gradient(white 90%, transparent 100%)" }}>
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin text-gray-300" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cx(
          "w-full h-full object-cover transition-all duration-500",
          imageLoading ? "opacity-0 scale-[1.01]" : "opacity-100 scale-100"
        )}
        onLoad={() => setImageLoading(false)}
        onError={() => { setImageError(true); setImageLoading(false); }}
      />
    </div>
  );
}
