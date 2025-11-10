import { GripVertical, Eye, EyeOff, Lock, ArrowUp, ArrowDown } from "lucide-react";

export default function SectionRow({
  index,
  section,
  onToggle,
  onUp,
  onDown,
  colors,
  dragging = false,
  compact = false,
  dragHandleProps = {},
}) {
  const muted = !section.visible && !section.locked;

  return (
    <div
      className={[
        "flex items-center justify-between rounded-xl border bg-white shadow-sm transition",
        compact ? "p-2.5" : "p-3",
        "border-slate-200",
        muted ? "opacity-70 grayscale" : "",
        dragging ? "scale-[1.015] shadow-md -translate-y-px" : "hover:shadow-md",
      ].join(" ")}
      role="listitem"
    >
    

      <div className="flex items-center gap-3">
        <div
          {...dragHandleProps}
          className={[
            "w-6 text-slate-400 grid place-items-center rounded cursor-grab active:cursor-grabbing",
            (index === 0 || section.locked) ? "cursor-default" : "",
          ].join(" ")}
          aria-label={section.locked ? "Verrouillé" : "Déplacer la section"}
          title={section.locked ? "Verrouillé" : "Déplacer"}
        >
          {index === 0 || section.locked ? <Lock className="w-4 h-4" /> : <GripVertical className="w-4 h-4" />}
        </div>

        <div>
          <div className="font-medium text-slate-900">{section.label}</div>
          <div className="text-[11px] text-slate-500">{section.id}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Toggle joli */}
        <button
          type="button"
          onClick={onToggle}
          disabled={section.locked}
          className="cursor-pointer relative inline-flex items-center h-6 w-11 rounded-full transition-colors border border-slate-200"
          style={{
            backgroundColor: section.visible ? (colors?.primary || "#3b82f6") : "#fff",
          }}
          aria-pressed={!!section.visible}
          title={section.visible ? "Masquer" : "Afficher"}
        >
          <span
            className="pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
            style={{ transform: section.visible ? "translateX(20px)" : "translateX(0px)" }}
          />
          <span className="sr-only">Basculer visibilité</span>
        </button>

        <button
          onClick={onUp}
          disabled={index <= 1}
          className="cursor-pointer rounded-lg border border-slate-200 bg-white p-1.5 hover:bg-slate-50 disabled:opacity-40"
          title="Monter"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <button
          onClick={onDown}
          disabled={index === 0}
          className="cursor-pointer rounded-lg border border-slate-200 bg-white p-1.5 hover:bg-slate-50 disabled:opacity-40"
          title="Descendre"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
