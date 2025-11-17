import React, { useMemo, useState } from "react";
import { Search, Users, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import ConsultationCard from "./ConsultationCard";
import ConsultationSkeleton from "./ConsultationSkeleton";


export default function HistoriqueSection({
  pastToday = [],
  onCancel,
  onPostpone,
  loadingAction = "",
  loadingConsultations = false
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [sortBy, setSortBy] = useState("time");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  // normalise / enrich data
  const normalized = useMemo(() => {
    return (pastToday || []).map(c => {
      const patientName = c.patient?.user?.full_name || c.patient?.full_name || "—";
      const pseudo = c.patient?.user?.username || c.patient?.username || patientName;
      const doctorName = c.doctor?.user?.full_name || c.doctor?.full_name || c.medecin_name || "—";
      const avatar = c.patient?.user?.avatar || c.patient?.avatar || c.patient?.photo || c.patient?.photo_url || null;
      const status = (c.statusConsultation || c.status || "").toLowerCase();
      const time = c.heure_debut || c.time || "--:--";
      const dateTs = new Date(`${c.date}T${time}`).getTime() || 0;
      return { ...c, patientName, pseudo, doctorName, avatar, status, time, dateTs };
    });
  }, [pastToday]);

  // doctors list for filter select
  const doctors = useMemo(() => {
    const map = {};
    normalized.forEach(c => {
      const name = c.doctorName || "Inconnu";
      map[name] = (map[name] || 0) + 1;
    });
    const arr = Object.keys(map).map(name => ({ name, count: map[name] }));
    arr.sort((a,b) => a.name.localeCompare(b.name));
    return arr;
  }, [normalized]);

  // status tags (with counts)
  const statusCounts = useMemo(() => {
    const counts = { all: normalized.length };
    normalized.forEach(c => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return counts;
  }, [normalized]);

  // status color classes for active tags
  const statusColor = {
    all: "bg-sky-500 text-white shadow-sm",
    confirme: "bg-orange-400 text-white shadow-sm",
    termine: "bg-emerald-500 text-white shadow-sm",
    annule: "bg-rose-500 text-white shadow-sm",
  };

  // processed list
  const processed = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...normalized];

    if (statusFilter !== "all") list = list.filter(c => c.status === statusFilter);
    if (doctorFilter !== "all") list = list.filter(c => (c.doctorName || "").toLowerCase() === doctorFilter.toLowerCase());
    if (q) {
      list = list.filter(c =>
        String(c.id).toLowerCase().includes(q) ||
        (c.patientName || "").toLowerCase().includes(q) ||
        (c.pseudo || "").toLowerCase().includes(q) ||
        (c.doctorName || "").toLowerCase().includes(q)
      );
    }

    list.sort((a,b) => {
      if (sortBy === "patient") {
        const A = (a.patientName || "").toLowerCase();
        const B = (b.patientName || "").toLowerCase();
        if (A < B) return sortDir === "asc" ? -1 : 1;
        if (A > B) return sortDir === "asc" ? 1 : -1;
        return 0;
      }
      if (a.dateTs < b.dateTs) return sortDir === "asc" ? -1 : 1;
      if (a.dateTs > b.dateTs) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [normalized, search, statusFilter, doctorFilter, sortBy, sortDir]);

  // pagination
  const total = processed.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageClamped = Math.min(Math.max(1, page), totalPages);
  const paged = processed.slice((pageClamped - 1) * perPage, pageClamped * perPage);

  // handy setter that resets page
  const setFilterAndReset = (fn) => { fn(); setPage(1); };

  return (
    <section className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition duration-150 border border-slate-50">
      <h2 className="text-lg font-semibold text-slate-900 mb-3">Historique de la journée</h2>

      {/* top controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center  justify-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setFilterAndReset(()=>setSearch(e.target.value))}
              placeholder="Rechercher patient, id, médecin..."
              className="pl-10 pr-3 py-2 w-full rounded-lg border border-slate-100 bg-slate-50 text-sm"
            />
          </div>

          {/* doctor select */}
          <select
            value={doctorFilter}
            onChange={e => setFilterAndReset(()=>setDoctorFilter(e.target.value))}
            className="text-sm rounded-lg border border-slate-100 bg-white px-3 py-2"
          >
            <option value="all">Tous médecins</option>
            {doctors.map(d => (
              <option key={d.name} value={d.name}>{d.name} ({d.count})</option>
            ))}
          </select>

              {/* status tags */}
              <div className="flex items-center gap-2 h-fit justify-center flex-wrap md:ml-3">
                {["all","confirme","termine","annule"].map(s => {
                  const label = s === "all" ? "Tous" : s === "confirme" ? "Confirmé" : s === "termine" ? "Terminé" : "Annulé";
                  const active = statusFilter === s;
                  const count = statusCounts[s] || 0;
                  return (
                    <button
                      key={s}
                      onClick={() => setFilterAndReset(()=>setStatusFilter(s))}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${active ? statusColor[s] : "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100"}`}
                      title={`${count} rendez-vous`}
                    >
                      {label} <span className="ml-1 text-white-400">({count})</span>
                    </button>
                  );
                })}
              </div>
        </div>

        

        <div className="flex items-center gap-2">
          <button
            title="Trier"
            onClick={() => setSortBy(s => s === "time" ? "patient" : "time")}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-100 bg-white text-sm shadow-sm hover:shadow"
          >
            <ArrowUpDown className="w-4 h-4" /> Trier: {sortBy === 'time' ? 'Heure' : 'Patient'}
          </button>

          <button
            title="Inverser"
            onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
            className="inline-flex items-center px-3 py-2 rounded-lg border border-slate-100 bg-white text-sm"
          >
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

      {/* content: skeleton or list */}
      {loadingConsultations ? (
        <div className="space-y-3">
          <ConsultationSkeleton />
          <ConsultationSkeleton />
        </div>
      ) : (
        <>
          {paged.length ? (
            <div className="space-y-3">
              {paged.map(c => (
                <ConsultationCard
                  key={c.id || c._tempId || Math.random()}
                  consultation={c}
                  onCancel={onCancel}
                  onPostpone={onPostpone}
                  loadingAction={loadingAction}
                />
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500">Aucun rendez-vous correspondant.</div>
          )}
        </>
      )}

      {/* pagination */}
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
