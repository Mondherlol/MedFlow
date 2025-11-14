import React, { useMemo, useState } from "react";
import ReceptionistTemplate from "../../components/Reception/ReceptionTemplate";
import { useNavigate } from "react-router-dom";
import { Clock, Check, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function Consultations() {
  const navigate = useNavigate();

  const now = useMemo(() => new Date(), []);
  const initial = useMemo(() => ([
    { id: 1, patient: { id: 101, name: "Marie Dupont" }, doctor: "Dr. Martin", time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30).toISOString(), status: "scheduled" },
    { id: 2, patient: { id: 102, name: "Ali Ben" }, doctor: "Dr. Durand", time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0).toISOString(), status: "scheduled" },
    { id: 3, patient: { id: 103, name: "Sophie Legrand" }, doctor: "Dr. Martin", time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 15).toISOString(), status: "scheduled" },
  ]), [now]);

  const [appointments, setAppointments] = useState(initial);

  const update = (id, patch) => setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));

  const checkIn = (id) => {
    update(id, { status: 'checked_in', checkedInAt: new Date().toISOString() });
    toast.success('Patient en salle (check-in)');
  };

  const checkOut = (id) => {
    if (!window.confirm('Marquer comme terminé ?')) return;
    update(id, { status: 'checked_out', checkedOutAt: new Date().toISOString() });
    toast('Visite terminée', { icon: '✅' });
  };

  return (
    <ReceptionistTemplate
      title="Consultations — Aujourd'hui"
      breadcrumbs={[{ label: "Accueil réception", to: "/reception" }, { label: "Consultations", current: true }]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Consultations — Aujourd'hui</h2>
            <p className="text-sm text-slate-500 mt-1">Vue d'ensemble des consultations programmées pour la journée.</p>
          </div>
          <button onClick={()=>navigate('/reception/patients/new')} className="px-3 py-2 rounded-md bg-sky-600 text-white text-sm">Nouveau patient</button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="divide-y">
            {appointments.map(a => (
              <div key={a.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-semibold">{a.patient.name.split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
                  <div>
                    <div className="font-medium text-slate-800">{a.patient.name}</div>
                    <div className="text-sm text-slate-500">{a.doctor} • {new Date(a.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs px-2 py-1 rounded-md bg-slate-100">{a.status}</div>
                  {a.status === 'scheduled' && (
                    <button onClick={()=>checkIn(a.id)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-600 text-white text-sm">
                      <Check className="w-4 h-4" /> Check-in
                    </button>
                  )}

                  {a.status === 'checked_in' && (
                    <button onClick={()=>checkOut(a.id)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border text-sm text-slate-700">
                      <ArrowRight className="w-4 h-4" /> Check-out
                    </button>
                  )}

                  <button onClick={()=>navigate('/consultation', { state: { patientId: a.patient.id } })} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border text-sm text-slate-700">
                    <Clock className="w-4 h-4" /> Détails
                  </button>
                </div>
              </div>
            ))}
            {appointments.length === 0 && <div className="py-6 text-sm text-slate-500">Aucune consultation aujourd'hui.</div>}
          </div>
        </div>
      </div>
    </ReceptionistTemplate>
  );
}
