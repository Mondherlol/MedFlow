import React from "react";
import { ArrowRight } from "lucide-react";

export default function ActionTile({ icon: Icon, title, desc, onClick, tone = "sky" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative w-full text-left rounded-2xl border border-slate-200 bg-white p-4",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200",
      ].join(" ")}
      aria-label={title}
    >
      {/* glow angle */}
      <span className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full bg-sky-200/20 blur-2xl" />
      <div className="mb-2 flex items-center gap-3">
        <div
          className={[
            "relative inline-flex items-center justify-center rounded-xl px-3 py-2",
            `bg-${tone}-50/80 ring-1 ring-${tone}-200 text-${tone}-700`,
          ].join(" ")}
        >
          <Icon className="h-5 w-5" />
          <span
            className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(120deg,transparent 0%,rgba(255,255,255,.35) 45%,transparent 70%)",
            }}
          />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-slate-900">{title}</div>
          <div className="text-xs text-slate-600">{desc}</div>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-400 translate-x-0 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
      </div>

      <span
        className={[
          "pointer-events-none absolute left-4 right-4 bottom-0 h-[2px] opacity-0 transition-opacity duration-200",
          `bg-gradient-to-r from-${tone}-400/0 via-${tone}-400/60 to-${tone}-400/0`,
          "group-hover:opacity-100",
        ].join(" ")}
      />
    </button>
  );
}
