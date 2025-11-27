import { Search } from "lucide-react";
import DoctorCard from "../../components/Patient/NewConsultationRequest/DoctorCard";


// Skeleton carte médecin
function DoctorSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white animate-pulse">
      <div className="w-14 h-14 rounded-full bg-slate-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
      </div>
      <div className="w-20 h-8 bg-slate-200 rounded-full" />
    </div>
  );
}

function Step1DoctorsList({ doctors, loading, query, setQuery, onSelect }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 rounded-xl bg-slate-100">
            <Search className="w-5 h-5 text-slate-500" />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un médecin ou une spécialité"
            className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => <DoctorSkeleton key={i} />)}

        {!loading &&
          (doctors || []).map((d) => (
            <DoctorCard key={d.id} doctor={d} onSelect={onSelect} />
          ))}

        {!loading && (!doctors || doctors.length === 0) && (
          <div className="text-sm text-slate-500">
            Aucun médecin trouvé pour cette clinique.
          </div>
        )}
      </div>
    </div>
  );
}


export default Step1DoctorsList;