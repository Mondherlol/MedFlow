// components/Patient/RequestCard.jsx
import React, { useState } from "react";
import { Clock, ListChecks, Pencil, Trash2, FileText } from "lucide-react";
import { getImageUrl } from "../../utils/image";
import EditDisposModal from "./EditDisposModal";
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

export default function RequestCard({ request }) {
  const [editOpen, setEditOpen] = useState(false);

  const doctor = request.doctor || {};
  const doctorName = doctor.full_name || "Médecin";
  const specialty = doctor.specialite || "Spécialité inconnue";

  const patientOptions = request.patient_options || [];
  const createdAgo = timeAgo(request.created_at);

  const avatar = getImageUrl(doctor.photo_url);

  async function cancelRequest() {
    try {
      await api.delete(`/api/consultation-requests/${request.id}/`);
      toast.success("Demande annulée");
      window.location.reload();
    } catch {
      toast.error("Impossible d'annuler la demande");
    }
  }

  return (
    <>
      <article className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex gap-4 items-start">

        {/* Avatar */}
        <div className="shrink-0">
          {avatar ? (
            <img
              src={avatar}
              className="w-14 h-14 rounded-full object-cover"
              alt={doctorName}
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-600">
              {doctorName.split(" ").map((x) => x[0]).join("").slice(0, 2)}
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="flex-1 space-y-1">
          <div className="font-semibold text-slate-900">{doctorName}</div>
          <div className="text-sm text-slate-500">{specialty}</div>

          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-4 h-4" />
            <span>{createdAgo}</span>
          </div>

          {/* CRENEAUX LIST */}
          <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <strong>Vos disponibilités :</strong>
            <ul className="mt-1 ml-3 list-disc space-y-1">
              {patientOptions.map((p, i) => (
                <li key={i}>
                  {p.date} • {p.start} → {p.end}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col gap-2 ml-4">

          {/* modifier dispos */}
          <button
            onClick={() => setEditOpen(true)}
            className="px-3 py-1 text-xs rounded-lg bg-slate-900 text-white flex items-center gap-1 hover:bg-slate-800"
          >
            <Pencil className="w-4 h-4" /> Modifier
          </button>

          {/* diagnostic IA */}
          {request.diagnosticAI ? (
            <button className="px-3 py-1 text-xs rounded-lg bg-emerald-100 text-emerald-700 flex items-center gap-1 hover:bg-emerald-200">
              <FileText className="w-4 h-4" /> Diagnostic IA
            </button>
          ) : (
            <button className="px-3 py-1 text-xs rounded-lg bg-sky-100 text-sky-700 flex items-center gap-1 hover:bg-sky-200">
              <ListChecks className="w-4 h-4" /> Ajouter test IA
            </button>
          )}

          {/* annuler */}
          <button
            onClick={cancelRequest}
            className="px-3 py-1 text-xs rounded-lg bg-rose-100 text-rose-700 flex items-center gap-1 hover:bg-rose-200"
          >
            <Trash2 className="w-4 h-4" /> Annuler
          </button>
        </div>
      </article>

      {/* MODAL */}
      {editOpen && (
        <EditDisposModal
          request={request}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
}
