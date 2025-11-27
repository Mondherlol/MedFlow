import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, Save, X, FileText } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import { getImageUrl } from "../../utils/image";
import HistoriqueMedical from "../../components/Doctor/ConsultationComponents/HistoriqueMedical";
import PatientInfoDetailed from "../../components/Doctor/ConsultationComponents/PatientInfoDetailed";
import DiagnosticEditor from "../../components/Doctor/ConsultationComponents/DiagnosticEditor";
import OrdonnanceEditor from "../../components/Doctor/ConsultationComponents/OrdonnanceEditor";
import AutoDiagnosticAI from "../../components/Doctor/ConsultationComponents/AutoDiagnosticAI";
import { getStatusText } from "../../utils/statusUtils";

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
    if (id) {
      fetchConsultation();
    }
  }, [id]);

  async function fetchConsultation() {
    try {
      setLoading(true);
      const res = await api.get(`/api/consultations/${id}/`);
      const data = res.data?.data || res.data;
      setConsultation(data);
      setDiagnostique(data.diagnostique || "");
      setOrdonnance(data.ordonnance || "");
      console.log("Fetched consultation:", data);
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
              consultation.statusConsultation === "confirme" ? "bg-orange-100 text-orange-700" :
              consultation.statusConsultation === "annule" ? "bg-red-100 text-red-700" :
              consultation.statusConsultation === "termine" ? "bg-sky-100 text-sky-700" :
              consultation.statusConsultation === "encours" ? "bg-green-100 text-green-700" :
              "bg-amber-100 text-amber-700"
            }`}>
              { getStatusText(consultation.statusConsultation)}
            </div>
          </div>
        </div>

        {/* Consultation Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        {/* Auto Diagnostic IA */}
        {consultation.auto_diagnostic && (
          <AutoDiagnosticAI autoDiagnostic={consultation.auto_diagnostic} />
        )}

        {/* Grid Layout: 2 columns - Left (diagnostic/ordonnance) | Right (patient info) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - 3/4 width */}
          <div className="lg:col-span-3 space-y-6">
            <DiagnosticEditor
              value={diagnostique}
              onChange={setDiagnostique}
              editMode={editMode}
            />

            <OrdonnanceEditor
              value={ordonnance}
              onChange={setOrdonnance}
              editMode={editMode}
              patientName={patientName}
            />

            {/* Historique below ordonnance */}
            <HistoriqueMedical 
              patientId={patient?.id} 
              currentConsultationId={consultation.id}
            />
          </div>

          {/* Right Column - 1/4 width - Sticky */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <PatientInfoDetailed patientId={patient?.id} />
            </div>
          </div>
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
