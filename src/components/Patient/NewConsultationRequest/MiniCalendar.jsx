import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export default function MiniCalendar({ availableDates, selectedDate, setSelectedDate }) {
  const [current, setCurrent] = useState(() => new Date());

  const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
  const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
  const daysInMonth = Array.from(
    { length: monthEnd.getDate() },
    (_, i) => new Date(current.getFullYear(), current.getMonth(), i + 1, 12, 0, 0)
  );

  const isAvailable = (d) => availableDates.includes(d.toISOString().slice(0, 10));

  const goPrevMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1, 12, 0, 0));
  const goNextMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1, 12, 0, 0));

  return (
    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={goPrevMonth} className="p-1.5 rounded-full hover:bg-slate-200 transition">
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>

        <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <Calendar className="w-4 h-4 text-slate-500" />
          {current.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
        </div>

        <button type="button" onClick={goNextMonth} className="p-1.5 rounded-full hover:bg-slate-200 transition">
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-400 mb-1">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: (monthStart.getDay() || 7) - 1 }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {daysInMonth.map((d) => {
          const iso = d.toISOString().slice(0, 10);
          const available = isAvailable(d);
          const active = selectedDate === iso;

          return (
            <button
              key={iso}
              type="button"
              disabled={!available}
              onClick={() => setSelectedDate(iso)}
              className={`h-8 text-xs rounded-full flex items-center justify-center transition
                ${!available ? 'text-slate-300 cursor-default' : 'hover:bg-slate-200 text-slate-700'}
                ${active && available ? 'bg-slate-900 text-white hover:bg-slate-900' : ''}`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
