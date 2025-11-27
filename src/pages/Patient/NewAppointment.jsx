import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Calendar, Search, CheckCircle } from "lucide-react";
import { useClinic } from "../../context/clinicContext";
import { useAuth } from "../../context/authContext";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { getImageUrl } from "../../utils/image.jsx";
import Stepper from "../../components/Patient/NewConsultationRequest/Stepper";
import DoctorCard from "../../components/Patient/NewConsultationRequest/DoctorCard";
import MiniCalendar from "../../components/Patient/NewConsultationRequest/MiniCalendar";
import SlotsGrid from "../../components/Patient/NewConsultationRequest/SlotsGrid";

// ===== Helpers temps =====
const toMin = (hhmm) => {
  const [h = 0, m = 0] = (hhmm || "00:00").split(":").map(Number);
  return h * 60 + m;
};

const toHHMM = (min) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60)
    .toString()
    .padStart(2, "0")}`;

const DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

function getDoctorStatusKey(d) {
  if (d.on_leave || d.status === "leave") return "leave";
  if (
    d.currently_in_consultation ||
    d.status === "busy" ||
    d.status === "consulting"
  )
    return "busy";
  if (d.is_available || d.status === "available") return "available";
  return "unknown";
}

// Génère les créneaux disponibles (clinique) pour les N prochains jours
const generateSlots = (schedulesArr, daysAhead = 14, slotLength = 30) => {
  const slots = [];
  const now = new Date();
  for (let d = 0; d < daysAhead; d++) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + d
    );
    const weekday = date.getDay(); // 0 = dimanche
    const mapWeekday = weekday === 0 ? 6 : weekday - 1; // 0 = lundi
    const daySchedule =
      (schedulesArr || [])[mapWeekday] || { open: false, slots: [] };
    if (!daySchedule.open) continue;

    (daySchedule.slots || []).forEach((interval) => {
      const startMin = toMin(interval.start);
      const endMin = toMin(interval.end);
      for (let t = startMin; t + slotLength <= endMin; t += slotLength) {
        const start = toHHMM(t);
        const end = toHHMM(t + slotLength);
        const isoDate = date.toISOString().slice(0, 10);
        slots.push({
          date: isoDate,
          start,
          end,
          label: `${isoDate} • ${start} - ${end}`,
        });
      }
    });
  }
  return slots;
};

// ================== UI Components ==================

// Skeleton carte médecin
function DoctorSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white animate-pulse">
      <div className="w-14 h-14 rounded-full bg-slate-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
      </div>
      <div className="w-20 h-8 bg-slate-200 rounded-full" />
    </div>
  );
}

// Étape 1 : liste médecins
function Step1DoctorsList({ doctors, loading, query, setQuery, onSelect }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 rounded-xl bg-slate-100">
            <Search className="w-5 h-5 text-slate-500" />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un médecin ou une spécialité"
            className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => <DoctorSkeleton key={i} />)}

        {!loading &&
          (doctors || []).map((d) => (
            <DoctorCard key={d.id} doctor={d} onSelect={onSelect} />
          ))}

        {!loading && (!doctors || doctors.length === 0) && (
          <div className="text-sm text-slate-500">
            Aucun médecin trouvé pour cette clinique.
          </div>
        )}
      </div>
    </div>
  );
}

// MiniCalendar component moved to separated file

// SlotsGrid component moved to separated file

// Étape 2 : choix créneau + options
function Step2Slots({
  selectedDoctor,
  schedules,
  availableSlots,
  setStep,
  clinic,
  patientOptions,
  setPatientOptions,
  noPreference,
  setNoPreference,
}) {
  const dates = useMemo(
    () => Array.from(new Set((availableSlots || []).map((s) => s.date))),
    [availableSlots]
  );

  const [selectedDate, setSelectedDate] = useState(dates[0] || null);

  useEffect(() => {
    if (dates.length && !selectedDate) {
      setSelectedDate(dates[0]);
    }
  }, [dates, selectedDate]);

  const formatRangeDay = (iso) => {
    const d = new Date(iso + "T00:00:00");
    const dayName = DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1];
    return `${dayName} ${iso}`;
  };

  const slotsForDate =
    selectedDate && availableSlots
      ? availableSlots.filter((s) => s.date === selectedDate)
      : [];

  const isSelected = (slot) =>
    (patientOptions || []).some(
      (o) =>
        o.date === slot.date && o.start === slot.start && o.end === slot.end
    );

  const toggleSlot = (slot) => {
    const exists = isSelected(slot);
    if (exists) {
      setPatientOptions((p = []) =>
        p.filter(
          (o) =>
            !(o.date === slot.date && o.start === slot.start && o.end === slot.end)
        )
      );
    } else {
      setPatientOptions((p = []) => [...p, slot]);
    }
    if (noPreference) setNoPreference(false);
  };

  const addDayRanges = (iso) => {
    if (!iso) return;
    const d = new Date(iso + "T00:00:00");
    const weekday = d.getDay();
    const mapWeekday = weekday === 0 ? 6 : weekday - 1;
    const daySchedule =
      (schedules || [])[mapWeekday] || { open: false, slots: [] };
    const ranges = (daySchedule.slots || []).map((s) => ({
      date: iso,
      start: s.start,
      end: s.end,
    }));
    setPatientOptions((p = []) => {
      const merged = [...p];
      ranges.forEach((r) => {
        const found = merged.find(
          (x) =>
            x.date === r.date && x.start === r.start && x.end === r.end
        );
        if (!found) merged.push(r);
      });
      return merged;
    });
    if (noPreference) setNoPreference(false);
  };

  const removeOption = (opt) =>
    setPatientOptions((p = []) =>
      p.filter(
        (o) =>
          !(o.date === opt.date && o.start === opt.start && o.end === opt.end)
      )
    );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 space-y-6">
      {/* Bandeau médecin sélectionné */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">
            Médecin sélectionné
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {selectedDoctor?.user?.full_name || "—"}
          </div>
          <div className="text-xs text-slate-500">
            {selectedDoctor?.specialite || "Médecin"}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setStep(1)}
          className="self-start md:self-auto px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          Modifier le médecin
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] gap-6">
        {/* Colonne calendrier */}
        <div className="space-y-3">
          <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            Sélectionner une date disponible
          </div>

          {dates.length === 0 ? (
            <p className="text-sm text-slate-500 mt-2">
              Aucun créneau disponible dans les prochains jours.
            </p>
          ) : (
            <MiniCalendar
              availableDates={dates}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          )}

          {selectedDate && (
            <p className="text-[11px] text-slate-500 mt-2">
              Date sélectionnée :{" "}
              <span className="font-medium">{formatRangeDay(selectedDate)}</span>
            </p>
          )}
        </div>

        {/* Colonne créneaux + options */}
        <div className="space-y-4">
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">
              Créneaux disponibles
            </div>
            <SlotsGrid
              slots={slotsForDate}
              toggleSlot={toggleSlot}
              isSelected={isSelected}
            />
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-3">
            <div className="text-xs font-medium text-slate-500">
              Options de sélection
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="button"
                onClick={() => addDayRanges(selectedDate)}
                disabled={!selectedDate}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition transform-gpu hover:shadow-sm hover:-translate-y-0.5"
              >
                Sélectionner toute la plage horaire du jour
              </button>

              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 transition">
                <input
                  type="checkbox"
                  className="rounded-sm border-slate-300"
                  checked={noPreference}
                  onChange={(e) => {
                    setNoPreference(e.target.checked);
                    if (e.target.checked) setPatientOptions([]);
                  }}
                />
                <span>Aucune préférence de créneau</span>
              </label>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-3">
            <div className="text-xs font-medium text-slate-500">
              Créneaux choisis ({(patientOptions || []).length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(patientOptions || []).map((o, idx) => (
                <div
                  key={`${o.date}-${o.start}-${idx}`}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <span className="text-slate-700">
                    {o.date} • {o.start} - {o.end}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeOption(o)}
                    className="text-[11px] text-red-500 hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
              {(patientOptions || []).length === 0 && !noPreference && (
                <div className="text-xs text-slate-500">
                  Aucun créneau sélectionné.
                </div>
              )}
              {noPreference && (
                <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                  Vous avez indiqué ne pas avoir de préférence de créneau.
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2">
            <div className="text-xs text-slate-600">
              Prix estimé :{" "}
              <strong>
                {selectedDoctor?.consultation_price
                  ? `${selectedDoctor.consultation_price}€`
                  : clinic?.consultation_price
                  ? `${clinic.consultation_price}€`
                  : "À définir"}
              </strong>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition transform-gpu hover:shadow-sm hover:-translate-y-0.5"
              >
                Retour
              </button>
              <button
                type="button"
                disabled={!noPreference && (!patientOptions || !patientOptions.length)}
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition transform-gpu hover:shadow-md hover:scale-[1.02]"
              >
                Étape suivante
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Étape 3 : confirmation & IA
function Step3Confirm({
  user,
  selectedDoctor,
  patientOptions,
  noPreference,
  wantIA,
  iaNotes,
  setWantIA,
  setIaNotes,
  submitting,
  submitRequest,
  setStep,
  clinic,
}) {
  const contactEmail = user?.email || "—";
  const contactPhone = user?.phone || user?.phone_number || "—";

  const slotsSummary = () => {
    if (noPreference) return "Pas de préférence de créneau";
    if (!patientOptions || !patientOptions.length)
      return "Aucun créneau sélectionné";
    return patientOptions
      .map((s) => `${s.date} • ${s.start}-${s.end}`)
      .join(" | ");
  };

  const estimatedPrice = selectedDoctor?.consultation_price
    ? `${selectedDoctor.consultation_price}€`
    : clinic?.consultation_price
    ? `${clinic.consultation_price}€`
    : "À définir";

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne infos patient */}
        <div className="space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Vos informations
            </div>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p>
                Nom :{" "}
                <strong>{user?.first_name || user?.full_name || "—"}</strong>
              </p>
              <p>
                Email : <strong>{contactEmail}</strong>
              </p>
              <p>
                Téléphone : <strong>{contactPhone}</strong>
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 rounded-sm border-slate-300"
                checked={wantIA}
                onChange={(e) => setWantIA(e.target.checked)}
              />
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  Ajouter une analyse IA (optionnel)
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Une brève description de vos symptômes sera ajoutée à votre
                  dossier et pourra aider le médecin lors de la consultation.
                </p>
              </div>
            </label>

            {wantIA && (
              <textarea
                value={iaNotes}
                onChange={(e) => setIaNotes(e.target.value)}
                rows={5}
                className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition px-3 py-2 outline-none"
                placeholder="Décrivez brièvement vos symptômes, leur durée, et toute information importante."
              />
            )}
          </div>
        </div>

        {/* Colonne récap */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Récapitulatif de la demande
            </div>
            <div className="space-y-2 text-sm text-slate-700">
              <p>
                Médecin :{" "}
                <strong>{selectedDoctor?.user?.full_name || "—"}</strong>
              </p>
              <p>
                Spécialité :{" "}
                <strong>{selectedDoctor?.specialite || "—"}</strong>
              </p>
              <p>
                Créneaux : <strong>{slotsSummary()}</strong>
              </p>
              <p>
                Prix estimé : <strong>{estimatedPrice}</strong>
              </p>
              <p className="text-xs text-slate-500 pt-1">
                Vous serez contacté par la clinique pour confirmer le créneau
                définitif.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2 text-xs text-slate-500">
            <p>
              En envoyant cette demande, vous autorisez la clinique à vous
              contacter par email ou téléphone pour confirmer un rendez-vous.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition transform-gpu hover:shadow-sm hover:-translate-y-0.5"
            >
              Retour
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={submitRequest}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center gap-2 transform-gpu hover:shadow-lg hover:-translate-y-0.5"
            >
              {submitting && (
                <span className="w-3 h-3 rounded-full border-2 border-white/50 border-t-transparent animate-spin" />
              )}
              Confirmer et envoyer la demande
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================== Page principale ==================

export default function NewAppointment() {
  const navigate = useNavigate();
  const { clinic } = useClinic() || {};
  const { user } = useAuth() || {};
  const [searchParams] = useSearchParams();
  const doctorParam = searchParams.get("doctor");

  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [patientOptions, setPatientOptions] = useState([]);
  const [noPreference, setNoPreference] = useState(false);

  const [wantIA, setWantIA] = useState(false);
  const [iaNotes, setIaNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // chargement médecins + horaires
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

        const byWeek = {};
        raw.forEach((s) => {
          if (!s) return;
          const w = Number(s.weekday);
          byWeek[w] = {
            ...s,
            weekday: w,
            slots: Array.isArray(s.slots) ? s.slots : [],
          };
        });
        const normalized = Array.from({ length: 7 }).map(
          (_, i) => byWeek[i] ?? { weekday: i, open: false, slots: [] }
        );

        setDoctors(Array.isArray(dr) ? dr : []);
        setSchedules(normalized);

        if (doctorParam) {
          const found = (Array.isArray(dr) ? dr : []).find(
            (x) => String(x.id) === String(doctorParam)
          );
          if (found) {
            setSelectedDoctor(found);
            setStep(2);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors du chargement des médecins/horaires");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [clinic, doctorParam]);

  // calcul des créneaux quand médecin choisi
  useEffect(() => {
    if (!selectedDoctor) {
      setAvailableSlots([]);
      return;
    }
    const all = generateSlots(schedules, 14, 30);
    setAvailableSlots(all);
  }, [selectedDoctor, schedules]);

  // compression des créneaux en plages par date
  const compressSlotsToRanges = (options = []) => {
    const byDate = {};
    options.forEach((o) => {
      if (!o || !o.date) return;
      byDate[o.date] = byDate[o.date] || [];
      const s = toMin(o.start);
      const e = toMin(o.end);
      byDate[o.date].push([s, e]);
    });

    const out = [];
    Object.keys(byDate).forEach((date) => {
      const ranges = byDate[date].sort((a, b) => a[0] - b[0]);
      const merged = [];
      ranges.forEach((r) => {
        if (!merged.length) merged.push([...r]);
        else {
          const last = merged[merged.length - 1];
          if (r[0] <= last[1]) {
            last[1] = Math.max(last[1], r[1]);
          } else {
            merged.push([...r]);
          }
        }
      });
      merged.forEach((m) =>
        out.push({ date, start: toHHMM(m[0]), end: toHHMM(m[1]) })
      );
    });
    return out;
  };

  const filteredDoctors = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = doctors || [];
    if (q) {
      arr = arr.filter(
        (d) =>
          (d.user?.full_name || "").toLowerCase().includes(q) ||
          (d.specialite || "").toLowerCase().includes(q)
      );
    }
    return arr;
  }, [doctors, query]);

  function validateContact() {
    const email = user?.email || "";
    const phone = user?.phone || user?.phone_number || "";
    const emailOk = /\S+@\S+\.\S+/.test(email);
    const phoneOk = phone && phone.length >= 6;
    return { email, phone, emailOk, phoneOk };
  }

  const submitRequest = async () => {
    if (!selectedDoctor) return toast.error("Sélectionnez un médecin");
    if (!noPreference && (!patientOptions || patientOptions.length === 0)) {
      return toast.error(
        "Sélectionnez au moins un créneau ou choisissez 'Aucune préférence'"
      );
    }
    const contact = validateContact();
    if (!contact.emailOk || !contact.phoneOk) {
      return toast.error(
        "Vérifiez votre email et téléphone dans votre profil"
      );
    }

    setSubmitting(true);
    try {
      const payload = {
        doctor: String(selectedDoctor.id),
        patient_options: noPreference
          ? []
          : compressSlotsToRanges(patientOptions),
        want_ai: wantIA,
        ai_notes: wantIA ? iaNotes : "",
      };

      await api.post(`/api/consultation-requests/`, payload);
      setDone(true);
      toast.success("Demande envoyée — vous serez contacté bientôt.");
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          "Erreur lors de l'envoi de la demande"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-[60vh] p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-lg border border-slate-100 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900">
            Demande envoyée
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Votre demande a bien été transmise. La clinique vous contactera
            rapidement pour confirmer un rendez-vous.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => navigate("/patient")}
              className="px-4 py-2 rounded-xl bg-slate-900 text-xs font-medium text-white hover:bg-slate-800 transition transform-gpu hover:shadow-md hover:-translate-y-0.5"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80dvh] bg-slate-50/60 px-4 py-6 md:px-8 md:py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
              Prendre un rendez-vous
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Suivez les étapes pour envoyer une demande de consultation
              personnalisée.
            </p>
          </div>
          <div className="text-xs text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
            Clinique :{" "}
            <strong className="text-slate-900">
              {clinic?.name || "—"}
            </strong>
          </div>
        </header>

        <Stepper step={step} />

        {step === 1 && (
          <Step1DoctorsList
            doctors={filteredDoctors}
            loading={loading}
            query={query}
            setQuery={setQuery}
            onSelect={(d) => {
              setSelectedDoctor(d);
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <Step2Slots
            selectedDoctor={selectedDoctor}
            schedules={schedules}
            availableSlots={availableSlots}
            setStep={setStep}
            clinic={clinic}
            patientOptions={patientOptions}
            setPatientOptions={setPatientOptions}
            noPreference={noPreference}
            setNoPreference={setNoPreference}
          />
        )}

        {step === 3 && (
          <Step3Confirm
            user={user}
            selectedDoctor={selectedDoctor}
            patientOptions={patientOptions}
            noPreference={noPreference}
            wantIA={wantIA}
            iaNotes={iaNotes}
            setWantIA={setWantIA}
            setIaNotes={setIaNotes}
            submitting={submitting}
            submitRequest={submitRequest}
            setStep={setStep}
            clinic={clinic}
          />
        )}
      </div>
    </div>
  );
}
