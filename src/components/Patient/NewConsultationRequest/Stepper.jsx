import React from 'react';

export default function Stepper({ step }) {
  const items = [
    { id: 1, label: 'Choisir médecin' },
    { id: 2, label: 'Choisir créneau' },
    { id: 3, label: 'Options & confirmation' },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {items.map((item, index) => {
        const active = step === item.id;
        const done = step > item.id;

        return (
          <div key={item.id} className="flex items-center flex-1">
            <div
              className={`w-9 h-9 flex items-center justify-center rounded-full text-xs font-semibold transition-all duration-300
                ${
                  done
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : active
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-200 text-slate-600'
                }`}
            >
              {done ? '✓' : item.id}
            </div>

            <div className="ml-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">
                Étape {item.id}
              </div>
              <div className="text-sm font-medium text-slate-700">
                {item.label}
              </div>
            </div>

            {index < items.length - 1 && (
              <div
                className={`hidden md:block flex-1 h-[2px] mx-4 rounded-full transition-all ${
                  step > item.id ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
