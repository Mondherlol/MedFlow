// src/pages/superadmin/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  UsersRound,
  Activity,
  CheckCircle2,
  Clock,
  Globe,
  ShieldCheck,
  Ban,
  PlayCircle,
} from "lucide-react";


import StatCard from "../../components/SuperAdmin/Dashboard/StatCard";
import Button from "../../components/SuperAdmin/Dashboard/Button";
import ClinicRequestsList from "../../components/SuperAdmin/Dashboard/ClinicRequestsList";
import ClinicsList from "../../components/SuperAdmin/Dashboard/ClinicsList";
import api from "../../api/axios";
import toast from "react-hot-toast";

const tokens = {
  page: "bg-gradient-to-b from-sky-50 via-white to-white text-slate-800",
  border: "border-slate-200",
  pill: "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs",
  rowHover: "hover:bg-sky-50/60",
  stickyHead: "sticky top-0 z-10 bg-slate-50/95 backdrop-blur",
  focus: "focus:outline-none focus:ring-2 focus:ring-sky-200",
};


export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = () => {
    setLoading(true);
    api.get("/api/superadmin-stats/summary/")
      .then((response) => {
        setStats(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        toast.error("Erreur lors du chargement des statistiques.");
        console.error("Error fetching stats:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <main className={`min-h-screen ${tokens.page}`}>
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs text-sky-800">
              <ShieldCheck className="h-3.5 w-3.5" /> Espace Super Admin
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Console de supervision</h1>
            <p className="text-sm text-slate-600">Gérez les cliniques, validez les demandes et suivez l’utilisation.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="orange" className={`hidden sm:inline-flex ${tokens.focus}`}>
              <PlayCircle className="h-4 w-4" />
              Démarrer une démo
            </Button>
            <Button variant="outline" className={tokens.focus}>
              <Globe className="h-4 w-4" />
              État global
            </Button>
          </div>
        </div>

  
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Building2 className="h-5 w-5" />} label="Cliniques actives" value={stats?.clinics_active} sub={`+${stats?.clinics_created_this_month} ce mois`}  loading={loading}/>
          <StatCard icon={<Clock className="h-5 w-5" />}     label="Demandes en attente" value={stats?.clinic_requests_pending} sub={`Réponse moyenne ${stats?.avg_response_days}h`} loading={loading} />
          <StatCard icon={<UsersRound className="h-5 w-5" />} label="Utilisateurs totaux" value={stats?.users_total} sub={`+${stats?.users_created_this_week} cette semaine`} loading={loading} />
          <StatCard icon={<Activity className="h-5 w-5" />}   label="Disponibilité globale" value={stats?.clinics_active_percent+"%"} sub="30j glissants" loading={loading} />
        </div>
        
        {/* Demandes de création */}
        <ClinicRequestsList fetchStats={fetchStats} />

        {/* Gestion des cliniques */}
        <ClinicsList tokens={tokens} fetchStats={fetchStats} />

        {/* Bandeau bas (actions rapides) */}
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className={`${tokens.card} ${tokens.cardHover} p-6`}>
            <h3 className="text-base font-semibold">Créer une clinique manuellement</h3>
            <p className="mt-1 text-sm text-slate-600">Renseignez les informations et attribuez un sous-domaine.</p>
            <div className="mt-4 flex gap-2">
              <Button variant="orange" className={tokens.focus}>Nouveau tenant</Button>
              <Button variant="outline" className={tokens.focus}>Voir demandes</Button>
            </div>
          </div>
          <div className={`${tokens.card} ${tokens.cardHover} p-6`}>
            <h3 className="text-base font-semibold">Mettre une clinique en maintenance</h3>
            <p className="mt-1 text-sm text-slate-600">Informer les utilisateurs et geler les actions critiques.</p>
            <div className="mt-4 flex gap-2">
              <Button variant="orange" className={tokens.focus}>
                <Ban className="h-4 w-4" /> Activer maintenance
              </Button>
              <Button variant="outline" className={tokens.focus}>Paramètres</Button>
            </div>
          </div>
        </div>

        {/* Légende JSP on verra plus tard */}
        <div className="mt-8 text-xs text-slate-500">
          <p className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Aucune panne detectée durant les 30 derniers jours.
          </p>
        </div>
      </div>
    </main>
  );
}
