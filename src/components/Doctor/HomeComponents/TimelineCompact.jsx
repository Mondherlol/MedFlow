import { Clock } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { timeToMin, minToTime, nowMinutes } from "../../../utils/timeUtils";

function TimelineCompact({ consultations = [], start = 8, end = 18, step = 30, onSelectTime }) {
  const containerRef = useRef(null);
  const slotRefs = useRef({});
  const nowMin = useMemo(() => nowMinutes(), []);

  const slots = useMemo(() => {
    const arr = [];
    for (let h = start; h < end; h++) {
      for (let m = 0; m < 60; m += step) {
        arr.push(minToTime(h * 60 + m));
      }
    }
    return arr;
  }, [start, end, step]);

  // consultations grouped by slot
  const bySlot = useMemo(() => {
    const map = {};
    consultations.forEach((c) => {
      const time = c.heure_debut;
      map[time] ??= [];
      map[time].push(c);
    });
    return map;
  }, [consultations]);

  // auto-scroll centré sur l'heure actuelle 
  useEffect(() => {
    let bestIdx = 0;
    let bestDiff = Infinity;
    slots.forEach((s, i) => {
      const diff = Math.abs(timeToMin(s) - nowMin);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestIdx = i;
      }
    });
    const key = slots[bestIdx];
    const el = slotRefs.current[key];
    if (el && containerRef.current) {
      // scroll the container so the element is centered without moving the page
      const container = containerRef.current;
      const top = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
      container.scrollTo({ top, behavior: "smooth" });
    } else if (containerRef.current) {
      containerRef.current.scrollTop = Math.max(0, bestIdx * 48 - 120);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 h-[72vh] overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-sky-600"><Clock /></div>
          <div>
            <div className="text-sm font-semibold">Timeline — Aujourd'hui</div>
            <div className="text-xs text-slate-400">Vue compacte (scroll interne)</div>
          </div>
        </div>
        <div className="text-xs text-slate-400">{consultations.length} RDV</div>
      </div>

      <div ref={containerRef} className="overflow-auto h-[calc(100%-56px)] pr-2">
        <div className="space-y-2">
            {slots.map((t) => {
            const evs = bySlot[t] || [];
            const isNow = Math.abs(timeToMin(t) - nowMin) <= step;
            return (
              <div
                key={t}
                ref={(el) => (slotRefs.current[t] = el)}
                onClick={() => onSelectTime?.(t, evs)}
                className={`flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition
                  ${isNow ? "bg-sky-100 ring-2 ring-sky-200 shadow" : "hover:bg-slate-50"}`}
              >
                <div className="w-14 text-xs text-slate-500">{t}</div>

                <div className="flex-1 grid grid-cols-12 gap-2">
                  <div className="col-span-12">
                    {evs.length === 0 ? (
                      <div className="text-xs text-slate-300">—</div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {evs.map((consultation) => {
                          const duration = Math.round(
                            (timeToMin(consultation.heure_fin) - timeToMin(consultation.heure_debut))
                          );
                          return (
                            <div
                              key={consultation.id}
                              className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition
                                ${consultation.statusConsultation === "annule" ? "bg-red-50 text-red-700 border border-red-100" : "bg-sky-50 text-sky-800 border border-sky-100"}
                              `}
                            >
                              <div className="truncate max-w-40">{consultation.patient?.full_name || "Patient"}</div>
                              <div className="text-xs text-slate-400">{duration}m</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


export default TimelineCompact;