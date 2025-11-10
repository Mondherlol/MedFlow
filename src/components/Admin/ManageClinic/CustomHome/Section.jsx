import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function Section({ title, children, className = "", collapsible = false, defaultOpen = true }) {
  const [open, setOpen] = useState(!collapsible ? true : defaultOpen);

  return (
    <section className={className}>
      <div className="mb-2 flex items-center justify-between">
        {title && <h2 className="text-sm font-semibold text-slate-700">{title}</h2>}
        {collapsible && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
          >
            {open ? "Réduire" : "Déployer"} <ChevronDown className={`w-4 h-4 transition ${open ? "" : "-rotate-90"}`} />
          </button>
        )}
      </div>
      {open && <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">{children}</div>}
    </section>
  );
}
