import dayjs from "dayjs";
import "dayjs/locale/fr";

dayjs.locale("fr");

export default function SlotList({ slots = [] }) {
  // Group by date
  const grouped = slots.reduce((acc, slot) => {
    if (!slot || !slot.date) return acc;
    acc[slot.date] = acc[slot.date] || [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  const days = Object.keys(grouped).sort();

  return (
    <div className="space-y-3">
      {days.length === 0 && (
        <div className="text-sm text-slate-500">Aucun créneau disponible.</div>
      )}

      {days.map((day) => {
        const prettyDate = dayjs(day).format("ddd D MMM");
        const count = (grouped[day] || []).length;

        return (
          <div
            key={day}
            className="bg-white rounded-md border border-slate-200 p-3 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2 gap-3">
              <div className="text-sm font-medium text-slate-800 capitalize">
                {prettyDate}
              </div>
              <div className="text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                {count} créneau{count > 1 ? "x" : ""}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {grouped[day].map((slot, i) => (
                <div
                  key={i}
                  className="text-[11px] text-slate-700 bg-slate-50 border border-slate-100 rounded-md px-2 py-1 text-center"
                >
                  {slot.start} — {slot.end}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
