import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { useClinic } from "../../context/clinicContext";
import { useAuth } from "../../context/authContext";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Stepper from "../../components/Patient/NewConsultationRequest/Stepper";
import Step3Confirm from "./Step3Confirm.jsx";
import Step1DoctorsList from "./Step1DoctorList.jsx";
import Step2Slots from "./Step2Slots.jsx";

const toMin = (hhmm) => {
  const [h = 0, m = 0] = (hhmm || "00:00").split(":").map(Number);
  return h * 60 + m;
};

const toHHMM = (min) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60)
    .toString()
    .padStart(2, "0")}`;

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
  const [autoDiagnosticId, setAutoDiagnosticId] = useState(null);

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
      
      // Ajouter l'ID du diagnostic IA si disponible
      if (autoDiagnosticId) {
        payload.auto_diagnostic = autoDiagnosticId;
      }

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
            autoDiagnosticId={autoDiagnosticId}
            setAutoDiagnosticId={setAutoDiagnosticId}
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
