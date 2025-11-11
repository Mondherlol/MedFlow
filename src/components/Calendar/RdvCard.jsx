import { memo } from "react";

  
const EventCard = memo(function EventCard({ title, start, end, cancelled }) {
    return (
      <div className={`h-full cursor-grab w-full flex flex-col justify-between rounded-md overflow-hidden`}>
        <div className="px-2 pt-1">
          <div
            className={`text-[12px] font-semibold leading-tight truncate ${
              cancelled ? "line-through text-rose-700" : "text-slate-800"
            }`}
            title={title || "RDV"}
          >
            {title || "RDV"}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`mt-1 px-2 py-1 text-[11px] border-t flex items-center gap-1 ${
            cancelled ? "text-rose-700 border-rose-200 bg-rose-50/60" : "text-slate-600 border-slate-200 bg-slate-50"
          }`}
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
