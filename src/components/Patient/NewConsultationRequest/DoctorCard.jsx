import React from 'react';
import { getImageUrl } from '../../../utils/image.jsx';

export default function DoctorCard({ doctor, onSelect }) {
  const name = doctor.user?.full_name || 'Médecin';
  const initials =
    name
      .split(' ')
      .map((s) => s[0] || '')
      .slice(0, 2)
      .join('') || 'MD';
  const specialite = doctor.specialite || 'Médecin généraliste';
  const salle = doctor.numero_salle ? `Salle ${doctor.numero_salle}` : '—';
  const price =
    doctor.tarif_consultation != null ? `${doctor.tarif_consultation} TND` : 'Prix variable';

  return (
    <article
      onClick={() => onSelect(doctor)}
      className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-slate-200 cursor-pointer transition-all duration-300"
    >
      <div className="relative">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600 border border-slate-200 group-hover:border-slate-400 transition">
          {doctor.user?.photo_url ? (
            <img src={getImageUrl(doctor.user.photo_url)} alt={name} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <span className="absolute -bottom-1 -right-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
          {price}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-semibold text-slate-900">{name}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{specialite}</p>
        <p className="text-[11px] text-slate-400 mt-1">{salle}</p>
      </div>

      <button
        type="button"
        className="px-4 py-2 rounded-full text-xs font-medium bg-slate-900 text-white opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transform-gpu group-hover:scale-105 transition-all duration-300"
      >
        Choisir
      </button>
    </article>
  );
}
