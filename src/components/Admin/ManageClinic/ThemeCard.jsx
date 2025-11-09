// src/components/Admin/ManageClinic/ThemeCard.jsx
import  { useEffect, useMemo, useState } from "react";
import { Palette, Brush, RefreshCw, Copy, Check, Undo2, Save, Loader } from "lucide-react";
import { useClinic } from "../../../context/clinicContext";
import { getContrast } from "../../../utils/colors";
import api from "../../../api/axios";
import toast from "react-hot-toast";

const DEFAULTS = {
  primary: "#3b82f6",   
  secondary: "#1e40af", 
  accent: "#f59e0b",    
};


function randomHex() {
  const h = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
  return `#${h}`;
}

export default function ThemeCard() {

  const [colors, setColors] = useState(DEFAULTS);

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [loading, setLoading] = useState(false);

  const {clinic, setClinic} = useClinic();

  const canSave = useMemo(() => !!colors.primary && !!colors.secondary && !!colors.accent, [colors]);

  // charge depuis la clinique
  useEffect(() => {
        setColors({
          primary: clinic?.primary_color|| DEFAULTS.primary,
          secondary: clinic?.secondary_color || DEFAULTS.secondary,
          accent: clinic?.accent_color || DEFAULTS.accent,
        });
  }, [clinic]);

  // helpers
  const update = (k, v) => setColors(s => ({ ...s, [k]: v }));

  const handleCustomize = () => setEditing(true);

  const handleReset = () => {
    setColors(DEFAULTS);
  };

  const handleRandomize = () => {
    setColors({
      primary: randomHex(),
      secondary: randomHex(),
      accent: randomHex(),
    });
  };

 const handleCancel = () => {
      setEditing(false);
      setColors({
        primary: clinic?.primary_color || DEFAULTS.primary,
        secondary: clinic?.secondary_color || DEFAULTS.secondary,
        accent: clinic?.accent_color || DEFAULTS.accent,
      });
    };

  const handleSave = async () => {
    try {
    // Mettre api en multi part form data
    const form = new FormData();
    form.append('primary_color', colors.primary);
    form.append('secondary_color', colors.secondary);
    form.append('accent_color', colors.accent);

    setLoading(true);
    const response = await api.patch(`/api/clinics/${clinic.id}/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    if(response.status == 200 && response.data) {
        setClinic(response.data);
    }

    toast.success("Thème sauvegardé avec succès");
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    setEditing(false);
    } catch {
        toast.error("Erreur lors de la sauvegarde du thème");
    } finally {
        setLoading(false);
    }
  };

  const copyHex = async (key) => {
    try {
      await navigator.clipboard.writeText(colors[key]);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1200);
    } catch {
      // ignore
    }
  };

  const lightSecondary = colors.secondary;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-4 items-start">
      {/* Aperçu — card non écrasée (min-h, min-w-0) */}
      <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200 text-slate-700 p-2">
            <Palette className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-semibold text-slate-900">Aperçu du thème</h3>
        </div>

  <div className="grid grid-cols-3 md:grid-cols-[3fr_auto] gap-3">
          {/* Left: three color cards stacked */}
          <div className="grid grid-cols-3 gap-3">
            {/* PRIMARY */}
            <div className="rounded-xl border border-slate-200 p-3 bg-white">
              <div className="h-8 rounded-lg mb-2" style={{ backgroundColor: colors.primary }} />
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">Couleur primaire</span>
                <button
                  type="button"
                  onClick={() => copyHex("primary")}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                >
                  {copiedKey === "primary" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "primary" ? "Copié" : "Copier"}
                </button>
              </div>

              {editing && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    aria-label="primary color"
                    type="color"
                    value={colors.primary}
                    onChange={(e) => update("primary", e.target.value)}
                    className="w-8 h-8 p-0 border-0"
                  />
                  <input
                    className="text-xs text-slate-700 bg-white border border-slate-200 rounded px-2 py-1"
                    value={colors.primary}
                    onChange={(e) => update("primary", e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* SECONDARY */}
            <div className="rounded-xl border border-slate-200 p-3 bg-white">
              <div className="h-8 rounded-lg mb-2" style={{ backgroundColor: colors.secondary }} />
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">Couleur secondaire</span>
                <button
                  type="button"
                  onClick={() => copyHex("secondary")}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                >
                  {copiedKey === "secondary" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "secondary" ? "Copié" : "Copier"}
                </button>
              </div>

              {editing && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="color"
                    value={colors.secondary}
                    onChange={(e) => update("secondary", e.target.value)}
                    className="w-8 h-8 p-0 border-0"
                  />
                  <input
                    className="text-xs text-slate-700 bg-white border border-slate-200 rounded px-2 py-1"
                    value={colors.secondary}
                    onChange={(e) => update("secondary", e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* ACCENT */}
            <div className="rounded-xl border border-slate-200 p-3 bg-white">
              <div className="h-8 rounded-lg mb-2" style={{ backgroundColor: colors.accent }} />
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">Couleur d'accent</span>
                <button
                  type="button"
                  onClick={() => copyHex("accent")}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                >
                  {copiedKey === "accent" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "accent" ? "Copié" : "Copier"}
                </button>
              </div>

              {editing && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="color"
                    value={colors.accent}
                    onChange={(e) => update("accent", e.target.value)}
                    className="w-8 h-8 p-0 border-0"
                  />
                  <input
                    className="text-xs text-slate-700 bg-white border border-slate-200 rounded px-2 py-1"
                    value={colors.accent}
                    onChange={(e) => update("accent", e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center gap-2 ml-2">
            <button
              className="px-3 py-1.5 rounded-lg text-xs shadow-sm"
              style={{ backgroundColor: colors.primary, color: getContrast(colors.primary) }}
            >
              Bouton primaire
            </button>
            <button
              className="px-3 py-1.5 rounded-lg text-xs ring-1 ring-inset"
              style={{
                backgroundColor: lightSecondary,
                color: getContrast(lightSecondary),
                borderColor: colors.secondary,
              }}
            >
              Bouton secondaire
            </button>
            <button
              className="px-3 py-1.5 rounded-lg text-xs"
              style={{ backgroundColor: colors.accent, color: getContrast(colors.accent) }}
            >
              Accent
            </button>
          </div>

          {/* Mobile: keep original full-width buttons below the cards */}
          <div className="flex flex-wrap items-center gap-2 mt-1 md:hidden">
            <button
              className="px-3 py-1.5 rounded-lg text-xs shadow-sm"
              style={{ backgroundColor: colors.primary, color: getContrast(colors.primary) }}
            >
              Bouton primaire
            </button>
            <button
              className="px-3 py-1.5 rounded-lg text-xs ring-1 ring-inset"
              style={{
                backgroundColor: lightSecondary,
                color: getContrast(lightSecondary),
                borderColor: colors.secondary,
              }}
            >
              Bouton secondaire
            </button>
            <button
              className="px-3 py-1.5 rounded-lg text-xs"
              style={{ backgroundColor: colors.accent, color: getContrast(colors.accent) }}
            >
              Accent
            </button>
          </div>
        </div>
      </div>

      {/* Panneau d’actions (ne s’écrase pas) */}
  <div className="w-full md:w-[260px] rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="text-sm text-slate-600">
          Personnalisez finement les couleurs en direct (aperçu instantané).
        </div>

        {!editing ? (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleCustomize}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-95"
              style={{ backgroundColor: colors.primary }}
            >
              <Brush className="w-4 h-4" />
              Personnaliser le thème
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {
                loading ?
                <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-60"
                disabled
                style={{ backgroundColor: colors.primary }}>
                <Loader className="w-4 h-4 animate-spin" />
                Sauvegarde en cours...
                </button>
              :
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!canSave}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-60"
                        style={{ backgroundColor: colors.primary }}
                        >
                        {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved ? "Enregistré" : "Enregistrer"}
                    </button>
            }
      

            <button
              type="button"
              onClick={handleReset}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50"
            >
              <Undo2 className="w-4 h-4" />
              Réinitialiser
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={handleRandomize}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4" />
              Palette aléatoire
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
