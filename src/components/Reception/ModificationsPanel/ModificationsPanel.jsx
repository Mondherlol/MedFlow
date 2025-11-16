import React, { useMemo, useState } from "react";
import { RotateCw, ChevronUp, ChevronDown, ArrowRight, CalendarSync } from "lucide-react";
import { getImageUrl } from "../../../utils/image.jsx";

/**
 * ModificationsPanel (version avec meilleur affichage des dates)
 */
export default function ModificationsPanel({
  modified = {},
  onRevertModification,
}) {
  const items = useMemo(() => Object.values(modified || {}), [modified]);
  const [open, setOpen] = useState(true);

  if (!items.length) return null;

  const toggleOpen = () => setOpen((v) => !v);

  const truncateId = (id, n = 8) => {
    if (!id) return "";
    const s = String(id);
    return s.length > n ? `${s.slice(0, n)}…` : s;
  };

  // ----- Helpers pour formatage des dates en français -----
  const parseDateTime = (input) => {
    if (!input) return null;
    if (input instanceof Date) return input;
    let s = String(input).trim();
    // support "YYYY-MM-DD HH:MM" -> "YYYY-MM-DDTHH:MM" (ISO-like)
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s)) s = s.replace(" ", "T");
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

  const formatDateParts = (raw) => {
    const d = parseDateTime(raw);
    if (!d) return { dateLabel: "—", timeLabel: "" };

    // date: "Lundi 15 nov." (Intl returns lowercase month + trailing dot normally)
    const dateFmt = new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
    const timeFmt = new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const dateLabel = capitalize(dateFmt.format(d)); // capitalize first letter
    const timeLabel = timeFmt.format(d).replace(".", ""); // remove possible trailing dot
    return { dateLabel, timeLabel };
  };

  return (
    <>
      {/* Floating toggle */}
      <div className="fixed right-6 bottom-6 z-40 flex items-end" aria-live="polite">
        <button
          onClick={toggleOpen}
          aria-expanded={open}
          title={open ? "Réduire le panneau" : "Ouvrir le panneau"}
          className="group relative flex items-center gap-3 rounded-full bg-white/95 backdrop-blur-sm shadow-lg p-3 hover:scale-105 transition-transform"
        >
          <CalendarSync className="w-5 h-5 text-slate-700" />
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-medium text-slate-800">Modifs</span>
            <span className="text-[11px] text-slate-500">{items.length} en attente</span>
          </div>

          <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-semibold leading-none text-white bg-rose-600 rounded-full">
            {items.length}
          </span>

          <span className="ml-1">
            {open ? <ChevronDown className="w-4 h-4 text-slate-600" /> : <ChevronUp className="w-4 h-4 text-slate-600" />}
          </span>
        </button>
      </div>

      {/* Panel */}
      <div
        className={`fixed right-6 bottom-28 z-50 w-80 sm:w-96 transition-all duration-200 ease-out ${open ? "opacity-100 translate-y-0" : "opacity-0 pointer-events-none translate-y-4"}`}
        role="region"
        aria-label="Panneau des modifications"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <CalendarSync className="w-5 h-5 text-slate-700" />
              <div>
                <div className="text-sm font-semibold text-slate-800">Modifications</div>
                <div className="text-xs text-slate-500">{items.length} élément{items.length > 1 ? "s" : ""}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpen(false)}
                title="Réduire"
                className="p-1 rounded-md hover:bg-slate-100"
                aria-label="Réduire le panneau"
              >
                <ChevronDown className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="max-h-[55vh] overflow-y-auto p-3 space-y-3">
            {items.map((m, idx) => {
                console.log("Modification item:", m);
              const idKey = m.modified?.id ?? m.id ?? idx;
              const title =
                m.original?.patient?.full_name ||
                m.modified?.patient?.full_name ||
                `RDV #${m.modified?.id ?? m.id ?? "?"}`;
              const origRaw = m.original?.date || m.original?.jour || [m.original?.start, m.original?.start_time].filter(Boolean).join(" ") || m.original?.heure_debut || "";
              const modRaw = m.modified?.date || m.modified?.jour || [m.modified?.start, m.modified?.start_time].filter(Boolean).join(" ") || m.modified?.heure_debut || "";

              const orig = formatDateParts(origRaw);
              const mod = formatDateParts(modRaw);

              const key = `${idKey}-${idx}`;
              const truncated = truncateId(idKey, 8);

              return (
                <div key={key} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:shadow-sm transition-shadow bg-white">
                  <div className="flex-shrink-0">
                    {(() => {
                      const patientPhoto = m.modified?.patient?.photo_url || m.original?.patient?.photo_url;
                      if (patientPhoto) {
                        return (
                          <img
                            src={getImageUrl(patientPhoto)}
                            alt={title}
                            className="w-9 h-9 rounded-md object-cover"
                          />
                        );
                      }

                      return (
                        <div className="w-9 h-9 flex items-center justify-center rounded-md bg-gradient-to-br from-indigo-50 to-sky-50 text-indigo-600 font-medium">
                          {String(title || "R").slice(0, 2).toUpperCase()}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-medium text-slate-800 truncate">{title}</div>

                              {/* Compact action: move cancel button to top-right */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onRevertModification && onRevertModification(idKey)}
                                  className="inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100"
                                  title="Annuler la modification"
                                  aria-label={`Annuler modification ${String(idKey)}`}
                                >
                                  <RotateCw className="w-4 h-4" />
                                  <span className="text-[11px]">Annuler</span>
                                </button>
                              </div>
                            </div>

                    {/* NEW: improved date comparison display (reduced spacing) */}
                    <div className="mt-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      {/* From column */}
                      <div className="flex flex-col items-start">
                        <div className="text-[11px] text-slate-400">De</div>
                        <div className="mt-1 text-sm font-semibold text-slate-800">{orig.dateLabel}</div>
                        <div className="mt-0.5 text-lg font-medium text-sky-600">{orig.timeLabel || "—"}</div>
                      </div>

                      {/* Arrow */}
                      <div className="flex items-center justify-center px-1">
                        <ArrowRight className="w-5 h-5 text-slate-300" />
                      </div>

                      {/* To column */}
                      <div className="flex flex-col items-end">
                        <div className="text-[11px] text-slate-400">À</div>
                        <div className="mt-1 text-sm font-semibold text-slate-800">{mod.dateLabel}</div>
                        <div className="mt-0.5 text-lg font-medium text-sky-600">{mod.timeLabel || "—"}</div>
                      </div>
                    </div>

                    {/* (Action moved to header for compactness) */}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 px-3 py-2 border-t border-slate-100">
            <div className="text-xs text-slate-500">Actions rapides</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  items.forEach((m) => {
                    const idKey = m.modified?.id ?? m.id;
                    if (onRevertModification) onRevertModification(idKey);
                  });
                }}
                className="text-xs px-3 py-1.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100"
              >
                Tout annuler
              </button>

              <button
                onClick={() => setOpen(false)}
                className="text-xs px-3 py-1.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
