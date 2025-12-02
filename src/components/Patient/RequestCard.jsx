// components/Patient/RequestCard.jsx
import React, { useState } from "react";
import { Clock, Pencil, Trash2, Sparkles, DollarSign, Timer, Calendar, ChevronRight } from "lucide-react";
import { getImageUrl } from "../../utils/image";
import { getSpecialiteDisplay } from "../../utils/specialite";
import EditDisposModal from "./EditDisposModal";
import DiagnosticDetailsModal from "./DiagnosticDetailsModal";
import api from "../../api/axios";
import toast from "react-hot-toast";

function timeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return "à l’instant";
  if (mins < 60) return `il y a ${mins} min`;
  if (hours < 24) return `il y a ${hours} h`;
  if (days === 1) return "hier";
  return `il y a ${days} jours`;
}

export default function RequestCard({ request, onRequestDeleted }) {
  const [editOpen, setEditOpen] = useState(false);
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [rejectionNoteOpen, setRejectionNoteOpen] = useState(false);

  const doctor = request.doctor || {};
  const doctorName = doctor.full_name || "Médecin";
  const specialty = getSpecialiteDisplay(doctor.specialite) || doctor.specialite || "Spécialité inconnue";
  const tarif = doctor.tarif_consultation || null;
  const duree = doctor.duree_consultation || null;
  const isRejected = request.statusDemandeConsultation == "rejected";

  const patientOptions = request.patient_options || [];
  const createdAgo = timeAgo(request.created_at);

  const avatar = getImageUrl(doctor.photo_url);

  async function cancelRequest() {
    setCanceling(true);
    try {
      await api.delete(`/api/consultation-requests/${request.id}/`);
      toast.success("Demande annulée");
      if (onRequestDeleted) {
        onRequestDeleted();
      }
    } catch {
      toast.error("Impossible d'annuler la demande");
      setCanceling(false);
    }
  }

  return (
    <>
      <article className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm hover:shadow-lg border border-slate-100 transition">
        <div className={`w-1 h-16 rounded-l-full bg-${isRejected ? "red" : "indigo"}-400`} />

        <div className="shrink-0">
          {avatar ? (
            <img src={avatar} alt={doctorName} className="w-14 h-14 rounded-full object-cover ring-1 ring-slate-100" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-sm font-semibold text-indigo-700">
              {doctorName.split(" ").map((x) => x[0]).join("").slice(0, 2)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold text-slate-900 truncate">{doctorName}</div>
            {specialty && <div className="text-xs text-slate-500">· {specialty}</div>}
          </div>

          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
            <div className="inline-flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{createdAgo}</span>
            </div>
            {tarif && (
              <div className="inline-flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-emerald-700">{tarif} TND</span>
              </div>
            )}
            {duree && (
              <div className="inline-flex items-center gap-1">
                <Timer className="w-4 h-4 text-sky-500" />
                <span className="font-semibold text-sky-700">{duree} min</span>
              </div>
            )}
            {patientOptions.length > 0 && (
              <div className="inline-flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{patientOptions.length} créneau{patientOptions.length > 1 ? 'x' : ''}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {request.auto_diagnostic && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Diagnostic IA</span>
            </div>
          )}

        {
          !isRejected && 
            <>
            <button
              onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100 text-xs transition"
            >
              <Pencil className="w-4 h-4" />
              <span>Modifier</span>
            </button>
            

            <button
              onClick={cancelRequest}
              disabled={canceling}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 text-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {canceling ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-rose-300 border-t-rose-700 animate-spin" />
                  <span>Annulation...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Annuler</span>
                </>
              )}
            </button>
            </>
            }

            {
              isRejected && 
              <>
              <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 text-xs">
               <span>Demande rejetée</span>
               <button onClick={() => setRejectionNoteOpen(true)} className="ml-2 underline text-rose-700 hover:text-rose-800 cursor-pointer">
                Voir la raison
               </button>
              </div>
              </>
            }

          {request.auto_diagnostic && (
            <button
              onClick={() => setDiagnosticOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100"
            >
              <span className="text-sm">Voir</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          )}
        </div>
      </article>

      {/* Modals */}
      {editOpen && (
        <EditDisposModal
          request={request}
          onClose={() => setEditOpen(false)}
        />
      )}
      
      {diagnosticOpen && request.auto_diagnostic && (
        <DiagnosticDetailsModal
          isOpen={diagnosticOpen}
          onClose={() => setDiagnosticOpen(false)}
          autoDiagnostic={request.auto_diagnostic}
          requestId={request.id}
        />
      )}

      {rejectionNoteOpen && (
        <div className="fixed h-full inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setRejectionNoteOpen(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Demande rejetée</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-slate-600 mb-2">Raison du rejet :</p>
              <div className="bg-rose-50 border border-rose-100 rounded-lg p-4">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                  {request.receptionist_note || "Aucune raison fournie"}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRejectionNoteOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
