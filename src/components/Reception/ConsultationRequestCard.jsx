import React, { useState } from "react";
import { 
  Clock, User, Phone, Mail, Calendar, Sparkles, 
  CheckCircle, XCircle, ChevronRight, Timer, FileText,
  AlertCircle,
  AlertTriangle
} from "lucide-react";
import { getImageUrl } from "../../utils/image";
import { getSpecialiteDisplay } from "../../utils/specialite";
import api from "../../api/axios";
import toast from "react-hot-toast";

function timeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  if (hours < 24) return `il y a ${hours} h`;
  if (days === 1) return "hier";
  return `il y a ${days} jours`;
}

export default function ConsultationRequestCard({ request, onRequestUpdated }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const doctor = request.doctor || {};
  const patient = request.patient || {};
  const doctorName = doctor.full_name || "Médecin";
  const patientName = patient.full_name || patient.first_name || "Patient";
  const specialty = getSpecialiteDisplay(doctor.specialite) || "Spécialité inconnue";
  const tarif = doctor.tarif_consultation || null;
  const duree = doctor.duree_consultation || null;

  const patientOptions = request.patient_options || [];
  const createdAgo = timeAgo(request.created_at);
  const hasAutoDiagnostic = !!request.auto_diagnostic;

  const doctorAvatar = getImageUrl(doctor.photo_url);
  const patientAvatar = getImageUrl(patient.photo_url);

  // Déterminer l'urgence d'après le diagnostic IA
  const getUrgencyLevel = () => {
    if (!request.auto_diagnostic || !request.auto_diagnostic.predictions) return null;
    
    const predictions = request.auto_diagnostic.predictions;
    if (!predictions.length) return null;

    const severities = predictions.map(p => {
      const sev = String(p.severity || '').toLowerCase();
      if (sev.includes('severe') || sev.includes('grave') || sev.includes('sévère')) return { level: 3, label: 'Grave', color: 'bg-red-100 text-red-700 border-red-200' };
      if (sev.includes('moderate') || sev.includes('moyen') || sev.includes('modéré')) return { level: 2, label: 'Modéré', color: 'bg-orange-100 text-orange-700 border-orange-200' };
      return { level: 1, label: 'Léger', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    });

    return severities.reduce((max, curr) => curr.level > max.level ? curr : max, severities[0]);
  };

  const urgency = getUrgencyLevel();

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      // TODO: Implémenter l'acceptation
      console.log("Accepter la demande", request.id);
      toast.success("Demande acceptée (à implémenter)");
      if (onRequestUpdated) {
        onRequestUpdated();
      }
    } catch (err) {
      console.error("Erreur lors de l'acceptation:", err);
      toast.error("Erreur lors de l'acceptation");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Êtes-vous sûr de vouloir refuser cette demande ?")) return;
    
    setIsRejecting(true);
    try {
      await api.post(`/api/consultation-requests/${request.id}/reject/`);
      toast.success("Demande refusée");
      if (onRequestUpdated) {
        onRequestUpdated();
      }
    } catch (err) {
      console.error("Erreur lors du refus:", err);
      toast.error("Erreur lors du refus de la demande");
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md border border-slate-200 transition-all overflow-hidden">
      {/* En-tête compact */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-100">
        {/* Avatar Patient - Plus petit */}
        <div className="shrink-0">
          {patientAvatar ? (
            <img 
              src={patientAvatar} 
              alt={patientName} 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100" 
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-sky-100 to-blue-100 flex items-center justify-center text-xs font-bold text-sky-700">
              {patientName.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Informations principales - Compact */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-slate-900 truncate">{patientName}</h3>
            <span className="text-xs text-slate-400">→</span>
            <span className="text-xs font-semibold text-slate-700 truncate">{doctorName}</span>
            {specialty && <span className="text-xs text-slate-400">· {specialty}</span>}
          </div>

          {/* Ligne 2: Contact */}
          <div className="mt-1 flex items-center gap-2 flex-wrap text-xs">
            {patient.phone && (
              <span className="text-slate-500">{patient.phone}</span>
            )}
            {patient.email && (
              <span className="text-slate-400 truncate max-w-[150px]">{patient.email}</span>
            )}
          </div>
        </div>

        {/* Tags, Badge temps et Actions à droite - Bien alignés */}
        <div className="flex items-center gap-2">
          {/* Tags compacts */}
          <div className="flex items-center gap-1">
            {urgency && (
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold ${urgency.color}`}>
                <AlertTriangle className="w-3 h-3" />
                {urgency.label}
              </span>
            )}
            {hasAutoDiagnostic && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-semibold">
                <Sparkles className="w-3 h-3" />
                IA
              </span>
            )}
            {tarif && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                {tarif} TND
              </span>
            )}
            {duree && (
              <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-semibold">
                {duree}min
              </span>
            )}
            {patientOptions.length > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                {patientOptions.length} créneau{patientOptions.length > 1 ? 'x' : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium whitespace-nowrap">
            <Clock className="w-3 h-3" />
            {createdAgo}
          </div>

          {/* Bouton expand créneaux si présents */}
          {patientOptions.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded hover:bg-slate-100 transition"
              title="Voir les créneaux"
            >
              <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Créneaux détaillés (si expandé) - Plus compact */}
      {isExpanded && patientOptions.length > 0 && (
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
          <div className="flex flex-wrap gap-1.5">
            {patientOptions.map((slot, idx) => (
              <div 
                key={idx} 
                className="px-2 py-1 rounded bg-white border border-slate-200 text-[10px] font-medium text-slate-700"
              >
                {new Date(slot.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} · {slot.start}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions - Compactes */}
      <div className="px-4 py-2 bg-white flex items-center justify-end gap-2">
        <button
          onClick={handleReject}
          disabled={isRejecting || isAccepting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-white text-red-700 font-medium text-xs hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRejecting ? (
            <span className="w-3 h-3 rounded-full border-2 border-red-700/30 border-t-red-700 animate-spin" />
          ) : (
            <XCircle className="w-3.5 h-3.5" />
          )}
          Refuser
        </button>

        <button
          onClick={handleAccept}
          disabled={isRejecting || isAccepting}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAccepting ? (
            <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5" />
          )}
          Accepter
        </button>
      </div>

      {/* Alerte si pas de créneaux - Plus discrète */}
      {!patientOptions.length && (
        <div className="px-4 py-1.5 bg-amber-50 border-t border-amber-100 flex items-center gap-1.5 text-[10px] text-amber-700">
          <AlertCircle className="w-3 h-3" />
          <span>Pas de préférence de créneau</span>
        </div>
      )}
    </div>
  );
}
