import { memo } from "react";
import {getImageUrl} from "../../utils/image.jsx";

function initials(name = "") {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default memo(function DoctorCard({ doctor, selected = false, onSelect }) {
    const name = doctor?.user?.full_name || "—";
    const spec = doctor?.specialite || "Général";
    const duration = doctor?.duree_consultation || 15;
    const avatar = doctor?.user?.photo_url ||null;
    return (
        <button
            onClick={() => onSelect && onSelect(doctor)}
            className={`w-full text-left p-3 rounded-lg border transition-shadow flex cursor-pointer items-center gap-3 ${selected ? "border-blue-400 bg-blue-50 shadow-sm" : "border-slate-100 hover:shadow"}`}
        >
            <div className="w-12 h-12 rounded-full shrink-0 overflow-hidden bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-700">
                {avatar ? (
                    <img src={getImageUrl(avatar)} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <span>{initials(name)}</span>
                )}
            </div>

            <div className="flex-1">
                <div className="font-medium text-sm">{name}</div>
                <div className="text-xs text-slate-500">{spec}</div>
            </div>

            <div className="text-xs text-slate-600">{`~${duration} min`}</div>
        </button>
    );
});
