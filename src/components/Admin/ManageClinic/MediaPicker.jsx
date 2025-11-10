import React, { useEffect, useState } from "react";
import { Trash2, UploadCloud } from "lucide-react";

export default function MediaPicker({ label = "Image", value, onChange, placeholderIcon: Icon }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!value) { setPreview(null); return; }
    if (typeof value === "string") { setPreview(value); return; }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const onFile = (f) => { if (f) onChange(f); };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-1 flex items-center gap-3">
        <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
          <UploadCloud className="w-4 h-4" />
          <span>Choisir une image</span>
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>

        {preview ? (
          <div className="relative">
            <img src={preview} alt="preview" className="h-20 w-28 rounded-lg object-cover border border-slate-200" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute -top-2 -right-2 inline-flex items-center justify-center rounded-full bg-white p-1 text-slate-500 shadow"
              title="Supprimer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="h-20 w-28 rounded-lg border border-slate-200 grid place-items-center text-slate-400">
            {Icon ? <Icon className="w-6 h-6" /> : "—"}
          </div>
        )}
      </div>
    </div>
  );
}
