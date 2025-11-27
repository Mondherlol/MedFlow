import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ReceptionistTemplate from "../../components/Reception/ReceptionTemplate";
import ConsultationRequestCard from "../../components/Reception/ConsultationRequestCard";
import { 
  Calendar, RefreshCw, Inbox, Loader2, 
  Filter, SlidersHorizontal, ChevronDown,
  Sparkles, Clock, User, AlertTriangle
} from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function Requests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // États de filtrage et tri
  const [sortBy, setSortBy] = useState("date_desc"); // date_desc, date_asc, urgency, doctor
  const [filterDoctor, setFilterDoctor] = useState("all");
  const [filterDiagnostic, setFilterDiagnostic] = useState("all"); // all, with_ia, without_ia
  const [filterSlots, setFilterSlots] = useState("all"); // all, with_slots, without_slots
  const [showFilters, setShowFilters] = useState(false);

  const fetchRequests = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await api.get('/api/consultation-requests/by-clinic/');
      const data = response?.data?.data || response?.data || [];
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur lors du chargement des demandes:', err);
      toast.error("Impossible de charger les demandes de consultation");
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRequestUpdated = () => {
    fetchRequests(true);
  };

  // Liste unique des médecins pour le filtre
  const doctors = useMemo(() => {
    const uniqueDoctors = new Map();
    requests.forEach(r => {
      if (r.doctor && r.doctor.id) {
        uniqueDoctors.set(r.doctor.id, r.doctor);
      }
    });
    return Array.from(uniqueDoctors.values());
  }, [requests]);

  // Fonction pour déterminer l'urgence d'après le diagnostic IA
  const getUrgencyLevel = (request) => {
    if (!request.auto_diagnostic || !request.auto_diagnostic.predictions) return 0;
    
    const predictions = request.auto_diagnostic.predictions;
    if (!predictions.length) return 0;

    // Chercher la sévérité la plus élevée
    const severities = predictions.map(p => {
      const sev = String(p.severity || '').toLowerCase();
      if (sev.includes('severe') || sev.includes('grave') || sev.includes('sévère')) return 3;
      if (sev.includes('moderate') || sev.includes('moyen') || sev.includes('modéré')) return 2;
      return 1;
    });

    return Math.max(...severities);
  };

  // Filtrage et tri des demandes
  const filteredAndSortedRequests = useMemo(() => {
    let result = [...requests];

    // Filtrer par médecin
    if (filterDoctor !== "all") {
      const doctorId = parseInt(filterDoctor);
      result = result.filter(r => r.doctor && parseInt(r.doctor.id) === doctorId);
    }

    // Filtrer par diagnostic IA
    if (filterDiagnostic === "with_ia") {
      result = result.filter(r => r.auto_diagnostic);
    } else if (filterDiagnostic === "without_ia") {
      result = result.filter(r => !r.auto_diagnostic);
    }

    // Filtrer par créneaux
    if (filterSlots === "with_slots") {
      result = result.filter(r => r.patient_options && r.patient_options.length > 0);
    } else if (filterSlots === "without_slots") {
      result = result.filter(r => !r.patient_options || r.patient_options.length === 0);
    }

    // Trier
    result.sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          return new Date(b.created_at) - new Date(a.created_at);
        case "date_asc":
          return new Date(a.created_at) - new Date(b.created_at);
        case "urgency":
          return getUrgencyLevel(b) - getUrgencyLevel(a);
        case "doctor":
          const nameA = a.doctor?.full_name || '';
          const nameB = b.doctor?.full_name || '';
          return nameA.localeCompare(nameB);
        default:
          return 0;
      }
    });

    return result;
  }, [requests, sortBy, filterDoctor, filterDiagnostic, filterSlots]);

  return (
    <ReceptionistTemplate
      title="Demandes de RDV"
      breadcrumbs={[
        { label: "Accueil réception", to: "/reception" }, 
        { label: "Demandes de RDV", current: true }
      ]}
    >
      <div className="space-y-4">
        {/* En-tête compact avec actions */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Demandes de rendez-vous</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {filteredAndSortedRequests.length} demande{filteredAndSortedRequests.length > 1 ? 's' : ''} 
              {filteredAndSortedRequests.length !== requests.length && ` sur ${requests.length}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition ${
                showFilters 
                  ? 'bg-sky-50 border-sky-200 text-sky-700' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={() => fetchRequests(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium text-xs hover:bg-slate-50 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Panneau de filtres et tri */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Tri */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Trier par</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="date_desc">Date (plus récent)</option>
                  <option value="date_asc">Date (plus ancien)</option>
                  <option value="urgency">Urgence (diagnostic IA)</option>
                  <option value="doctor">Médecin (A-Z)</option>
                </select>
              </div>

              {/* Filtre médecin */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Médecin</label>
                <select
                  value={filterDoctor}
                  onChange={(e) => setFilterDoctor(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="all">Tous les médecins</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.full_name}</option>
                  ))}
                </select>
              </div>

              {/* Filtre diagnostic IA */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Diagnostic IA</label>
                <select
                  value={filterDiagnostic}
                  onChange={(e) => setFilterDiagnostic(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="all">Tous</option>
                  <option value="with_ia">Avec diagnostic IA</option>
                  <option value="without_ia">Sans diagnostic IA</option>
                </select>
              </div>

              {/* Filtre créneaux */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Créneaux</label>
                <select
                  value={filterSlots}
                  onChange={(e) => setFilterSlots(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="all">Tous</option>
                  <option value="with_slots">Avec créneaux proposés</option>
                  <option value="without_slots">Sans créneaux</option>
                </select>
              </div>
            </div>

            {/* Bouton reset filtres */}
            {(sortBy !== "date_desc" || filterDoctor !== "all" || filterDiagnostic !== "all" || filterSlots !== "all") && (
              <button
                onClick={() => {
                  setSortBy("date_desc");
                  setFilterDoctor("all");
                  setFilterDiagnostic("all");
                  setFilterSlots("all");
                }}
                className="text-xs text-sky-600 hover:text-sky-700 font-medium"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}

        {/* Liste des demandes */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-slate-200">
            <Loader2 className="w-10 h-10 text-sky-600 animate-spin mb-3" />
            <p className="text-slate-600 text-sm font-medium">Chargement des demandes...</p>
          </div>
        ) : filteredAndSortedRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-slate-200">
            <div className="p-3 rounded-full bg-slate-100 mb-3">
              <Inbox className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              {requests.length === 0 ? 'Aucune demande en attente' : 'Aucun résultat'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md text-center">
              {requests.length === 0 
                ? 'Les nouvelles demandes de consultation apparaîtront ici.' 
                : 'Essayez de modifier vos filtres pour voir plus de résultats.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAndSortedRequests.map((request) => (
              <ConsultationRequestCard
                key={request.id}
                request={request}
                onRequestUpdated={handleRequestUpdated}
              />
            ))}
          </div>
        )}
      </div>
    </ReceptionistTemplate>
  );
}

