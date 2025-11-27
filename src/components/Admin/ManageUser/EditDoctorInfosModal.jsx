import React, { useEffect, useState } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import api from '../../../api/axios';
import { useClinic } from '../../../context/clinicContext';

export default function EditDoctorInfosModal({ isOpen, onClose, doctorRecord, onSaved }) {
  if (!isOpen) return null;
  const { clinic } = useClinic();
  const [specialite, setSpecialite] = useState(doctorRecord?.specialite || '');
  const [numero_salle, setNumeroSalle] = useState(doctorRecord?.numero_salle || '');
  const [bio, setBio] = useState(doctorRecord?.bio || '');
  const [duree_consultation, setDureeConsultation] = useState(doctorRecord?.duree_consultation || '');
  const [tarif_consultation, setTarifConsultation] = useState(doctorRecord?.tarif_consultation || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSpecialite(doctorRecord?.specialite || '');
    setNumeroSalle(doctorRecord?.numero_salle || '');
    setBio(doctorRecord?.bio || '');
    setDureeConsultation(doctorRecord?.duree_consultation || '');
    setTarifConsultation(doctorRecord?.tarif_consultation || '');
  }, [doctorRecord]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctorRecord) return;
    setLoading(true);
    try {
      const form = new FormData();
      if (specialite !== (doctorRecord.specialite || '')) form.append('specialite', specialite);
      if (numero_salle !== (doctorRecord.numero_salle || '')) form.append('numero_salle', numero_salle);
      if (bio !== (doctorRecord.bio || '')) form.append('bio', bio);
      if (duree_consultation !== (doctorRecord.duree_consultation || '')) form.append('duree_consultation', duree_consultation);
      if (tarif_consultation !== (doctorRecord.tarif_consultation || '')) form.append('tarif_consultation', tarif_consultation);
      form.append('clinic_id', clinic?.id);

      if (Array.from(form.keys()).length === 1 && form.get('clinic_id')) {
        onClose();
        setLoading(false);
        return;
      }

      await api.patch(`/api/doctors/${doctorRecord.id}/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onSaved?.();
      onClose();
    } catch (err) {
      console.error('Error updating doctor infos', err);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">Infos médecin</h3>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Spécialité</label>
            <select value={specialite} onChange={(e) => setSpecialite(e.target.value)} className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-sky-200">
              <option value="">-- Aucune --</option>
              <option value="Cardiology">Cardiologie</option>
              <option value="Pulmonology">Pneumologie</option>
              <option value="Neurology">Neurologie</option>
              <option value="Dermatology">Dermatologie</option>
              <option value="Pediatrics">Pédiatrie</option>
              <option value="Gynecology">Gynécologie</option>
              <option value="Orthopedics">Orthopédie</option>
              <option value="Endocrinology">Endocrinologie</option>
              <option value="Gastroenterology">Gastroentérologie</option>
              <option value="Urology">Urologie</option>
              <option value="Ophthalmology">Ophtalmologie</option>
              <option value="Other">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Numéro de salle</label>
            <input value={numero_salle} onChange={(e) => setNumeroSalle(e.target.value)} className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm" rows={4} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Durée consultation (min)</label>
              <input type="number" value={duree_consultation} onChange={(e) => setDureeConsultation(e.target.value)} className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Tarif consultation</label>
              <input type="number" value={tarif_consultation} onChange={(e) => setTarifConsultation(e.target.value)} className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm hover:bg-slate-50">Annuler</button>
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-80">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
