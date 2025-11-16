import React, { useEffect, useState } from "react";
import { Loader2, X, CalendarDays, Save, Clock } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

function hhmmToMinutes(s) {
  if (!s) return 0;
  const [h, m] = (s || "00:00").split(":").map((n) => parseInt(n, 10));
  return (h || 0) * 60 + (m || 0);
}

function minutesToHhmm(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function EditConsultationFloatingForm({ consultation, onClose, onSaved, autoSave = true, allowDurationEdit = true }) {
  const [date, setDate] = useState(consultation?.date || "");
  const [start, setStart] = useState(consultation?.heure_debut || consultation?.start || "08:00");
  const [duration, setDuration] = useState(() => {
    if (consultation?.heure_debut && consultation?.heure_fin) {
      return hhmmToMinutes(consultation.heure_fin) - hhmmToMinutes(consultation.heure_debut);
    }
    if (consultation?.doctor?.duree_consultation) return Number(consultation.doctor.duree_consultation);
    if (consultation?.duration) return Number(consultation.duration);
    return 15;
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDate(consultation?.date || "");
    setStart(consultation?.heure_debut || consultation?.start || "08:00");
  }, [consultation?.id]);

  async function handleSave(e) {
    e?.preventDefault?.();
    if (!consultation?.id) return;
    const hhFin = minutesToHhmm(hhmmToMinutes(start) + Number(duration || 0));
    const payload = { date, heure_debut: start, heure_fin: hhFin };
    try {
      setSaving(true);
      if (autoSave) {
        const res = await api.patch(`/api/consultations/${consultation.id}/`, payload);
        const data = res.data?.data || res.data || null;
        toast.success("Consultation mise à jour");
        onSaved && onSaved({ original: consultation, modified: { ...consultation, ...payload } }, data);
        onClose && onClose();
      } else {
        toast.success("Modification appliquée");
        onSaved && onSaved({ original: consultation, modified: { ...consultation, ...payload } });
        onClose && onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error("Impossible de mettre à jour la consultation");
    } finally {
      setSaving(false);
    }
  }

  if (!consultation) return null;

  const patientName = consultation.patient?.user?.full_name || consultation.patient?.full_name || "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-label="Modifier la consultation" aria-modal="true">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-11/12 max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 text-blue-600">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-800">Modifier la consultation</div>
              <div className="text-xs text-slate-500">{patientName}</div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1 rounded-md hover:bg-slate-100 transition-colors"
            title="Fermer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-4 space-y-4">
          {/* Date Field */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">Date</label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 hover:border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
                required
              />
            </div>
          </div>

          {/* Time and Duration */}
          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-medium text-slate-700">Heure de début</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="time" 
                  step={300} 
                  value={start} 
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 hover:border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
                  required
                />
              </div>
            </div>

            {allowDurationEdit && (
              <div className="w-28 space-y-2">
                <label className="text-xs font-medium text-slate-700">Durée (min)</label>
                <input 
                  type="number" 
                  value={duration} 
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min="5"
                  step="5"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 hover:border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
                />
              </div>
            )}
          </div>

          {/* Calculated end time display */}
          <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-600">
              <span className="font-medium">Heure de fin : </span>
              <span className="text-slate-700">
                {minutesToHhmm(hhmmToMinutes(start) + Number(duration || 0))}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-br from-sky-600 to-sky-500 text-white hover:from-sky-700 hover:to-sky-600 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Valider</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
}