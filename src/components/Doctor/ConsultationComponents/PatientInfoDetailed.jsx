import { useEffect, useState } from "react";
import { User, Calendar, MapPin, Droplet, Heart, AlertCircle, Ruler, Weight } from "lucide-react";
import api from "../../../api/axios";
import toast from "react-hot-toast";

export default function PatientInfoDetailed({ patientId }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      fetchPatient();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  async function fetchPatient() {
    try {
      setLoading(true);
      const res = await api.get(`/api/patients/${patientId}/`);
      const data = res.data?.data || res.data;
      setPatient(data);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger les informations du patient");
    } finally {
      setLoading(false);
    }
  }

  const calculateAge = (dateNaissance) => {
    if (!dateNaissance) return null;
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateBMI = (height, weight) => {
    if (!height || !weight) return null;
    const heightM = height / 100;
    return (weight / (heightM * heightM)).toFixed(1);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-slate-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <p className="text-sm text-slate-500">Informations patient non disponibles</p>
      </div>
    );
  }

  const age = calculateAge(patient.date_naissance);
  const bmi = calculateBMI(patient.height_cm, patient.weight_kg);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-5 h-5 text-sky-600" />
        <h2 className="text-lg font-semibold text-slate-900">Informations Détaillées du Patient</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date de naissance & Age */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500 mb-1">Date de naissance</div>
              <div className="text-sm font-semibold text-slate-900">
                {patient.date_naissance
                  ? new Date(patient.date_naissance).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : "Non renseignée"}
              </div>
              {age && <div className="text-xs text-slate-500 mt-1">{age} ans</div>}
            </div>
          </div>
        </div>

        {/* Genre */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-pink-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500 mb-1">Genre</div>
              <div className="text-sm font-semibold text-slate-900 capitalize">
                {patient.genre || "Non renseigné"}
              </div>
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500 mb-1">Adresse</div>
              <div className="text-sm font-semibold text-slate-900">
                {patient.adresse || "Non renseignée"}
              </div>
            </div>
          </div>
        </div>

        {/* Groupe sanguin */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <Droplet className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500 mb-1">Groupe sanguin</div>
              <div className="text-sm font-semibold text-slate-900">
                {patient.blood_type || "Non renseigné"}
              </div>
            </div>
          </div>
        </div>

        {/* Taille & Poids */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Ruler className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500 mb-1">Taille & Poids</div>
              <div className="text-sm font-semibold text-slate-900">
                {patient.height_cm ? `${patient.height_cm} cm` : "—"} 
                {patient.height_cm && patient.weight_kg && " • "}
                {patient.weight_kg ? `${patient.weight_kg} kg` : ""}
              </div>
              {bmi && (
                <div className="text-xs text-slate-500 mt-1">
                  IMC: {bmi} kg/m²
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clinique */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-sky-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500 mb-1">Clinique</div>
              <div className="text-sm font-semibold text-slate-900">
                {patient.clinic?.name || "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Allergies */}
      {patient.allergies && patient.allergies.length > 0 && (
        <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-amber-900 mb-2">Allergies</div>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((allergy, idx) => (
                  <span key={idx} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maladies chroniques */}
      {patient.chronic_diseases && patient.chronic_diseases.length > 0 && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-100">
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-red-900 mb-2">Maladies chroniques</div>
              <div className="flex flex-wrap gap-2">
                {patient.chronic_diseases.map((disease, idx) => (
                  <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                    {disease}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
