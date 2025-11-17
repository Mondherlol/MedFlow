import { useMemo, useState } from "react";
import { CheckCircle, ClockIcon, XCircle, Search, ChevronLeft, ChevronRight, ArrowUpDown, Users, UserCheck, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

const getStatusText = (status) => {
    if (!status) return "—";
    switch (status.toLowerCase()) {
        case "confirme":
            return "Confirmé";
        case "termine":
            return "Terminé";
        case "encours":
            return "En cours";
        case "annuler":
            return "Annulé";
        default:
            return status.replace("_", " ");
    }
}

function HistoriqueSection({ pastToday = [], onCancel, onPostpone }) {
  // UI state: filters, sorting, pagination, search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("time"); // 'time' | 'patient'
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  const handleCancel = (c) => {
    if (onCancel) return onCancel(c.id, c);
    const ok = window.confirm("Annuler le rendez-vous ?");
    if (!ok) return;
    console.log("Annulé :", c.id || c);
  }

  const handlePostpone = (c) => {
    if (onPostpone) return onPostpone(c.id, c);
    const minutesStr = window.prompt("Reporter de combien de minutes ?", "15");
    if (!minutesStr) return;
    const minutes = parseInt(minutesStr, 10);
    if (isNaN(minutes) || minutes <= 0) return alert("Valeur invalide");
    console.log(`Reporté ${c.id} de ${minutes} minutes`);
  }

  // Derived list (filtered, searched, sorted)
  const processed = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...pastToday];

    // normalize fields used in UI
    list = list.map(c => {
      const patientName = c.patient?.user?.full_name || c.patient?.full_name || "—";
      const pseudo = c.patient?.user?.username || c.patient?.username || patientName;
      const doctorName = c.doctor?.user?.full_name || c.doctor?.full_name || c.medecin_name || "—";
      const avatar = c.patient?.user?.avatar || c.patient?.avatar || c.patient?.photo || c.patient?.photo_url || null;
      const status = (c.statusConsultation || c.status || "").toLowerCase();
      const time = c.heure_debut || "--:--";
      const dateTs = new Date(`${c.date}T${time}`).getTime() || 0;
      return { ...c, patientName, pseudo, doctorName, avatar, status, time, dateTs };
    });

    // status filter
    if (statusFilter !== "all") {
      list = list.filter(c => c.status === statusFilter);
    }

    // search
    if (q) {
      list = list.filter(c => {
        return (
          String(c.id).toLowerCase().includes(q) ||
          c.patientName.toLowerCase().includes(q) ||
          c.pseudo.toLowerCase().includes(q) ||
          c.doctorName.toLowerCase().includes(q)
        );
      });
    }

    // sort
    list.sort((a, b) => {
      if (sortBy === "patient") {
        const A = a.patientName.toLowerCase();
        const B = b.patientName.toLowerCase();
        if (A < B) return sortDir === "asc" ? -1 : 1;
        if (A > B) return sortDir === "asc" ? 1 : -1;
        return 0;
      }
      // default sort by time (dateTs)
      if (a.dateTs < b.dateTs) return sortDir === "asc" ? -1 : 1;
      if (a.dateTs > b.dateTs) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [pastToday, search, statusFilter, sortBy, sortDir]);

  // pagination
  const total = processed.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageClamped = Math.min(Math.max(1, page), totalPages);
  const paged = processed.slice((pageClamped - 1) * perPage, pageClamped * perPage);

  // reset page on filters change
  const onFilterChange = (fn) => {
    fn();
    setPage(1);
  }

  return (
    <section className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-colors duration-150 border border-slate-50">
      <h2 className="text-lg font-semibold text-slate-900 mb-3">Historique de la journée</h2>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => onFilterChange(() => setSearch(e.target.value))}
              placeholder="Rechercher patient, id, médecin..."
              className="pl-10 pr-3 py-2 w-full rounded-lg border border-slate-100 bg-slate-50 text-sm"
            />
          </div>

          <select value={statusFilter} onChange={e => onFilterChange(() => setStatusFilter(e.target.value))} className="text-sm rounded-lg border border-slate-100 bg-white px-3 py-2">
            <option value="all">Tous statuts</option>
            <option value="confirme">Confirmé</option>
            <option value="encours">En cours</option>
            <option value="termine">Terminé</option>
            <option value="annuler">Annulé</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button title="Trier" onClick={() => { setSortBy(sortBy === 'time' ? 'doctor' : 'time'); }} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-100 bg-white text-sm shadow-sm hover:shadow">
            <Users className="w-4 h-4" /> Trier: {sortBy === 'time' ? 'Heure' : 'Médecin'}
          </button>
          <button title="Inverser" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')} className="inline-flex items-center px-3 py-2 rounded-lg border border-slate-100 bg-white text-sm">
            {sortDir === 'asc' ? 'Asc' : 'Desc'}
          </button>
          <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }} className="text-sm rounded-lg border border-slate-100 bg-white px-3 py-2">
            <option value={5}>5 / page</option>
            <option value={8}>8 / page</option>
            <option value={12}>12 / page</option>
          </select>
        </div>
      </div>

      <div className="mb-3 text-xs text-slate-500">{total} résultat{total > 1 ? 's' : ''}</div>

      {paged.length ? (
        <div className="space-y-3">
          {paged.map((c) => {
            const time = c.time || c.heure_debut || "--:--";
            const patientName = c.patientName;
            const pseudo = c.pseudo;
            const doctorName = c.doctorName;
            const avatar = c.avatar;
            const status = c.status;
            let badgeColor = "bg-slate-100 text-slate-700";
            let StatusIcon = ClockIcon;
            if (status === "termine") {
              badgeColor = "bg-emerald-50 text-emerald-700";
              StatusIcon = UserCheck;
            } else if (status === "encours") {
              badgeColor = "bg-sky-50 text-sky-700";
              StatusIcon = UserRound;
            } else if (status === "annuler") {
              badgeColor = "bg-rose-50 text-rose-700";
              StatusIcon = XCircle;
            } else if (status === "confirme") {
              badgeColor = "bg-amber-50 text-amber-700";
              StatusIcon = ClockIcon;
            }

            const initials = patientName.split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase();

            return (
              <div key={`${c.id || c._tempId || Math.random()}`} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:shadow-md bg-white">
                <div className="flex items-center gap-4 min-w-0">
                  <Link to={`/reception/patients/${c.patient?.id }`} className="flex-shrink-0">
                    {avatar ? (
                      <img src={avatar} alt={patientName} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-700">
                        {initials || "—"}
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0">
                    <Link to={`/reception/patients/${c.patient?.id }`} className="text-sm font-semibold text-slate-900 truncate">{pseudo}</Link>
                    <div className="text-xs text-slate-500 truncate">Dr. {doctorName}</div>
                    <div className="text-xs text-slate-400 mt-1 truncate">{c.service || c.motif || c.title || ''}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm text-slate-700 text-right w-24">
                    <div className="font-medium">{time}</div>
                    <div className="text-xs text-slate-400">{new Date(`${c.date}T${time}`).toLocaleDateString()}</div>
                  </div>

                  <div className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-md ${badgeColor}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="truncate">{getStatusText(status)}</span>
                  </div>

                  {/* actions */}
                  <div className="flex items-center gap-2">
                    {status === "confirme" && (
                      <>
                        <button onClick={() => handlePostpone(c)} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-amber-50 text-amber-800 hover:bg-amber-100 shadow-sm border border-transparent">
                          <ClockIcon className="w-4 h-4" />
                          Reporter
                        </button>
                        <button onClick={() => handleCancel(c)} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 shadow-sm border border-transparent">
                          <XCircle className="w-4 h-4" />
                          Annuler
                        </button>
                      </>
                    )}

                    <div className="text-xs text-slate-400">ID {String(c.id || "—").slice(0,8)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-slate-500">Aucun rendez-vous correspondant.</div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-500">Page {pageClamped} / {totalPages}</div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={pageClamped <= 1} className="px-3 py-1 rounded-md border border-slate-100 bg-white">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={pageClamped >= totalPages} className="px-3 py-1 rounded-md border border-slate-100 bg-white">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default HistoriqueSection;