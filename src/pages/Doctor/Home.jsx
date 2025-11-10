import React, { useState } from 'react';
import {
  Calendar, Clock, User, Users, CheckCircle, XCircle,
  Edit2, Search, ChevronRight, Plus
} from 'lucide-react';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';

// Page d'accueil pour le médecin — données statiques pour l'instant
const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock data — remplaçable par des appels API plus tard
  const appointmentsToday = [
    { id: 1, time: '08:30', patient: 'Martin Dupont', reason: 'Contrôle', status: 'confirmed' },
    { id: 2, time: '09:15', patient: 'Sophie Leroux', reason: 'Douleur thoracique', status: 'confirmed' },
    { id: 3, time: '10:00', patient: 'Julien Marchand', reason: 'Consultation', status: 'cancelled' },
    { id: 4, time: '11:30', patient: 'Laura Petit', reason: 'Suivi', status: 'confirmed' },
  ];

  const weekOverview = [
    { day: 'Lun', date: '10', appts: 4 },
    { day: 'Mar', date: '11', appts: 3 },
    { day: 'Mer', date: '12', appts: 5 },
    { day: 'Jeu', date: '13', appts: 2 },
    { day: 'Ven', date: '14', appts: 6 },
    { day: 'Sam', date: '15', appts: 0 },
    { day: 'Dim', date: '16', appts: 0 },
  ];

  const [availability, setAvailability] = useState([
    { id: 1, slot: '08:00 - 09:00', available: true },
    { id: 2, slot: '09:00 - 10:00', available: true },
    { id: 3, slot: '10:00 - 11:00', available: false },
    { id: 4, slot: '11:00 - 12:00', available: true },
    { id: 5, slot: '14:00 - 15:00', available: true },
    { id: 6, slot: '15:00 - 16:00', available: false },
  ]);

  const pastAppointments = [
    { id: 101, date: '2025-10-01', patient: 'Aline Roy', note: 'Examen OK' },
    { id: 102, date: '2025-10-03', patient: 'Marc Blond', note: 'Radiologie demandée' },
    { id: 103, date: '2025-10-08', patient: 'Nora Salim', note: 'Rendez-vous contrôle' },
  ];

  const patients = [
    { id: 201, name: 'Martin Dupont', age: 42 },
    { id: 202, name: 'Sophie Leroux', age: 34 },
    { id: 203, name: 'Julien Marchand', age: 28 },
    { id: 204, name: 'Laura Petit', age: 50 },
  ];

  function toggleAvailability(id) {
    setAvailability((prev) => prev.map(s => s.id === id ? { ...s, available: !s.available } : s));
  }

  return (
  <div className="min-h-[80dvh] bg-linear-to-b from-slate-50 to-slate-100/40 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Espace médecin</h1>
            <p className="text-sm text-slate-500 mt-1">Vue synthétique de votre journée, vos patients et vos disponibilités.</p>
          </div>
          <div className="text-sm text-slate-600">
            Bonjour,&nbsp;<span className="font-medium text-slate-900">{user?.full_name || 'Docteur'}</span>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left column: Today */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Calendar size={18} />
                  <h2 className="text-lg font-semibold text-slate-900">Rendez-vous — Aujourd'hui</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-sm bg-slate-50">Semaine</button>
                  <button className="inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-sm bg-white">Jour</button>
                </div>
              </div>

              <ul className="space-y-3">
                {appointmentsToday.map(a => (
                  <li key={a.id} className="flex items-center justify-between gap-4 p-3 rounded-lg border border-slate-100 hover:shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-14 text-sm text-slate-700 font-medium">{a.time}</div>
                      <div>
                        <div className="font-semibold text-slate-900">{a.patient}</div>
                        <div className="text-sm text-slate-500">{a.reason}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {a.status === 'confirmed' ? (
                        <span className="inline-flex items-center gap-2 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md text-sm"><CheckCircle size={16} /> Confirmé</span>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-rose-700 bg-rose-50 px-2 py-1 rounded-md text-sm"><XCircle size={16} /> Annulé</span>
                      )}
                      <button onClick={() => navigate(`/doctor/appointments/${a.id}`)} className="text-slate-400 hover:text-slate-600"><ChevronRight /></button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Week overview */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Clock size={18} />
                  <h3 className="text-lg font-semibold text-slate-900">Semaine</h3>
                </div>
                <div className="text-sm text-slate-500">Total: {weekOverview.reduce((s, d) => s + d.appts, 0)} rdv</div>
              </div>

              <div className="grid grid-cols-7 gap-3">
                {weekOverview.map(d => (
                  <div key={d.day} className="text-center p-3 rounded-lg border border-slate-100 bg-slate-50">
                    <div className="text-sm text-slate-600">{d.day}</div>
                    <div className="font-semibold text-slate-900">{d.date}</div>
                    <div className="text-xs text-slate-500 mt-1">{d.appts} rdv</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Past appointments */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Users size={18} />
                  <h3 className="text-lg font-semibold text-slate-900">Anciens rendez-vous</h3>
                </div>
                <div className="text-sm text-slate-500">Historique récent</div>
              </div>

              <ul className="divide-y">
                {pastAppointments.map(p => (
                  <li key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900">{p.patient}</div>
                      <div className="text-sm text-slate-500">{p.date} — {p.note}</div>
                    </div>
                    <button onClick={() => navigate(`/doctor/appointments/${p.id}`)} className="text-slate-400 hover:text-slate-600"><ChevronRight /></button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column: Availability & Patients */}
          <aside>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Edit2 size={18} />
                  <h3 className="text-lg font-semibold text-slate-900">Disponibilités</h3>
                </div>
                <button className="inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm bg-slate-50">Ajouter <Plus size={14} /></button>
              </div>

              <div className="space-y-2">
                {availability.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded-md border border-slate-100">
                    <div className="text-sm text-slate-700">{s.slot}</div>
                    <button onClick={() => toggleAvailability(s.id)} className={`px-2 py-1 rounded text-sm ${s.available ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {s.available ? 'Disponible' : 'Indisponible'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <User size={18} />
                  <h3 className="text-lg font-semibold text-slate-900">Patients</h3>
                </div>
                <div className="relative">
                  <input placeholder="Rechercher" className="pl-8 pr-3 py-1 rounded-md border text-sm" />
                  <div className="absolute left-2 top-1.5 text-slate-400"><Search size={14} /></div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {patients.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-md border border-slate-100">
                    <div>
                      <div className="font-medium text-slate-900">{p.name}</div>
                      <div className="text-sm text-slate-500">Âge: {p.age}</div>
                    </div>
                    <button onClick={() => navigate(`/doctor/patients/${p.id}`)} className="text-slate-400 hover:text-slate-600"><ChevronRight /></button>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <footer className="mt-10 text-sm text-slate-500">
          <p>Rappel&nbsp;: ceci est une vue statique. Les actions comme l'ajout d'une disponibilité ou la modification d'un rendez-vous doivent être reliées à l'API côté serveur ultérieurement.</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
