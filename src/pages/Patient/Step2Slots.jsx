import { Calendar } from "lucide-react";
import MiniCalendar from "../../components/Patient/NewConsultationRequest/MiniCalendar";
import SlotsGrid from "../../components/Patient/NewConsultationRequest/SlotsGrid";
import { getImageUrl } from "../../utils/image";
import { getSpecialiteDisplay } from "../../utils/specialite";
import { useMemo, useState, useEffect  } from "react";


const DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">
            Médecin sélectionné
          </div>
          <div className="mt-2 flex items-center gap-4">
          <img src={getImageUrl(selectedDoctor?.user?.photo_url)} alt={selectedDoctor?.user?.full_name || "Médecin"} className="w-12 h-12 rounded-full object-cover mt-3" />
          <div className="flex flex-col ">
             <div className="mt-1 text-sm font-semibold text-slate-900">
              {selectedDoctor?.user?.full_name || "—"}
            </div>
            <div className="text-xs text-slate-500">
              {getSpecialiteDisplay(selectedDoctor?.specialite) || "Médecin"}
          </div>

          </div>
           
          </div>
          
        </div>

        <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="self-start md:self-auto px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          Modifier le médecin
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

        
        <div className="space-y-4">
                  <div className="border-t border-slate-100 pt-3 space-y-3">
            <div className="text-xs font-medium text-slate-500">
              Options de sélection
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">

                 <label className="inline-flex cursor-pointer items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 transition">
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


              <button
                type="button"
                onClick={() => addDayRanges(selectedDate)}
                disabled={!selectedDate}
                className="px-3 cursor-pointer py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition transform-gpu hover:shadow-sm hover:-translate-y-0.5"
              >
                Toute la journée  
              </button>

           
            </div>
          </div>
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
              Créneaux choisis ({(patientOptions || []).length})
            </div>

            {noPreference && (
                <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                  Vous avez indiqué ne pas avoir de préférence de créneau.
                </div>
              )}
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
              
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2">
            <div className="text-xs text-slate-600">
              Prix estimé :{" "}
              <strong>
                {selectedDoctor?.tarif_consultation +" TND" || "—"}
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
export default Step2Slots;