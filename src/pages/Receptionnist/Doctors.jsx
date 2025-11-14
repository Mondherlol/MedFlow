import React from "react";
import { Link, useNavigate } from "react-router-dom";
import ReceptionistTemplate from "../../components/Reception/ReceptionTemplate";
import { User, Calendar } from "lucide-react";

const doctors = [
  { id: 1, name: "Dr. Amine Ktari", specialty: "Généraliste", phone: "+216 55 123 456" },
  { id: 2, name: "Dr. Leila Trabelsi", specialty: "Pédiatre", phone: "+216 98 222 333" },
  { id: 3, name: "Dr. Hichem Ben", specialty: "Cardiologue", phone: "+216 22 444 555" },
];

export default function Doctors() {
  const navigate = useNavigate();

  return (
    <ReceptionistTemplate
      title="Médecins"
      breadcrumbs={[{ label: "Accueil réception", to: "/reception" }, { label: "Médecins", current: true }]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Médecins</h2>
            <p className="text-sm text-slate-500 mt-1">Liste des médecins enregistrés et accès rapide à leurs emplois du temps.</p>
          </div>
          <button onClick={()=>navigate('/reception/doctors/new')} className="px-3 py-2 rounded-md bg-sky-600 text-white text-sm">Ajouter</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {doctors.map(d => (
            <div key={d.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-semibold">
                {d.name.split(' ').map(s=>s[0]).slice(0,2).join('')}
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-800">{d.name}</div>
                <div className="text-sm text-slate-500">{d.specialty}</div>
                <div className="text-xs text-slate-400 mt-1">{d.phone}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={()=>navigate(`/reception/appointments?doctorId=${d.id}`)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border text-sm text-slate-700">
                  <Calendar className="w-4 h-4" /> Voir emploi du temps
                </button>
                <Link to={`/reception/medecin/${d.id}`} className="text-xs text-slate-500 underline">Profil</Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </ReceptionistTemplate>
  );
}
