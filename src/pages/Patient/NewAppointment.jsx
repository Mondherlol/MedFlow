import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Search, Phone, Activity, CheckCircle, XCircle } from "lucide-react";
import { useClinic } from "../../context/clinicContext";
import { useAuth } from "../../context/authContext";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { getImageUrl } from "../../utils/image.jsx";

// helpers (copied/adapted)
const toMin = (hhmm) => {
  const [h = 0, m = 0] = (hhmm || "00:00").split(":").map(Number);
  return h * 60 + m;
};
const toHHMM = (min) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:
${String(min % 60).padStart(2, "0")}`.replace("\n", "");

  const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

function getDoctorStatusKey(d) {
  if (d.on_leave || d.status === "leave") return "leave";
  if (d.currently_in_consultation || d.status === "busy" || d.status === "consulting") return "busy";
  if (d.is_available || d.status === "available") return "available";
  return "unknown";
}

export default function NewAppointment() {
  const navigate = useNavigate();
  const { clinic, theme } = useClinic() || {};
  const { user } = useAuth() || {};

  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  // step: 1 select doctor, 2 select slot, 3 optional IA & confirm
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]); // [{date, start, end, label}]
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [wantIA, setWantIA] = useState(false);
  const [iaNotes, setIaNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!clinic?.id) return;
    setLoading(true);
    const fetchAll = async () => {
      try {
        const [drRes, schRes] = await Promise.all([
          api.get(`/api/clinics/${clinic.id}/doctors/`),
          api.get(`/api/clinics/${clinic.id}/schedules/`),
        ]);
        const dr = drRes?.data?.data ?? drRes?.data ?? [];
        const raw = schRes?.data?.data ?? schRes?.data ?? [];
        // normalize schedules into array indexed by weekday
        const byWeek = {};
        raw.forEach((s) => {
          if (!s) return;
          const w = Number(s.weekday);
          byWeek[w] = { ...s, weekday: w, slots: Array.isArray(s.slots) ? s.slots : [] };
        });
        const normalized = Array.from({ length: 7 }).map((_, i) => byWeek[i] ?? { weekday: i, open: false, slots: [] });
        setDoctors(Array.isArray(dr) ? dr : []);
        setSchedules(normalized);
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors du chargement des médecins/horaires");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [clinic]);

  // generate available slots for next N days using clinic schedules
  const generateSlots = (schedulesArr, daysAhead = 14, slotLength = 30) => {
    const slots = [];
    const now = new Date();
    for (let d = 0; d < daysAhead; d++) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
      const weekday = date.getDay(); // 0 Sunday - but schedules earlier use 0 = Lundi; adjust
      // Our DAYS constant earlier in Horaires uses 0 = Lundi. Convert JS getDay(): 0 Sunday -> 6, 1 Monday->0
      const mapWeekday = weekday === 0 ? 6 : weekday - 1;
      const daySchedule = (schedulesArr || [])[mapWeekday] || { open: false, slots: [] };
      if (!daySchedule.open) continue;
      (daySchedule.slots || []).forEach((interval) => {
        const startMin = toMin(interval.start);
        const endMin = toMin(interval.end);
        for (let t = startMin; t + slotLength <= endMin; t += slotLength) {
          const start = toHHMM(t);
          const end = toHHMM(t + slotLength);
          const isoDate = date.toISOString().slice(0, 10);
          slots.push({ date: isoDate, start, end, label: `${isoDate} • ${start} - ${end}` });
        }
      });
    }
    return slots;
  };

  // when doctor chosen, compute available slots (we could also filter by doctor's own availability)
  useEffect(() => {
    if (!selectedDoctor) return setAvailableSlots([]);
    const all = generateSlots(schedules, 14, 30);
    // if doctor not available, don't show actionable slots (but still show)
    setAvailableSlots(all);
  }, [selectedDoctor, schedules]);

  const filteredDoctors = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = doctors || [];
    if (q) arr = arr.filter((d) => (d.user?.full_name || "").toLowerCase().includes(q) || (d.specialite || "").toLowerCase().includes(q));
    return arr;
  }, [doctors, query]);

  function validateContact() {
    // check email and phone basic
    const email = user?.email || "";
    const phone = user?.phone || user?.phone_number || "";
    const emailOk = /\S+@\S+\.\S+/.test(email);
    const phoneOk = phone && phone.length >= 6;
    return { email, phone, emailOk, phoneOk };
  }

  const submitRequest = async () => {
    if (!selectedDoctor || !selectedSlot) return toast.error("Sélectionnez médecin et créneau");
    const contact = validateContact();
    if (!contact.emailOk || !contact.phoneOk) return toast.error("Vérifiez votre email et téléphone dans votre profil");
    setSubmitting(true);
    try {
      const payload = {
        doctor: String(selectedDoctor.id),
        patient_options: [
          { date: selectedSlot.date, start: selectedSlot.start, end: selectedSlot.end },
        ],
      };
      const res = await api.post(`/api/consultation-requests/`, payload);
      // optionally attach IA result — for now only structure: if wantIA true, we could POST to another endpoint later
      setDone(true);
      toast.success("Demande envoyée — vous serez contacté bientôt");
      // optionally clear
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message ?? "Erreur lors de l'envoi de la demande");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-[60vh] p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow">
          <CheckCircle className="w-12 h-12 text-emerald-500 mb-4" />
          <h2 className="text-xl font-semibold">Demande envoyée</h2>
          <p className="text-sm text-slate-600 mt-2">Votre demande a bien été transmise. Nous vous contacterons rapidement pour confirmer le rendez-vous.</p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => navigate('/patient')} className="px-4 py-2 rounded-lg bg-slate-900 text-white">Retour au tableau de bord</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80dvh] p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Prendre un rendez-vous</h1>
            <p className="text-sm text-slate-500">Suivez les étapes pour soumettre une demande de consultation.</p>
          </div>
          <div className="text-sm text-slate-500">Clinique: <strong>{clinic?.name || '—'}</strong></div>
        </header>

        {/* Steps header */}
        <div className="flex items-center gap-4">
          <div className={`px-3 py-2 rounded-lg ${step===1? 'bg-slate-900 text-white':'bg-slate-50 text-slate-600'}`}>1. Choisir médecin</div>
          <div className={`px-3 py-2 rounded-lg ${step===2? 'bg-slate-900 text-white':'bg-slate-50 text-slate-600'}`}>2. Choisir créneau</div>
          <div className={`px-3 py-2 rounded-lg ${step===3? 'bg-slate-900 text-white':'bg-slate-50 text-slate-600'}`}>3. Options & confirmation</div>
        </div>

        {/* Step 1: doctors list */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-5 h-5 text-slate-400" />
              <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Rechercher médecin" className="flex-1 py-2 px-3 rounded-lg border" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loading && <div>Chargement...</div>}
              {!loading && filteredDoctors.map((d) => {
                const name = d.user?.full_name || 'Médecin';
                const initials = name.split(' ').map(s=>s[0]||'').slice(0,2).join('') || 'MD';
                return (
                  <article key={d.id} className={`flex items-center gap-4 p-4 rounded-lg border hover:shadow cursor-pointer`} onClick={()=> (setSelectedDoctor(d), setStep(2))}>
                    <div className="w-14 h-14 rounded-full grid place-items-center text-white font-semibold text-lg" style={{backgroundColor: theme?.primary|| '#06b6d4'}}>
                      {d.user?.photo_url ? <img src={getImageUrl(d.user.photo_url)} alt={name} className="w-14 h-14 rounded-full object-cover" /> : initials}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{name}</div>
                      <div className="text-sm text-slate-500">{d.specialite || 'Général'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">{d.numero_salle ? `Salle ${d.numero_salle}` : '—'}</div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: slots */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-slate-500">Médecin sélectionné</div>
                <div className="font-semibold">{selectedDoctor?.user?.full_name}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=> setStep(1)} className="px-3 py-2 rounded-lg border">Modifier médecin</button>
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-500 mb-2">Choisissez un créneau disponible</div>

              {/* Group slots by date for a cleaner UI */}
              {availableSlots.length === 0 && <div className="text-sm text-slate-500">Aucun créneau disponible dans les prochains jours.</div>}

              {availableSlots.length > 0 && (() => {
                const grouped = availableSlots.reduce((acc, s) => {
                  (acc[s.date] = acc[s.date] || []).push(s);
                  return acc;
                }, {});

                const formatDate = (iso) => {
                  const d = new Date(iso + 'T00:00:00');
                  const dayName = DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1];
                  return `${dayName} ${iso}`;
                };

                // helper to find schedule ranges for a date
                const getDayScheduleRanges = (iso) => {
                  const d = new Date(iso + 'T00:00:00');
                  const weekday = d.getDay();
                  const mapWeekday = weekday === 0 ? 6 : weekday - 1;
                  const daySchedule = (schedules || [])[mapWeekday] || { open: false, slots: [] };
                  return daySchedule.slots?.map(s => `${s.start} - ${s.end}`).join(', ');
                };

                return Object.keys(grouped).map((date) => (
                  <div key={date} className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{formatDate(date)}</div>
                      <div className="text-xs text-slate-500">{getDayScheduleRanges(date) || 'Horaires non définis'}</div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {grouped[date].map((s) => {
                        const isSelected = selectedSlot && selectedSlot.date === s.date && selectedSlot.start === s.start;
                        return (
                          <button key={`${s.date}-${s.start}`} onClick={()=> setSelectedSlot(s)} className={`text-left p-2 rounded-lg border ${isSelected? 'bg-sky-50 border-sky-300':'bg-white'}`}>
                            <div className="font-medium">{s.start} - {s.end}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-slate-600">Prix estimé: <strong>{selectedDoctor?.consultation_price ? `${selectedDoctor.consultation_price}€` : (clinic?.consultation_price ? `${clinic.consultation_price}€` : 'À définir')}</strong></div>
              <div className="flex gap-2">
                <button onClick={()=> setStep(1)} className="px-4 py-2 rounded-lg border">Retour</button>
                <button disabled={!selectedSlot} onClick={()=> setStep(3)} className="px-4 py-2 rounded-lg bg-slate-900 text-white">Étape suivante</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: IA option & confirm */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-slate-500">Vérifiez vos informations</div>
                <div className="mt-3">
                  <div className="text-sm">Nom: <strong>{user?.first_name || user?.full_name}</strong></div>
                  <div className="text-sm">Email: <strong>{user?.email || '—'}</strong></div>
                  <div className="text-sm">Téléphone: <strong>{user?.phone || user?.phone_number || '—'}</strong></div>
                </div>

                <div className="mt-6">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={wantIA} onChange={(e)=> setWantIA(e.target.checked)} />
                    <div>
                      <div className="font-medium">Ajouter un diagnostic IA (optionnel)</div>
                      <div className="text-xs text-slate-500">Si activé, vous pourrez fournir des symptômes et un rapport sera ajouté à votre dossier.</div>
                    </div>
                  </label>
                </div>

                {wantIA && (
                  <div className="mt-4">
                    <textarea value={iaNotes} onChange={(e)=> setIaNotes(e.target.value)} placeholder="Décrivez vos symptômes (courte description)" className="w-full p-3 border rounded-lg" rows={5}></textarea>
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm text-slate-500">Récapitulatif</div>
                <div className="mt-3 p-4 rounded-lg border bg-slate-50">
                  <div className="text-sm">Médecin: <strong>{selectedDoctor?.user?.full_name}</strong></div>
                  <div className="text-sm">Créneau: <strong>{selectedSlot?.label}</strong></div>
                  <div className="text-sm">Prix estimé: <strong>{selectedDoctor?.consultation_price ? `${selectedDoctor.consultation_price}€` : (clinic?.consultation_price ? `${clinic.consultation_price}€` : 'À définir')}</strong></div>
                  <div className="text-sm mt-2">Contact: <strong>{user?.email} • {user?.phone || user?.phone_number}</strong></div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button onClick={()=> setStep(2)} className="px-4 py-2 rounded-lg border">Retour</button>
                  <button disabled={submitting} onClick={submitRequest} className="px-4 py-2 rounded-lg bg-emerald-600 text-white">Confirmer & envoyer la demande</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
