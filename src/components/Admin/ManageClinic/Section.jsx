import React from "react";

export default function Section({ title, children, className = "" }) {
  return (
    <section className={className}>
      {title && (
        <h2 className="text-sm font-semibold text-slate-700 mb-3">{title}</h2>
      )}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        {children}
      </div>
    </section>
  );
}
