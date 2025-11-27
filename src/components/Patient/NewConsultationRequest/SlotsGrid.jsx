import React from 'react';

export default function SlotsGrid({ slots, toggleSlot, isSelected }) {
  if (!slots || !slots.length) {
    return (
      <div className="text-sm text-slate-500">
        Choisissez une date avec des créneaux disponibles dans le calendrier.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 mt-2">
      {slots.map((s) => {
        const selected = isSelected(s);
        return (
          <button
            key={`${s.date}-${s.start}`}
            type="button"
            onClick={() => toggleSlot(s)}
            className={`text-left p-3 rounded-xl border text-xs transition-all transform-gpu
              ${selected ? 'bg-emerald-50 border-emerald-300 shadow-sm scale-100' : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:scale-[1.02]'}
            `}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">{s.start} – {s.end}</span>
              {selected && <span className="text-[10px] text-emerald-600 ml-2">✓</span>}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">{s.label.split(' • ')[0]}</div>
          </button>
        );
      })}
    </div>
  );
}
