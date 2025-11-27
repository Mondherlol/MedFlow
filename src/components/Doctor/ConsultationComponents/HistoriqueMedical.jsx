import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, FileText, ChevronRight } from "lucide-react";
import api from "../../../api/axios";
import toast from "react-hot-toast";

export default function HistoriqueMedical({ patientId, currentConsultationId }) {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      fetchConsultations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  async function fetchConsultations() {
    try {
      setLoading(true);
      const res = await api.get(`/api/consultations/?patient_id=${patientId}`);
      const data = res.data?.data || res.data || [];
      
      // Filter out current consultation and sort by date (most recent first)
      const filtered = data
        .filter(c => c.id !== currentConsultationId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setConsultations(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger l'historique médical");
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      confirme: "bg-emerald-100 text-emerald-700",
      termine: "bg-slate-100 text-slate-700",
      annule: "bg-red-100 text-red-700",
      "en-attente": "bg-amber-100 text-amber-700"
    };
    return badges[status] || "bg-slate-100 text-slate-700";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-sky-600" />
          <h2 className="text-lg font-semibold text-slate-900">Historique Médical</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-lg border border-slate-100">
              <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-sky-600" />
          <h2 className="text-lg font-semibold text-slate-900">Historique Médical</h2>
        </div>
        <span className="text-xs text-slate-400">{consultations.length} consultation(s)</span>
      </div>

      {consultations.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">Aucune consultation antérieure</p>
          <p className="text-xs text-slate-400 mt-1">C'est la première consultation de ce patient</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {consultations.map((consultation) => {
            const duration = consultation.heure_fin && consultation.heure_debut
              ? Math.round(
                  ((new Date(`1970-01-01T${consultation.heure_fin}`) - new Date(`1970-01-01T${consultation.heure_debut}`)) / 1000 / 60)
                )
              : null;

            return (
              <div
                key={consultation.id}
                onClick={() => navigate(`/doctor/consultation/${consultation.id}`)}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-sky-200 hover:bg-sky-50/30 transition cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-lg bg-sky-100 flex flex-col items-center justify-center text-sky-700">
                  <div className="text-xs font-medium">
                    {new Date(consultation.date).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()}
                  </div>
                  <div className="text-lg font-bold leading-none">
                    {new Date(consultation.date).getDate()}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900 text-sm">
                      {new Date(consultation.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(consultation.statusConsultation)}`}>
                      {consultation.statusConsultation}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {consultation.heure_debut}
                      {duration && <span>• {duration}min</span>}
                    </span>
                    {consultation.doctor?.full_name && (
                      <span className="truncate">Dr. {consultation.doctor.full_name}</span>
                    )}
                  </div>

                  {consultation.diagnostique && (
                    <div className="mt-1 text-xs text-slate-600 truncate">
                      <span className="font-medium">Diagnostic:</span> {consultation.diagnostique}
                    </div>
                  )}
                </div>

                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-sky-600 transition flex-shrink-0" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
