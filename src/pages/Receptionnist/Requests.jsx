import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReceptionistTemplate from "../../components/Reception/ReceptionTemplate";
import { Check, X } from "lucide-react";
import toast from "react-hot-toast";

export default function Requests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([
    { id: 1, patient: "Sana Khelifi", phone: "+216 22 333 444", time: "2025-11-14T09:30:00", reason: "Consultation générale", status: "pending" },
    { id: 2, patient: "Karim Jelassi", phone: "+216 55 111 222", time: "2025-11-14T10:15:00", reason: "Douleur abdominale", status: "pending" },
    { id: 3, patient: "Leila Ben", phone: "+216 98 777 666", time: "2025-11-14T11:00:00", reason: "Suivi", status: "pending" },
  ]);

  const update = (id, patch) => setRequests(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));

  const approve = (id) => {
    update(id, { status: "accepted" });
    toast.success("Demande acceptée");
    const req = requests.find(r => r.id === id);
    if (req) navigate('/reception/appointments');
  };

  const reject = (id) => {
    update(id, { status: "rejected" });
    toast.error("Demande rejetée");
  };

  return (
    <ReceptionistTemplate
      title="Demandes de RDV"
      breadcrumbs={[{ label: "Accueil réception", to: "/reception" }, { label: "Demandes de RDV", current: true }]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Demandes de rendez-vous</h2>
            <p className="text-sm text-slate-500 mt-1">Validez ou refusez rapidement les demandes reçues.</p>
          </div>
          <Link to="/reception/appointments/requests" className="text-sm text-slate-600 underline">Filtrer</Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="divide-y">
            {requests.map(r => (
              <div key={r.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-slate-800">{r.patient}</div>
                  <div className="text-sm text-slate-500">{new Date(r.time).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' })} • {r.reason}</div>
                  <div className="text-xs mt-1">{r.phone}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-2 py-1 rounded-md text-xs ${r.status === 'pending' ? 'bg-amber-100 text-amber-800' : r.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}> {r.status} </div>
                  <button onClick={()=>approve(r.id)} disabled={r.status!=='pending'} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-600 text-white text-sm hover:brightness-95">
                    <Check className="w-4 h-4" /> Accepter
                  </button>
                  <button onClick={()=>reject(r.id)} disabled={r.status!=='pending'} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border text-sm text-slate-700">
                    <X className="w-4 h-4" /> Refuser
                  </button>
                </div>
              </div>
            ))}
            {requests.length === 0 && <div className="py-6 text-sm text-slate-500">Aucune demande pour le moment.</div>}
          </div>
        </div>
      </div>
    </ReceptionistTemplate>
  );
}
