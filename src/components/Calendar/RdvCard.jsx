import { memo } from "react";

const EventCard = memo(function EventCard({ title, start, end, cancelled, provisoire }) {
  const rootExtra = cancelled
    ? ""
    : provisoire
    ? "border border-dashed border-blue-200"
    : "";

  const titleClass = cancelled
    ? "line-through text-rose-700"
    : provisoire
    ? "text-blue-800"
    : "text-slate-800";

  const footerExtra = cancelled
    ? "text-rose-700 border-rose-200 bg-rose-50/60"
    : provisoire
    ? "text-blue-700 border-blue-200 bg-blue-50/60 border-t-2 border-dashed"
    : "text-slate-600 border-slate-200 bg-slate-50";

  return (
    <div className={`h-full cursor-grab w-full flex flex-col justify-between rounded-md overflow-hidden ${rootExtra}`}>
      <div className="px-2 pt-1">
        <div
          className={`text-[12px] font-semibold leading-tight truncate ${titleClass}`}
          title={title || "RDV"}
        >
          {title || "RDV"}
        </div>
      </div>

      {/* Footer */}
      <div
        className={`mt-1 px-2 py-1 text-[11px] flex items-center gap-1 ${footerExtra}`}
        style={{ minHeight: 20 }}
      >
        <span className="whitespace-nowrap">{start}</span>
        <span className="opacity-60">—</span>
        <span className="whitespace-nowrap">{end}</span>
      </div>
    </div>
  );
});

export default EventCard;
