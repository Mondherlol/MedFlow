import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, FileText, Pill, Activity, Save, X } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import { getImageUrl } from "../../utils/image";

export default function ConsultationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [consultation, setConsultation] = useState(location.state?.consultation || null);
  const [loading, setLoading] = useState(!consultation);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [diagnostique, setDiagnostique] = useState("");
  const [ordonnance, setOrdonnance] = useState("");

  useEffect(() => {
    if (consultation) {
      setDiagnostique(consultation.diagnostique || "");
      setOrdonnance(consultation.ordonnance || "");
    }
  }, [consultation]);

  useEffect(() => {
    if (!consultation && id) {
      fetchConsultation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchConsultation() {
    try {
      setLoading(true);
      const res = await api.get(`/api/consultations/${id}/`);
      const data = res.data?.data || res.data;
      setConsultation(data);
      setDiagnostique(data.diagnostique || "");
      setOrdonnance(data.ordonnance || "");
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger la consultation");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      const payload = {
        diagnostique,
        ordonnance,
      };
      
      await api.patch(`/api/consultations/${id}/`, payload);
      toast.success("Consultation mise à jour avec succès");
      setEditMode(false);
      
      // Refresh consultation data
      fetchConsultation();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDiagnostique(consultation?.diagnostique || "");
    setOrdonnance(consultation?.ordonnance || "");
    setEditMode(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/60 p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="bg-white rounded-2xl p-6 space-y-4">
              <div className="h-6 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/60 p-6 md:p-10">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-slate-500">Consultation non trouvée</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-sky-600 hover:underline">
            Retour
          </button>
        </div>
      </div>
    );
  }

  const patient = consultation.patient;
  const patientName = patient?.full_name || "Patient inconnu";
  const duration = consultation.heure_fin && consultation.heure_debut
    ? Math.round(
        ((new Date(`1970-01-01T${consultation.heure_fin}`) - new Date(`1970-01-01T${consultation.heure_debut}`)) / 1000 / 60)
      )
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/60 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <div className="flex items-center gap-3">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Modifier
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Sauvegarde..." : "Sauvegarder"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Patient Info Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-semibold text-xl">
              {patient?.photo_url ? (
                <img
                  src={getImageUrl(patient.photo_url)}
                  alt={patientName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                patientName.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-slate-900">{patientName}</h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                {patient?.email && (
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {patient.email}
                  </span>
                )}
                {patient?.phone && <span>{patient.phone}</span>}
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
              consultation.statusConsultation === "confirme" ? "bg-emerald-100 text-emerald-700" :
              consultation.statusConsultation === "annule" ? "bg-red-100 text-red-700" :
              consultation.statusConsultation === "termine" ? "bg-slate-100 text-slate-700" :
              "bg-amber-100 text-amber-700"
            }`}>
              {consultation.statusConsultation || "En attente"}
            </div>
          </div>
        </div>

        {/* Consultation Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Date</div>
                <div className="text-sm font-semibold text-slate-900">
                  {new Date(consultation.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Horaire</div>
                <div className="text-sm font-semibold text-slate-900">
                  {consultation.heure_debut} - {consultation.heure_fin}
                  {duration && <span className="text-xs text-slate-400 ml-2">({duration} min)</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <User className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Médecin</div>
                <div className="text-sm font-semibold text-slate-900">
                  {consultation.doctor?.full_name || user?.doctor?.user?.full_name || "—"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auto Diagnostic */}
        {consultation.auto_diagnostic && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-sky-600" />
              <h2 className="text-lg font-semibold text-slate-900">Auto-diagnostic du patient</h2>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700">
              {consultation.auto_diagnostic}
            </div>
          </div>
        )}

        {/* Diagnostique */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-semibold text-slate-900">Diagnostic médical</h2>
          </div>
          {editMode ? (
            <textarea
              value={diagnostique}
              onChange={(e) => setDiagnostique(e.target.value)}
              placeholder="Saisissez le diagnostic..."
              className="w-full h-32 px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
            />
          ) : (
            <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 min-h-[8rem]">
              {diagnostique || <span className="text-slate-400">Aucun diagnostic saisi</span>}
            </div>
          )}
        </div>

        {/* Ordonnance */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <Pill className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-semibold text-slate-900">Ordonnance</h2>
          </div>
          {editMode ? (
            <textarea
              value={ordonnance}
              onChange={(e) => setOrdonnance(e.target.value)}
              placeholder="Saisissez l'ordonnance..."
              className="w-full h-40 px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none font-mono text-sm"
            />
          ) : (
            <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 min-h-[10rem] font-mono whitespace-pre-wrap">
              {ordonnance || <span className="text-slate-400 font-sans">Aucune ordonnance rédigée</span>}
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Créé le {new Date(consultation.created_at).toLocaleString('fr-FR')}</span>
          <span>Modifié le {new Date(consultation.updated_at).toLocaleString('fr-FR')}</span>
        </div>
      </div>
    </div>
  );
}
