import { useEffect, useState } from "react";
import { User, Calendar, MapPin, Droplet, Heart, AlertCircle, Ruler, Weight, Cake } from "lucide-react";
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
        <h2 className="text-lg font-semibold text-slate-900">A propos...</h2>
      </div>

      <div className="space-y-2">
        {/* Date de naissance & Age */}
        <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Date de naissance</div>
              <div className="text-sm font-semibold text-slate-900">
                {patient.date_naissance
                  ? new Date(patient.date_naissance).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : "Non renseignée"}
              </div>
            </div>
          </div>
        </div>

            <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <Cake className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Age</div>
              <div className="text-sm font-semibold text-slate-900">
                {age && <div className="text-sm  text-slate-800">{age} ans</div>}

              </div>
            </div>
          </div>
        </div>

        {/* Genre */}
        <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-pink-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Genre</div>
              <div className="text-sm font-semibold text-slate-900 capitalize">
                {patient.genre.toLowerCase() || "Non renseigné"}
              </div>
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-sky-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-slate-500">Adresse</div>
              <div className="text-sm font-semibold text-slate-900 truncate">
                {patient.adresse || "Non renseignée"}
              </div>
            </div>
          </div>
        </div>

        {/* Groupe sanguin */}
        <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <Droplet className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Groupe sanguin</div>
              <div className="text-sm font-semibold text-slate-900">
                {patient.blood_type || "Non renseigné"}
              </div>
            </div>
          </div>
        </div>

        {/* Taille & Poids */}
        <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <Ruler className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Taille & Poids</div>
              <div className="text-sm font-semibold text-slate-900">
                {patient.height_cm ? `${patient.height_cm} cm` : "—"} 
                {patient.height_cm && patient.weight_kg && " • "}
                {patient.weight_kg ? `${patient.weight_kg} kg` : ""}
              </div>
            </div>
          </div>
          {bmi && (
            <div className="text-sm font-bold text-emerald-600">
              IMC: {bmi}
            </div>
          )}
        </div>
      </div>

      {/* Allergies */}
      {patient.allergies && patient.allergies.length > 0 && (
        <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <div className="text-xs font-semibold text-amber-900">Allergies</div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {patient.allergies.map((allergy, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                {allergy}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Maladies chroniques */}
      {patient.chronic_diseases && patient.chronic_diseases.length > 0 && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-red-600" />
            <div className="text-xs font-semibold text-red-900">Maladies chroniques</div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {patient.chronic_diseases.map((disease, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                {disease}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
