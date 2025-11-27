// pages/Patient/MyAppointments.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import toast from "react-hot-toast";
import api from "../../api/axios";

import ConsultationCard from "../../components/Patient/ConsultationCard";
import RequestCard from "../../components/Patient/RequestCard";
import PatientTemplate from "../../components/Patient/PatientTemplate";

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export default function MyAppointments() {
  const { user } = useAuth() || {};
  const query = useQuery();
  const navigate = useNavigate();

  const [tab, setTab] = useState(query.get("tab") || "consultations");
  const [consultations, setConsultations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingConsultations, setLoadingConsultations] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    const qtab = query.get("tab");
    if (qtab === "requests" || qtab === "consultations") setTab(qtab);
  }, [query]);

  useEffect(() => {
    if (!user) return;
    fetchConsultations();
    fetchRequests();
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    navigate({ search: params.toString() }, { replace: true });
  }, [tab]);

  async function fetchConsultations() {
    setLoadingConsultations(true);
    try {
      const res = await api.get(`/api/consultations/by-patient/?patient=${user.id}/`);
      setConsultations(res.data.data || res.data || []);
    } catch (e) {
      toast.error("Erreur lors du chargement des consultations");
    } finally {
      setLoadingConsultations(false);
    }
  }

  async function fetchRequests() {
    setLoadingRequests(true);
    try {
      const res = await api.get("/api/consultation-requests/my-requests/");
      setRequests(res.data || []);
    } catch (e) {
      toast.error("Erreur lors du chargement des demandes");
    } finally {
      setLoadingRequests(false);
    }
  }

  return (
    <PatientTemplate
      title="Mes rendez-vous"
      breadcrumbs={[
        { label: "Accueil", to: "/patient" },
        { label: "Mes rendez-vous" },
      ]}
    >
      <div className="space-y-8">

        {/* TABS */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex gap-2">
          <button
            onClick={() => setTab("consultations")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              tab === "consultations"
                ? "bg-slate-900 text-white shadow"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Consultations
          </button>

          <button
            onClick={() => setTab("requests")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              tab === "requests"
                ? "bg-slate-900 text-white shadow"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Demandes
          </button>
        </div>

        {/* CONTENT */}
        {tab === "consultations" && (
          <div className="space-y-4">
            {loadingConsultations ? (
              <div className="py-12 text-center text-slate-500">
                Chargement des consultations…
              </div>
            ) : consultations.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                Vous n'avez aucune consultation.
              </div>
            ) : (
              consultations.map((c) => (
                <ConsultationCard key={c.id} consultation={c} />
              ))
            )}
          </div>
        )}

        {tab === "requests" && (
          <div className="space-y-4">
            {loadingRequests ? (
              <div className="py-12 text-center text-slate-500">
                Chargement des demandes…
              </div>
            ) : requests.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                Vous n'avez aucune demande envoyée.
              </div>
            ) : (
              requests.map((r) => <RequestCard key={r.id} request={r} onRequestDeleted={fetchRequests} />)
            )}
          </div>
        )}
      </div>
    </PatientTemplate>
  );
}
