import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function MiniDropdown({ label = "Options", items = [], buttonClassName = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onClick = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={buttonClassName || "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"}
      >
        <span className="inline-flex items-center gap-1">
          {label} <ChevronDown className="w-4 h-4" />
        </span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <ul className="py-1">
            {items.map(({ id, label, apply, icon: Icon }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => { setOpen(false); apply?.(); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
                >
                  {Icon && <Icon className="w-4 h-4 text-slate-500" />}
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
