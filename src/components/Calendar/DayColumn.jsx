import React, { useCallback } from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";

/**
 * DayColumn component extracted from WeekCalendar.
 * Props:
 * - dayIdx, hours, slotMinutes, slotHeight, availability, events
 * - renderEvent(to render inner event content)
 * - primary, isOver, overMinutesForDay, draggingGhost
 * - toMinutes, pxPerMinute
 */
const DayColumn = React.memo(
  React.forwardRef(function DayColumn(
    {
      dayIdx,
      hours,
      slotMinutes,
      slotHeight,
      availability,
      events,
      renderEvent,
      primary,
      isOver,
      overMinutesForDay,
      draggingGhost,
      toMinutes,
      pxPerMinute,
    },
    ref
  ) {
    const { setNodeRef: setDroppableRef, isOver: dndIsOver } = useDroppable({
      id: `day-${dayIdx}`,
      data: { dayIndex: dayIdx },
    });

    // merge refs
    const forwardRef = useCallback(
      (el) => {
        setDroppableRef(el);
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      },
      [ref, setDroppableRef]
    );

    const showOver = isOver || dndIsOver;
    const indicatorTop =
      overMinutesForDay != null
        ? overMinutesForDay * (slotHeight / slotMinutes)
        : null;

    return (
      <div
        ref={forwardRef}
        data-day
        data-day-index={dayIdx}
        className={`relative border-r last:border-r-0 ${
          showOver ? "bg-sky-50/40" : ""
        }`}
        style={{ borderColor: "#eef2f7" }}
      >
        {/* Lignes horaires */}
        {Array.from({ length: hours.end - hours.start }).map((_, hour) => {
          const baseTop = hour * 60 * (slotHeight / slotMinutes);
          return (
            <div key={hour} className="absolute left-0 right-0" style={{ top: baseTop }}>
              <div className="h-px bg-slate-200" />
              <div className="h-px bg-slate-100" style={{ marginTop: slotHeight - 1 }} />
              <div className="h-px bg-slate-100" style={{ marginTop: slotHeight - 1 }} />
              <div className="h-px bg-slate-100" style={{ marginTop: slotHeight - 1 }} />
            </div>
          );
        })}

        {/* Disponibilités */}
        {(() => {
          const slots = Array.isArray(availability)
            ? availability
            : availability?.slots || [];
          return slots.map((s, idx) => {
            if (!s || !s.start || !s.end) return null;
            const [sh, sm] = String(s.start).split(":").map(Number);
            const [eh, em] = String(s.end).split(":").map(Number);
            const startMin = (sh - hours.start) * 60 + (sm || 0);
            const endMin = (eh - hours.start) * 60 + (em || 0);
            const top = startMin * (slotHeight / slotMinutes);
            const height = (endMin - startMin) * (slotHeight / slotMinutes);
            const key = `${s.id ?? `day${dayIdx}`}-${idx}-${s.start}-${s.end}`;
            return (
              <div
                key={key}
                className="absolute left-1 right-1 rounded-md"
                style={{
                  top,
                  height,
                  backgroundColor: `${primary}14`,
                  border: `1px solid ${primary}33`,
                }}
                title={`Dispo ${s.start}–${s.end}`}
              />
            );
          });
        })()}

        {/* Indicateur Drop */}
        {showOver && draggingGhost && overMinutesForDay != null ? (
          <div
            className="absolute left-1 right-1 rounded-md border border-dashed pointer-events-none"
            style={{
              top: indicatorTop,
              height: Math.max(draggingGhost.duration * (slotHeight / slotMinutes), 32),
              background: `${primary}12`,
              borderColor: `${primary}66`,
            }}
          />
        ) : null}

        {/* RDV */}
        {events.map((ev) => (
          <DraggableEvent
            key={ev.id}
            event={ev}
            toMinutes={toMinutes}
            pxPerMinute={pxPerMinute}
            renderEvent={renderEvent}
          />
        ))}
      </div>
    );
  })
);

// ---------- RDV draggable (inner) ----------
const DraggableEvent = React.memo(function DraggableEvent({
  event,
  toMinutes,
  pxPerMinute,
  renderEvent,
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: String(event.id),
  });

  const top = toMinutes(event.start) * pxPerMinute;
  const height = event.duration * pxPerMinute;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      data-event
      className={`absolute left-1 right-1 rounded-md border shadow-sm select-none cursor-move transition-[box-shadow,transform]
        ${isDragging ? "shadow-lg scale-[1.01]" : ""}
        bg-white border-slate-200`}
      style={{ top, height: Math.max(height, 44) }}
    >
      {renderEvent(event)}
    </div>
  );
});

export default DayColumn;
