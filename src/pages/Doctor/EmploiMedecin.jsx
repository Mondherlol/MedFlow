// src/pages/doctor/EmploiMedecin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import WeekCalendarDnD from "../../components/Calendar/WeekCalendar";
import { useAuth } from "../../context/authContext";
import { useClinic } from "../../context/clinicContext";
import { formatDateYMD, getMonday } from "../../utils/dateUtils";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function EmploiMedecin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { clinic, theme } = useClinic();
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [schedules, setSchedules] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [loadingConsultations, setLoadingConsultations] = useState(false);

  const onPrevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(getMonday(d));
  };

  const onNextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(getMonday(d));
  };

  const handleChange = (updated) => {
    // TODO: sync API (PUT /api/consultations/:id { date, heure_debut, heure_fin })
    console.log("Consultation modified:", updated);
    toast("Modification non sauvegardée (mode consultation seulement)");
  };

  const handleEventClick = (consultation) => {
    // Redirect to consultation details page
    navigate(`/doctor/consultation/${consultation.id}`, {
      state: { consultation }
    });
  };

  // Fetch schedules for the doctor
  async function fetchSchedules(doctorId) {
    try {
      setLoadingSchedules(true);
      const res = await api.get(`/api/doctors/${doctorId}/schedules/`);
      const arr = res.data?.data || res.data || [];

      if (arr.length === 0) {
        // Get default clinic schedules if doctor has none
        const resClinic = await api.get(`/api/clinics/${user?.clinic?.id}/schedules/`);
        const arrClinic = resClinic.data?.data || resClinic.data || [];
        arr.push(...arrClinic);
      }

      setSchedules(arr.map(s => ({ id: s.id, weekday: s.weekday, slots: s.slots })));
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger les horaires du médecin");
    } finally {
      setLoadingSchedules(false);
    }
  }

  // Fetch consultations for the current week
  async function fetchConsultations(doctorId, startDate, endDate) {
    try {
      setLoadingConsultations(true);
      const formattedStart = formatDateYMD(new Date(startDate));
      const formattedEnd = formatDateYMD(new Date(endDate));
      const res = await api.get(
        `/api/consultations/by-doctor/?doctor=${doctorId}&week_start=${formattedStart}&week_end=${formattedEnd}&perPage=200`
      );
      const fetched = res.data?.data || res.data || [];
      setConsultations(fetched);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger les consultations");
    } finally {
      setLoadingConsultations(false);
    }
  }

  // Load schedules and consultations when component mounts or week changes
  useEffect(() => {
    if (!user?.doctor?.id) return;
    
    fetchSchedules(user.doctor.id);
    
    const start = formatDateYMD(weekStart);
    const end = formatDateYMD(
      new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6)
    );
    fetchConsultations(user.doctor.id, start, end);
  }, [user, weekStart]);



  const availabilityForCalendar = useMemo(() => {
    return (schedules || []).map((s) => ({ id: s.id, weekday: s.weekday, slots: s.slots }));
  }, [schedules]);

  return (
    <div className="min-h-[80dvh] bg-linear-to-b from-slate-50 to-slate-100/40 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Mon Emploi du Temps</h1>
          <p className="text-sm text-slate-500">
            Bonjour, <span className="font-medium text-slate-900">{user?.doctor?.user?.full_name || user?.full_name || "Docteur"}</span>
          </p>
        </header>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <WeekCalendarDnD
            weekStart={weekStart}
            onPrevWeek={onPrevWeek}
            onNextWeek={onNextWeek}
            hours={{ start: 8, end: 18 }}
            slotMinutes={15}
            consultations={consultations}
            availability={availabilityForCalendar}
            loading={loadingSchedules || loadingConsultations}
            onChange={handleChange}
            onEventClick={handleEventClick}
            editMode={false}
            doctorMode={true}
            theme={theme}
          />
        </div>

        <p className="text-xs text-slate-500">
          Cliquez sur un rendez-vous pour voir les détails de la consultation.
        </p>
      </div>
    </div>
  );
}
