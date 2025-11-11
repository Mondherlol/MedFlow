// src/components/calendar/WeekCalendarDnD.jsx
import React, { useMemo, useRef, useState, useCallback } from "react";
import { DndContext, useSensor, useSensors, PointerSensor, DragOverlay } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { ChevronLeft, ChevronRight } from "lucide-react";

import RdvCard from "../Calendar/RdvCard.jsx";
import DayColumn from "./DayColumn.jsx";

/**
 * Props:
 * - weekStart: Date (lundi)
 * - onPrevWeek(): void
 * - onNextWeek(): void
 * - hours: { start: number, end: number }
 * - slotMinutes: number
 * - events: [{ id, dayIndex, start:"HH:MM", duration, title, status? }]
 * - availability?: [{ id, dayIndex, start, end }]
 * - onChange(updatedEvents)
 * - theme?: { primary, secondary }
 */
export default function WeekCalendarDnD({
  weekStart,
  onPrevWeek,
  onNextWeek,
  hours = { start: 8, end: 18 },
  slotMinutes = 15,
  events = [],
  availability = [],
  onChange,
  theme = {},
}) {
  const primary = theme?.primary || "#0ea5e9";
  const secondary = theme?.secondary || "#0f172a";

  // Grille
  const SLOT_HEIGHT = 20;
  const pxPerMinute = SLOT_HEIGHT / slotMinutes;
  const totalMinutes = (hours.end - hours.start) * 60;
  const dayColsRef = useRef([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  // Utils temps
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const toMinutes = useCallback(
    (hhmm) => {
      const [h, m] = (hhmm || "00:00").split(":").map((n) => parseInt(n, 10));
      return (h - hours.start) * 60 + (m || 0);
    },
    [hours.start]
  );
  const fromMinutes = useCallback(
    (min) => {
      const abs = hours.start * 60 + min;
      const h = Math.floor(abs / 60);
      const m = abs % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    },
    [hours.start]
  );
  const snap = (min) => Math.round(min / slotMinutes) * slotMinutes;

  const days = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [weekStart]);

  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const fmt = (d) =>
    d
      .toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
      .replace(".", "");

  // Drag state
  const [draggingId, setDraggingId] = useState(null);
  const [ghost, setGhost] = useState(null);
  const [overDayIndex, setOverDayIndex] = useState(null);
  const [overMinutes, setOverMinutes] = useState(null);

  // Refs pour éviter les setState inutiles (anti-lag / anti-loop)
  const prevOverDayIndexRef = useRef(null);
  const prevOverMinutesRef = useRef(null);
  const prevGhostStartRef = useRef(null);

  const findEvent = useCallback(
    (id) => events.find((e) => e.id === id),
    [events]
  );

  // Y relatif du draggable dans une colonne
  const getRelativeY = (e, colEl) => {
    if (!colEl || !e?.active?.rect?.current) return 0;
    const rectCol = colEl.getBoundingClientRect();
    const translatedTop =
      e.active.rect.current.translated?.top ??
      e.active.rect.current.initial.top + (e.delta?.y || 0);
    let y = translatedTop - rectCol.top;
    return clamp(y, 0, rectCol.height);
  };

  const eventPositionFromDrag = (e, dayIdx) => {
    const col = dayColsRef.current[dayIdx];
    const y = getRelativeY(e, col);
    const minutes = snap(clamp(Math.round(y / pxPerMinute), 0, totalMinutes));
    return { dayIndex: dayIdx, minutes };
  };

  const handleDragStart = (e) => {
    const id = e.active?.id;
    if (!id) return;
    setDraggingId(id);
    const ev = findEvent(id);
    if (ev) setGhost(ev);
  };

  const handleDragMove = (e) => {
    if (!draggingId) return;
    const base = findEvent(draggingId);
    if (!base) return;

    const overIdx = e.over?.data?.current?.dayIndex;
    if (overIdx == null) return;

    const pos = eventPositionFromDrag(e, overIdx);
    const startMin = clamp(pos.minutes, 0, totalMinutes - base.duration);

    // Ne met à jour l’état QUE si ça change réellement (anti-lag)
    if (prevOverDayIndexRef.current !== overIdx) {
      prevOverDayIndexRef.current = overIdx;
      setOverDayIndex(overIdx);
    }
    if (prevOverMinutesRef.current !== startMin) {
      prevOverMinutesRef.current = startMin;
      setOverMinutes(startMin);
      // ghost.start snappé uniquement s’il change
      const nextStart = fromMinutes(startMin);
      if (prevGhostStartRef.current !== nextStart) {
        prevGhostStartRef.current = nextStart;
        setGhost((g) => (g ? { ...g, dayIndex: overIdx, start: nextStart } : g));
      }
    }
  };

  const handleDragEnd = (e) => {
    if (!draggingId) {
      resetDragUi();
      return;
    }
    const base = findEvent(draggingId);
    if (!base) {
      resetDragUi();
      return;
    }

    const overIdx = e.over?.data?.current?.dayIndex;
    if (overIdx == null) {
      resetDragUi();
      return;
    }

    const pos = eventPositionFromDrag(e, overIdx);
    const startMin = clamp(pos.minutes, 0, totalMinutes - base.duration);
    const updated = events.map((ev) =>
      ev.id === base.id
        ? { ...ev, dayIndex: pos.dayIndex, start: fromMinutes(startMin) }
        : ev
    );

    onChange?.(updated);
    resetDragUi();
  };

  const handleDragCancel = () => {
    resetDragUi();
  };

  const resetDragUi = () => {
    setDraggingId(null);
    setGhost(null);
    setOverDayIndex(null);
    setOverMinutes(null);
    prevOverDayIndexRef.current = null;
    prevOverMinutesRef.current = null;
    prevGhostStartRef.current = null;
  };


  const renderEvent = useCallback(
    (ev) => {
      const start = ev.start;
      const end = fromMinutes(toMinutes(ev.start) + ev.duration);
      const cancelled = ev.status === "cancelled";
      return (
        <RdvCard
          title={ev.title}
          start={start}
          end={end}
          cancelled={cancelled}
        />
      );
    },
    [fromMinutes, toMinutes]
  );

  // DayColumn and DraggableEvent extracted to ./DayColumn.jsx

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevWeek}
            className="p-2 rounded-md hover:bg-slate-100"
            aria-label="Semaine précédente"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={onNextWeek}
            className="p-2 rounded-md hover:bg-slate-100"
            aria-label="Semaine suivante"
          >
            <ChevronRight />
          </button>
        </div>
        <h2 className="text-lg md:text-xl font-semibold" style={{ color: secondary }}>
          Semaine du {fmt(days[0])} au {fmt(days[6])}
        </h2>
        <div className="text-sm text-slate-500">
          {hours.start}h–{hours.end}h
        </div>
      </div>

      {/* Entêtes jours */}
      <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-slate-200 text-sm">
        <div className="px-3 py-2 text-slate-500">Heures</div>
        {days.map((d, i) => (
          <div key={i} className="px-3 py-2 font-medium text-slate-700">
            <span className="mr-1">{dayNames[i]}</span>
            <span className="text-slate-500">{d.getDate()}</span>
          </div>
        ))}
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        modifiers={[restrictToWindowEdges]}
      >
        {/* Grille */}
        <div className="relative grid grid-cols-[64px_repeat(7,1fr)]">
          {/* Colonne heures */}
          <div className="border-r border-slate-100">
            {Array.from({ length: hours.end - hours.start + 1 }).map((_, idx) => (
              <div
                key={idx}
                className="relative"
                style={{ height: SLOT_HEIGHT * (60 / slotMinutes) }}
              >
                <div className="absolute -translate-y-2 right-2 text-xs text-slate-400">
                  {hours.start + idx}h
                </div>
                <div className="absolute inset-x-0 bottom-0 h-px bg-slate-200" />
              </div>
            ))}
          </div>

          {/* 7 colonnes jour */}
          {Array.from({ length: 7 }).map((_, dayIdx) => (
            <DayColumn
              key={dayIdx}
              dayIdx={dayIdx}
              ref={(el) => (dayColsRef.current[dayIdx] = el)}
              hours={hours}
              slotMinutes={slotMinutes}
              slotHeight={SLOT_HEIGHT}
              availability={availability.filter((a) => a.dayIndex === dayIdx)}
              events={events.filter((e) => e.dayIndex === dayIdx)}
              renderEvent={renderEvent}
              toMinutes={toMinutes}
              pxPerMinute={pxPerMinute}
              primary={primary}
              isOver={overDayIndex === dayIdx}
              overMinutesForDay={overDayIndex === dayIdx ? overMinutes : null}
              draggingGhost={ghost}
            />
          ))}
        </div>

        {/* CARD du RDV mais quand on drag */}
        <DragOverlay dropAnimation={null}>
          {ghost ? (
            <div
              className="rounded-md cursor-grabbing border shadow-sm bg-white text-slate-800"
              style={{ width: 150, borderColor: "#e2e8f0" }}
            >
              <div className="px-2 py-1 text-[12px] font-medium">
                {ghost.title || "RDV"}
              </div>
              <div className="px-2 pb-2 text-[11px] text-slate-500">
                {ghost.start} — {fromMinutes(toMinutes(ghost.start) + ghost.duration)}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
