import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReceptionistTemplate from "../../components/Reception/ReceptionTemplate";
import { 
  Calendar, Clock, User, ChevronLeft, CheckCircle, 
  Loader2, AlertCircle, Sparkles, MapPin
} from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { getSpecialiteDisplay } from "../../utils/specialite";
import { getImageUrl } from "../../utils/image";
import { useClinic } from "../../context/clinicContext";
import WeekCalendar from "../../components/Calendar/WeekCalendar";
import { formatDateYMD, getMonday } from "../../utils/dateUtils";

export default function ScheduleRequest() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const {clinic} = useClinic();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [request, setRequest] = useState(null);
  const [horaires, setHoraires] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loadingHoraires, setLoadingHoraires] = useState(false);
  const [loadingConsultations, setLoadingConsultations] = useState(false);
  
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [consultationProvisoire, setConsultationProvisoire] = useState({
    date: null,
    start: null,
    title: "",
    duree: 15,
  });
  
  // Charger la demande et les horaires du médecin
  useEffect(() => {
    if(!requestId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Charger la demande
        const reqRes = await api.get(`/api/consultation-requests/${requestId}/`);
        const requestData = reqRes.data;
        setRequest(requestData);

        // Charger les horaires du médecin
        if (requestData.doctor?.id) {
          setLoadingHoraires(true);
          const schedRes = await api.get(`/api/doctors/${requestData.doctor.id}/schedules/`);
          setHoraires(schedRes.data.data || []);
          setLoadingHoraires(false);

          // Charger les consultations du médecin pour la semaine en cours
          fetchConsultationsByDoctorBetweenDates(requestData.doctor.id);
        }
      } catch (err) {
        console.error("Erreur lors du chargement:", err);
        toast.error("Impossible de charger la demande");
        navigate("/reception/requests");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [requestId, navigate]);

  // Charger les consultations quand on change de semaine
  useEffect(() => {
    if (request?.doctor?.id) {
      fetchConsultationsByDoctorBetweenDates(request.doctor.id);
    }
  }, [weekStart, request?.doctor?.id]);

  const fetchConsultationsByDoctorBetweenDates = async (doctorId) => {
    setLoadingConsultations(true);
    try {
      const startDate = formatDateYMD(weekStart);
      const endDate = formatDateYMD(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6));
      const res = await api.get(`/api/consultations/by-doctor/?doctor=${doctorId}&week_start=${startDate}&week_end=${endDate}&perPage=100`);
      if (res.data?.data) setConsultations(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger les consultations du médecin");
    } finally {
      setLoadingConsultations(false);
    }
  };

  const availabilityForCalendar = useMemo(() => {
    return horaires.map((s) => ({ id: s.id, weekday: s.weekday, slots: s.slots }));
  }, [horaires]);

  // Superposer les préférences du patient sur le calendrier
  const patientOptionsOverlay = useMemo(() => {
    if (!request?.patient_options) return [];
    
    return request.patient_options.map(opt => ({
      id: `patient-pref-${opt.date}-${opt.start}`,
      date: opt.date,
      start: opt.start,
      end: opt.end,
      title: "🕐 Préférence patient",
      patient: request.patient,
      isPatientPreference: true
    }));
  }, [request?.patient_options]);

  const handleConfirm = async () => {
    if (!consultationProvisoire?.date || !consultationProvisoire?.start) {
      toast.error("Veuillez sélectionner un créneau sur le calendrier");
      return;
    }

    setSubmitting(true);
    try {
      await api.patch(`/api/consultation-requests/${requestId}/approve/`, {
        date: consultationProvisoire.date,
        start: consultationProvisoire.start
      });
      
      toast.success("Rendez-vous programmé avec succès !");
      navigate("/reception/requests");
    } catch (err) {
      console.error("Erreur lors de la programmation:", err);
      toast.error(err?.response?.data?.message || "Erreur lors de la programmation");
    } finally {
      setSubmitting(false);
    }
  };

  function prevWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(getMonday(d));
  }

  function nextWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(getMonday(d));
  }

  if (loading) {
    return (
      <ReceptionistTemplate
        title="Programmer le rendez-vous"
        breadcrumbs={[
          { label: "Demandes", to: "/reception/requests" },
          { label: "Programmer", current: true }
        ]}
      >
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-sky-600 animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Chargement...</p>
        </div>
      </ReceptionistTemplate>
    );
  }

  if (!request) {
    return null;
  }

  const doctor = request.doctor || {};
  const patient = request.patient || {};
  const patientName = patient.full_name || patient.first_name || "Patient";
  const doctorName = doctor.full_name || "Médecin";
  const specialty = getSpecialiteDisplay(doctor.specialite);
  const hasPatientPreferences = request.patient_options && request.patient_options.length > 0;

  // Générer les 14 prochains jours
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  return (
    <ReceptionistTemplate
      title="Programmer le rendez-vous"
      breadcrumbs={[
        { label: "Demandes", to: "/reception/requests" },
        { label: "Programmer", current: true }
      ]}
    >
      <div className="space-y-6">
        {/* Header avec infos de la demande */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start gap-4">
            {/* Avatar patient */}
            <div className="shrink-0">
              {patient.photo_url ? (
                <img 
                  src={getImageUrl(patient.photo_url)} 
                  alt={patientName}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-sky-100"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-sky-100 to-blue-100 flex items-center justify-center text-lg font-bold text-sky-700">
                  {patientName.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">{patientName}</h2>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                <User className="w-4 h-4" />
                <span>Rendez-vous avec <strong>{doctorName}</strong></span>
                {specialty && <span className="text-slate-400">· {specialty}</span>}
              </div>
              
              {request.auto_diagnostic && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Diagnostic IA disponible
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/reception/requests")}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium text-sm hover:bg-slate-50 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </button>
          </div>

          {/* Préférences patient */}
          {hasPatientPreferences && (
            <div className="mt-4 p-3 rounded-lg bg-sky-50 border border-sky-200">
              <div className="flex items-center gap-2 text-sm font-semibold text-sky-900 mb-2">
                <AlertCircle className="w-4 h-4" />
                Créneaux préférés par le patient ({request.patient_options.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {request.patient_options.map((opt, idx) => (
                  <div key={idx} className="px-2.5 py-1 rounded-md bg-white border border-sky-200 text-xs text-sky-800">
                    {new Date(opt.date).toLocaleDateString('fr-FR', { 
                      weekday: 'short', 
                      day: '2-digit', 
                      month: 'short' 
                    })} · {opt.start} - {opt.end}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Calendrier hebdomadaire avec emploi du médecin */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              Emploi du temps - {doctorName}
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={prevWeek} 
                className="px-3 py-1.5 rounded-md bg-slate-50 hover:bg-slate-100 text-sm font-medium transition"
              >
                ← Semaine précédente
              </button>
              <button 
                onClick={nextWeek} 
                className="px-3 py-1.5 rounded-md bg-slate-50 hover:bg-slate-100 text-sm font-medium transition"
              >
                Semaine suivante →
              </button>
            </div>
          </div>

          <WeekCalendar
            weekStart={weekStart}
            onPrevWeek={prevWeek}
            onNextWeek={nextWeek}
            hours={{ start: 8, end: 18 }}
            slotMinutes={15}
            consultations={[...consultations, ...patientOptionsOverlay]}
            availability={availabilityForCalendar}
            loading={loadingHoraires || loadingConsultations}
            onChange={() => { toast("Vous ne pouvez pas décaler ce RDV.", {icon: "☹️"}); }}
            consultationProvisoire={consultationProvisoire}
            setConsultationProvisoire={setConsultationProvisoire}
          />

          {hasPatientPreferences && (
            <div className="mt-4 flex items-center gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-100 border border-amber-400" />
                <span>Préférences patient</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-300" />
                <span>Créneau sélectionné</span>
              </div>
            </div>
          )}
        </div>

        {/* Formulaire flottant de confirmation */}
        {consultationProvisoire?.date && consultationProvisoire?.start && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50 w-full max-w-4xl px-4">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 p-5 transition-transform transform hover:-translate-y-0.5">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                {/* Info patient */}
                <div className="flex items-center gap-3 min-w-0 md:min-w-[220px]">
                  <div className="h-14 w-14 rounded-full bg-sky-50 grid place-items-center text-sky-700 shrink-0">
                    {patient.photo_url ? (
                      <img 
                        src={getImageUrl(patient.photo_url)} 
                        alt={patientName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500">Patient</div>
                    <div className="font-semibold text-slate-900 truncate">{patientName}</div>
                  </div>
                </div>

                {/* Date et heure */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Date</div>
                    <div className="font-medium text-slate-900">
                      {new Date(consultationProvisoire.date).toLocaleDateString('fr-FR', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Heure</div>
                    <div className="font-medium text-slate-900">{consultationProvisoire.start}</div>
                  </div>
                </div>

                {/* Médecin */}
                <div className="flex-1">
                  <div className="text-xs text-slate-500 mb-1">Médecin</div>
                  <div className="font-medium text-slate-900 truncate">{doctorName}</div>
                  <div className="text-xs text-slate-500">
                    {doctor.duree_consultation || 30} min · {doctor.tarif_consultation || '—'} TND
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex items-center gap-2 justify-end shrink-0">
                  <button
                    onClick={() => setConsultationProvisoire({ date: null, start: null, title: "", duree: 15 })}
                    className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium text-sm hover:bg-slate-50 transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Programmation...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Confirmer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Récapitulatif détaillé (caché quand le formulaire flottant est visible) */}
        {!consultationProvisoire?.date && !consultationProvisoire?.start && (
          <div className="bg-sky-50 rounded-xl border border-sky-200 p-5 text-center">
            <Clock className="w-12 h-12 text-sky-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Sélectionnez un créneau sur le calendrier
            </h3>
            <p className="text-xs text-slate-600">
              Cliquez sur un emplacement disponible pour programmer le rendez-vous
            </p>
          </div>
        )}
      </div>
    </ReceptionistTemplate>
  );
}
