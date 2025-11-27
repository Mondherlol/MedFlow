// components/Patient/modals/EditDisposModal.jsx
import React, { useState } from "react";
import MiniCalendar from "./NewConsultationRequest/MiniCalendar";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { X, Clock } from "lucide-react";

export default function EditDisposModal({ request, onClose }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState(request.patient_options || []);

  function toggleSlot(slot) {
    const exists = slots.some(
      (s) => s.date === slot.date && s.start === slot.start
    );
    if (exists) setSlots(slots.filter((s) => !(s.date === slot.date && s.start === slot.start)));
    else setSlots([...slots, slot]);
  }

  async function save() {
    try {
      await api.patch(`/api/consultation-requests/${request.id}/`, {
        patient_options: slots,
      });
      toast.success("Disponibilités mises à jour");
      onClose();
      window.location.reload();
    } catch (err) {
      toast.error("Erreur lors de la sauvegarde");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xl space-y-4">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Modifier mes disponibilités</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* MINI CALENDAR */}
        <MiniCalendar
          availableDates={[...new Set(slots.map((s) => s.date))]}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />

        {/* SLOTS LIST */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-700">
            Créneaux sélectionnés :
          </h3>

          {slots.length === 0 && (
            <div className="text-xs text-slate-500">Aucun créneau sélectionné</div>
          )}

          {slots.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 bg-slate-50 border rounded-lg text-xs"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>
                  {s.date} • {s.start} → {s.end}
                </span>
              </div>

              <button
                onClick={() =>
                  setSlots(slots.filter((x) => !(x.date === s.date && x.start === s.start)))
                }
                className="text-rose-600 text-xs"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600">
            Annuler
          </button>
          <button
            onClick={save}
            className="px-4 py-2 text-sm rounded-lg bg-slate-900 text-white"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
