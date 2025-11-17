import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ConsultationRow from "./ConsultationRow";

export default function UpcomingPanel({ consultations = [], onPostpone, onCancel, accent = "#0ea5e9", loadingAction = "", loadingConsultations = false }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return consultations;
    return consultations.filter(c => {
      const patient = (c.patient?.full_name || c.patient?.user?.full_name || "").toLowerCase();
      const doctor = (c.doctor?.full_name || c.doctor?.user?.full_name || "").toLowerCase();
      return patient.includes(q) || doctor.includes(q);
    });
  }, [consultations, query]);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-border duration-150 border border-slate-50">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">Prochains rendez-vous de la journée</h2>
        <Link to="/reception/consultations" className="text-xs font-medium text-slate-600">Voir la journée</Link>
      </div>

      <div className="mb-3">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher patient ou médecin..." className="w-full text-sm rounded-lg border border-slate-100 bg-white px-3 py-2" />
      </div>

      <div className="space-y-2">
        {loadingConsultations ? (
          [0, 1, 2, 3].map(i => (
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
          ))
        ) : (
          <>
            {filtered.slice(0, 8).map(c => (
              <ConsultationRow
                key={c.id}
                c={c}
                onPostpone={() => onPostpone && onPostpone(c.id)}
                onCancel={() => onCancel && onCancel(c.id)}
                accent={accent}
                loadingAction={loadingAction}
              />
            ))}
            {!filtered.length && <div className="text-sm text-slate-500">Aucun rendez-vous à venir.</div>}
          </>
        )}
      </div>
    </div>
  );
}
