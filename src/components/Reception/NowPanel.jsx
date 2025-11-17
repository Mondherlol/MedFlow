import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import ConsultationRow from "./ConsultationRow";

export default function NowPanel({ consultations = [], onCheckIn, onCheckOut, onPostpone, onCancel, accent = "#0ea5e9", loadingAction = "", loadingConsultations = true }) {
  const [statusFilter, setStatusFilter] = useState("tous"); // "tous" | "encours" | "attente"
  const [doctorId, setDoctorId] = useState("");

  // derive doctors list from consultations
  const doctors = useMemo(() => {
    const map = new Map();
    consultations.forEach(c => {
      const d = c.doctor;
      if (d && d.id) map.set(d.id, d);
    });
    return Array.from(map.values());
  }, [consultations]);

  const filtered = useMemo(() => {
    return consultations.filter(c => {
      // status filter
      if (statusFilter === "encours") {
        if (c.statusConsultation !== "encours") return false;
      } else if (statusFilter === "attente") {
        // "attente" show confirmed appointments waiting (confirme)
        if (c.statusConsultation !== "confirme") return false;
      }
      // doctor filter
      if (doctorId) {
        if (!c.doctor || String(c.doctor.id) !== String(doctorId)) return false;
      }
      return true;
    });
  }, [consultations, statusFilter, doctorId]);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-border duration-150 border border-slate-50">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">Check-ins — Maintenant</h2>
        <Link to="/reception/checkins" className="text-xs font-medium text-slate-600">Voir tout</Link>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="inline-flex rounded-lg overflow-hidden border border-slate-100 bg-white">
          <button onClick={() => setStatusFilter("tous")} className={`px-3 py-1 text-sm ${statusFilter === "tous" ? "bg-slate-50 font-semibold" : "text-slate-600"}`}>
            Tous
          </button>
          <button onClick={() => setStatusFilter("encours")} className={`px-3 py-1 text-sm ${statusFilter === "encours" ? "bg-slate-50 font-semibold" : "text-slate-600"}`}>
            En cours
          </button>
          <button onClick={() => setStatusFilter("attente")} className={`px-3 py-1 text-sm ${statusFilter === "attente" ? "bg-slate-50 font-semibold" : "text-slate-600"}`}>
            En attente
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <select value={doctorId} onChange={e => setDoctorId(e.target.value)} className="text-sm rounded-lg border border-slate-100 bg-white px-3 py-2">
            <option value="">Tous les médecins</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.full_name || d.user?.full_name || d.name || `Dr ${d.id}`}</option>
            ))}
          </select>
        </div>
      </div>

      {loadingConsultations ? (
        <div className="space-y-2">
          {[0, 1].map(i => (
            <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-50 rounded-lg shadow-sm animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full" />
                <div className="space-y-2">
                  <div className="w-40 h-3 bg-slate-100 rounded" />
                  <div className="w-28 h-2 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-8 bg-slate-100 rounded" />
                <div className="w-10 h-8 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length ? (
        <div className="space-y-2">
          {filtered.map(c => (
            <ConsultationRow
              key={c.id}
              c={c}
              onCheckIn={() => onCheckIn && onCheckIn(c.id)}
              onCheckOut={() => onCheckOut && onCheckOut(c.id)}
              onPostpone={() => onPostpone && onPostpone(c.id)}
              onCancel={() => onCancel && onCancel(c.id)}
              accent={accent}
              loadingAction={loadingAction}
            />
          ))}
        </div>
      ) : (
        <div className="text-sm text-slate-500">Aucun rendez-vous dans l'intervalle sélectionné.</div>
      )}
    </div>
  );
}
