import React from "react";
import { Link } from "react-router-dom";
import { Clock, User, Calendar, UserCheck, XCircle, ChevronRight } from "lucide-react";
import { getImageUrl } from "../../utils/image.jsx";

// Small helper to map backend status to display text
function getStatusText(status) {
  if (!status) return "—";
  switch (String(status).toLowerCase()) {
    case "confirme": return "Confirmé";
    case "termine": return "Terminé";
    case "encours": return "En cours";
    case "annule": return "Annulé";
    default: return String(status).replace(/_/g, " ");
  }
}

function getStatusStyle(status) {
  const s = (status || "").toLowerCase();
  if (s === "termine") return { badge: "bg-emerald-50 text-emerald-700", bar: "bg-emerald-400" , icon: UserCheck };
  if (s === "encours") return { badge: "bg-sky-50 text-sky-700", bar: "bg-sky-400", icon: Clock };
  if (s === "annule") return { badge: "bg-rose-50 text-rose-700", bar: "bg-rose-400", icon: XCircle };
  if (s === "confirme") return { badge: "bg-amber-50 text-amber-700", bar: "bg-amber-400", icon: Clock };
  return { badge: "bg-slate-100 text-slate-700", bar: "bg-slate-300", icon: Clock };
}

export default function ConsultationCard({ consultation }) {
  const status = (consultation?.statusConsultation || "").toLowerCase();
  const style = getStatusStyle(status);

  // Date/time parsing and formatting
  const rawDate = consultation?.date || null; // e.g. "2025-11-25"
  const rawTime = consultation?.heure_debut || null; // e.g. "10:15"
  const dateObj = rawDate ? (rawTime ? new Date(`${rawDate}T${rawTime}:00`) : new Date(`${rawDate}T00:00:00`)) : null;

  function capitalizeWords(str) {
    return String(str).split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  function formatLongDate(d) {
    try {
      const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      const s = d.toLocaleDateString('fr-FR', opts); // "lundi 4 mars 2025"
      return capitalizeWords(s); // "Lundi 4 Mars 2025"
    } catch (e) {
      return d.toISOString().slice(0,10);
    }
  }

  function getRelativeTag(d) {
    const now = new Date();
    const diffMs = now - d;
    const absMs = Math.abs(diffMs);
    const sec = Math.round(absMs / 1000);
    const min = Math.round(sec / 60);
    const hrs = Math.round(min / 60);
    const days = Math.round(hrs / 24);

    if (diffMs >= 0) {
      // past
      if (sec < 60) return 'à l\'instant';
      if (min < 60) return `il y a ${min} ${min === 1 ? 'minute' : 'minutes'}`;
      if (hrs < 24) return `il y a ${hrs} ${hrs === 1 ? 'heure' : 'heures'}`;
      if (days === 1) return 'hier';
      if (days < 30) return `il y a ${days} ${days === 1 ? 'jour' : 'jours'}`;
      // older: show months/years approximation
      const months = Math.round(days / 30);
      if (months < 12) return `il y a ${months} ${months === 1 ? 'mois' : 'mois'}`;
      const years = Math.round(months / 12);
      return `il y a ${years} ${years === 1 ? 'an' : 'ans'}`;
    } else {
      // future
      if (sec < 60) return 'bientôt';
      if (min < 60) return `dans ${min} ${min === 1 ? 'minute' : 'minutes'}`;
      if (hrs < 24) return `dans ${hrs} ${hrs === 1 ? 'heure' : 'heures'}`;
      if (days === 1) return 'demain';
      return `dans ${days} ${days === 1 ? 'jour' : 'jours'}`;
    }
  }

  const date = dateObj ? formatLongDate(dateObj) : (rawDate || '—');
  const relativeTag = dateObj ? getRelativeTag(dateObj) : null;

  const time = consultation?.heure_debut ? (consultation.heure_fin && consultation.statusConsultation == "termine" ? `${consultation.heure_debut} — ${consultation.heure_fin}` : consultation.heure_debut) : "—";

  const doctor = consultation?.doctor || {};
  const doctorName = doctor.full_name || doctor.display_name || "Dr. —";
  const specialty = doctor.specialite || doctor.specialty || "";

  // Use patient photo if provided else doctor photo as fallback
  const photoPath = consultation?.patient?.photo_url || doctor.photo_url || doctor.photo || null;
  const avatar = getImageUrl(photoPath);

  return (
    <article className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm hover:shadow-lg border border-slate-100 transition">
      <div className={`w-1 h-16 rounded-l-full ${style.bar}`} />

      <div className="shrink-0">
        {avatar ? (
          <img src={avatar} alt={doctorName} className="w-14 h-14 rounded-full object-cover ring-1 ring-slate-100" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700">
            {String((consultation?.patient?.full_name || doctorName || "—").split(" ").map(s => s[0] || "").slice(0,2).join("")).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-slate-900 truncate">{doctorName}</div>
          {specialty && <div className="text-xs text-slate-500">· {specialty}</div>}
        </div>

        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
          <div className="inline-flex items-center gap-1">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{date}</span>
            {relativeTag && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">{relativeTag}</span>
            )}
          </div>
          <div className="inline-flex items-center gap-1">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{time}</span>
          </div>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full ${style.badge}`}>
          <style.icon className="w-4 h-4" />
          <span className="whitespace-nowrap">{getStatusText(status)}</span>
        </div>

        <Link to={`/patient/appointments/${consultation?.id || ""}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100">
          <span className="text-sm">Voir</span>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </Link>
      </div>
    </article>
  );
}
