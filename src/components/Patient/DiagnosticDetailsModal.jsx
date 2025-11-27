import { X, Sparkles, Activity, AlertTriangle, Stethoscope, Pill, User, Trash2, FileText } from "lucide-react";
import { useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function DiagnosticDetailsModal({ isOpen, onClose, autoDiagnostic, requestId }) {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !autoDiagnostic) return null;

  const handleDelete = async () => {
    if (!requestId) return;
    if (!confirm("Voulez-vous vraiment supprimer ce diagnostic IA ?")) return;

    setDeleting(true);
    try {
      await api.delete(`/api/consultation-requests/${requestId}/delete-auto-diagnostic/`);
      toast.success("Diagnostic IA supprimé");
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression du diagnostic");
      setDeleting(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "faible":
      case "low":
      case "mild":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "moyen":
      case "moderate":
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "élevé":
      case "high":
      case "severe":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };


  const getIntensityBadge = (intensite) => {
    const intensity = String(intensite);
    if (intensity.match(/\d+/)) {
      const num = parseInt(intensity);
      if (num <= 3) return { label: "Faible", color: "bg-emerald-100 text-emerald-700" };
      if (num <= 7) return { label: "Modéré", color: "bg-amber-100 text-amber-700" };
      return { label: "Intense", color: "bg-red-100 text-red-700" };
    }
    switch (intensite?.toLowerCase()) {
      case "faible":
      case "low":
        return { label: "Faible", color: "bg-emerald-100 text-emerald-700" };
      case "moyen":
      case "moderate":
      case "medium":
        return { label: "Modéré", color: "bg-amber-100 text-amber-700" };
      case "élevé":
      case "high":
      case "intense":
        return { label: "Intense", color: "bg-red-100 text-red-700" };
      default:
        return { label: intensite || "—", color: "bg-slate-100 text-slate-700" };
    }
  };

  return (
    <div className="fixed inset-0 h-full z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header compact */}
        <div className="bg-linear-to-r from-sky-600 to-sky-700 text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <div>
                <h2 className="text-base font-bold">Diagnostic IA</h2>
                <p className="text-xs text-indigo-100">
                  {new Date(autoDiagnostic.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content compact */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          <div className="space-y-3">
            {/* Symptômes */}
            {autoDiagnostic.symptoms && autoDiagnostic.symptoms.length > 0 && (
              <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-900">Symptômes</h3>
                  <span className="ml-auto px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
                    {autoDiagnostic.symptoms.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {autoDiagnostic.symptoms.map((symptom, idx) => {
                    const badge = getIntensityBadge(symptom.intensite);
                    return (
                      <div key={idx} className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900 text-xs">
                              {symptom.symptomeName || "Symptôme non spécifié"}
                            </div>
                            {symptom.bodyPart && (
                              <div className="text-[10px] text-slate-500 mt-0.5">{symptom.bodyPart}</div>
                            )}
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Prédictions */}
            {autoDiagnostic.predictions && autoDiagnostic.predictions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-900">Diagnostics</h3>
                </div>

                {autoDiagnostic.predictions.map((prediction, idx) => (
                  <div
                    key={idx}
                    className={`bg-white rounded-lg p-3 shadow-sm border transition-all ${
                      idx === 0 ? 'border-indigo-300' : 'border-slate-200'
                    }`}
                  >
                    {/* Header Diagnostic */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-slate-900">
                            {prediction.disease || "Maladie non identifiée"}
                          </h4>
                          {idx === 0 && (
                            <span className="px-1.5 py-0.5 bg-indigo-500 text-white text-[9px] font-bold rounded-full">
                              PRINCIPAL
                            </span>
                          )}
                        </div>
                        {prediction.specialty && (
                          <div className="text-xs text-sky-700">
                            {prediction.specialty}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {prediction.confidence !== undefined && (
                          <div className="text-lg font-bold mb-1 ${getConfidenceColor(prediction.confidence)}">
                            {Math.round(prediction.confidence * 100)}%
                          </div>
                        )}
                        {prediction.severity && (
                          <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSeverityColor(prediction.severity)}`}>
                            {prediction.severity}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Détails */}
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      {prediction.cause && prediction.cause !== 'Non documentée' && (
                        <div className="bg-slate-50 rounded p-2">
                          <div className="font-semibold text-slate-700 text-[10px] mb-0.5">Cause</div>
                          <div className="text-slate-600">{prediction.cause}</div>
                        </div>
                      )}
                      {prediction.treatment && prediction.treatment !== 'À déterminer' && (
                        <div className="bg-emerald-50 rounded p-2">
                          <div className="font-semibold text-emerald-700 text-[10px] mb-0.5">Traitement</div>
                          <div className="text-slate-600">{prediction.treatment}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-white flex justify-between">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500 text-white font-semibold hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Suppression...' : 'Effacer le diagnostic'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition text-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
