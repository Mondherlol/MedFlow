import React from "react";


export default function ConsultationSkeleton({ size = "large" }) {
  return (
    <div className="animate-pulse flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm border border-slate-100">
      <div className="w-12 h-12 rounded-full bg-slate-200" />
      <div className="flex-1">
        <div className="w-3/5 h-4 bg-slate-200 rounded mb-2" />
        <div className="w-2/5 h-3 bg-slate-200 rounded mb-2" />
        <div className="flex items-center justify-between">
          <div className="w-24 h-3 bg-slate-200 rounded" />
          <div className="w-28 h-3 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
}
