import { Phone, Check, Repeat, X, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";


export default function ConsultationRow({ c, onCheckIn, onCheckOut, onPostpone, onCancel, loadingAction = "", accent = "#0ea5e9" }) {
  const isLoadingCheckIn = loadingAction === `checkin-${c?.id}`;
  const isLoadingCheckOut = loadingAction === `checkout-${c?.id}`;
  const isLoadingCancel = loadingAction === `cancel-${c?.id}`;
  // small color bar per status
  const barColor = c.status === "checked_in" ? "bg-emerald-400"
    : c.status === "checked_out" ? "bg-slate-300"
    : c.status === "cancelled" ? "bg-rose-400"
    : "bg-sky-400";

  const initials = (c.patient?.full_name || "").split(" ").map(p => p[0]).slice(0,2).join("").toUpperCase();

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white border border-slate-50 hover:shadow-md hover:-translate-y-0.5 transform transition-all duration-150" role="row">
      {/* infos  */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-1 h-12 rounded-l-lg ${barColor}`} />
        <div className="flex items-center gap-3 pl-3 min-w-0">
          <Link to={`/reception/patients/${c.patient.id}`} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-700">
            {initials}
          </Link>
          <div className="min-w-0">
            <Link to={`/reception/patients/${c.patient.id}`} className="text-sm font-medium truncate">{c.patient.full_name}</Link>
            <div className="text-xs text-slate-500 truncate">
             <Link to={`/reception/emploi/${c.doctor.id}`} className="text-xs hover:underline text-slate-500 truncate">{c.doctor.full_name}</Link>  
             {" "} • <span className="font-medium">{c.heure_debut}</span></div>
          </div>
        </div>
      </div>

      {/* Phone et actions */}
      <div className="flex items-center gap-2">
        <a href={`tel:${c.patient.phone}`} className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-white border border-slate-100 hover:shadow-sm transition cursor-pointer">
          <Phone className="w-4 h-4 text-slate-600" />
          <span className="text-sm text-slate-700">{c.patient.phone}</span>
        </a>

        {c.statusConsultation !== "encours" && c.statusConsultation !== "termine"  && (<>
          <button
            onClick={() => { if (onCheckIn) onCheckIn(); }}
            disabled={isLoadingCheckIn}
            className={`px-3 py-1 flex flex-row justify-center items-center rounded-md text-white text-sm font-medium transition ${isLoadingCheckIn ? 'opacity-60 cursor-not-allowed' : 'hover:brightness-95 cursor-pointer'}`}
            style={{ background: accent }}
          >
            {isLoadingCheckIn ? <Loader2 className="inline-block w-4 h-4 animate-spin" /> : <><Check className="inline-block w-4 h-4 mr-1" /> Check-in</>}
          </button>

            {/* Boutons */}
          <button onClick={onPostpone} title="Reporter" className="p-2 rounded-md bg-white border border-slate-100 hover:shadow-sm transition cursor-pointer">
            <Repeat className="w-4 h-4 text-slate-600" />
          </button>
          <button onClick={() => { if (onCancel) onCancel(); }} title="Annuler" disabled={isLoadingCancel} className={`p-2 rounded-md bg-white border border-slate-100 hover:bg-rose-50 hover:shadow-sm transition ${isLoadingCancel ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
            {isLoadingCancel ? <Loader2 className="w-4 h-4 animate-spin text-rose-600" /> : <X className="w-4 h-4 text-rose-600" />}
          </button>
        </>
        )}

        {c.statusConsultation === "encours" && (
          <>
            <button
              onClick={() => { if (onCheckOut) onCheckOut(); }}
              disabled={isLoadingCheckOut}
              title="Check-out"
              className={`px-3 py-1 flex flex-row justify-center items-center rounded-md text-white text-sm font-medium bg-emerald-500 transition ${isLoadingCheckOut ? 'opacity-60 cursor-not-allowed' : 'hover:brightness-95 cursor-pointer'}`}
            >
              {isLoadingCheckOut ? <Loader2 className="inline-block w-4 h-4 animate-spin" /> : <><Check className="inline-block w-4 h-4 mr-1" /> Check-out</>}
            </button>
            <span className="px-3 py-1 rounded-md text-white text-sm font-medium bg-sky-200">En cours</span>

          </>

        )}

 
      </div>
    </div>
  );
}
