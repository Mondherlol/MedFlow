import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PatientTemplate from "../../components/Patient/PatientTemplate";
import { useAuth } from "../../context/authContext";
import { useClinic } from "../../context/clinicContext";
import api from "../../api/axios";
import { getImageUrl } from "../../utils/image";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Heart,
  Droplet,
  Activity,
  AlertCircle,
  Ruler,
  Weight,
  Camera,
  Save,
  X,
  Loader2,
} from "lucide-react";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = [
  { value: "M", label: "Homme" },
  { value: "F", label: "Femme" },
  { value: "other", label: "Autre" },
];

const UpdatePatientInfos = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { clinic } = useClinic();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_naissance: "",
    adresse: "",
    genre: "",
    blood_type: "",
    height_cm: "",
    weight_kg: "",
    allergies: [],
    chronic_diseases: [],
  });

  const [allergyInput, setAllergyInput] = useState("");
  const [diseaseInput, setDiseaseInput] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        date_naissance: user.date_naissance || "",
        adresse: user.adresse || "",
        genre: user.genre || "",
        blood_type: user.blood_type || "",
        height_cm: user.height_cm || "",
        weight_kg: user.weight_kg || "",
        allergies: user.allergies || [],
        chronic_diseases: user.chronic_diseases || [],
      });
      if (user.photo) {
        setPreviewImage(getImageUrl(user.photo));
      }
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5 Mo");
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPreviewImage(null);
  };

  const addAllergy = () => {
    if (allergyInput.trim() && !formData.allergies.includes(allergyInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        allergies: [...prev.allergies, allergyInput.trim()],
      }));
      setAllergyInput("");
    }
  };

  const removeAllergy = (index) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }));
  };

  const addDisease = () => {
    if (diseaseInput.trim() && !formData.chronic_diseases.includes(diseaseInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        chronic_diseases: [...prev.chronic_diseases, diseaseInput.trim()],
      }));
      setDiseaseInput("");
    }
  };

  const removeDisease = (index) => {
    setFormData((prev) => ({
      ...prev,
      chronic_diseases: prev.chronic_diseases.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!clinic?.id) {
      toast.error("Erreur : clinique non trouvée");
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();
      
      // Ajouter la clinique (obligatoire)
      data.append("clinic_id", clinic.id);

      // Ajouter les champs texte
      Object.keys(formData).forEach((key) => {
        if (key === "allergies" || key === "chronic_diseases") {
          data.append(key, JSON.stringify(formData[key]));
        } else if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      // Ajouter la photo si elle a été modifiée
      if (photoFile) {
        data.append("photo", photoFile);
      }

      const response = await api.patch(`/api/patients/${user.id}/`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        toast.success("Vos informations ont été mises à jour avec succès !");
        // Mettre à jour l'utilisateur dans le contexte
        setUser(response.data);
        navigate("/patient");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour de vos informations"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PatientTemplate
        title="Modifier mes informations"
        breadcrumbs={[
          { label: "Accueil", to: "/patient" },
          { label: "Modifier mes informations" },
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
        </div>
      </PatientTemplate>
    );
  }

  return (
    <PatientTemplate
      title="Modifier mes informations"
      breadcrumbs={[
        { label: "Accueil", to: "/patient" },
        { label: "Modifier mes informations" },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Photo de profil */}
        <div className="bg-linear-to-br from-sky-50 to-blue-50 rounded-2xl p-6 border border-sky-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-sky-600" />
            Photo de profil
          </h3>
          <div className="flex items-start gap-6">
            <div className="relative">
              {previewImage ? (
                <div className="relative group">
                  <img
                    src={previewImage}
                    alt="Photo de profil"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-0 right-0 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-lg">
                  <User className="w-12 h-12 text-slate-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600 mb-3">
                Choisissez une photo de profil pour personnaliser votre compte.
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-sky-300 border-dashed text-sky-700 rounded-xl cursor-pointer hover:bg-sky-50 transition font-medium text-sm">
                <Camera className="w-4 h-4" />
                Choisir une photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-slate-500 mt-2">
                Format : JPG, PNG (max 5 Mo)
              </p>
            </div>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            Informations personnelles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nom complet *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  placeholder="Jean Dupont"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  placeholder="jean.dupont@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  placeholder="+216 12 345 678"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Date de naissance
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  name="date_naissance"
                  value={formData.date_naissance}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Genre
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition appearance-none bg-white"
                >
                  <option value="">Sélectionnez</option>
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Adresse
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition resize-none"
                  placeholder="123 Rue de la République, Tunis"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Informations médicales */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-600" />
            Informations médicales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Groupe sanguin
              </label>
              <div className="relative">
                <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  name="blood_type"
                  value={formData.blood_type}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition appearance-none bg-white"
                >
                  <option value="">Sélectionnez</option>
                  {BLOOD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Taille (cm)
                </label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    name="height_cm"
                    value={formData.height_cm}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    placeholder="175"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Poids (kg)
                </label>
                <div className="relative">
                  <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    name="weight_kg"
                    value={formData.weight_kg}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    placeholder="70"
                  />
                </div>
              </div>
            </div>

            {/* Allergies */}
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Allergies
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAllergy())}
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  placeholder="Ex: Pénicilline, Arachides..."
                />
                <button
                  type="button"
                  onClick={addAllergy}
                  className="px-4 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition font-medium"
                >
                  Ajouter
                </button>
              </div>
              {formData.allergies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.allergies.map((allergy, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 text-sm font-medium"
                    >
                      {allergy}
                      <button
                        type="button"
                        onClick={() => removeAllergy(idx)}
                        className="hover:text-amber-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Maladies chroniques */}
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Maladies chroniques
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={diseaseInput}
                  onChange={(e) => setDiseaseInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addDisease())}
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  placeholder="Ex: Diabète, Hypertension..."
                />
                <button
                  type="button"
                  onClick={addDisease}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
                >
                  Ajouter
                </button>
              </div>
              {formData.chronic_diseases.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.chronic_diseases.map((disease, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 text-sm font-medium"
                    >
                      {disease}
                      <button
                        type="button"
                        onClick={() => removeDisease(idx)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate("/patient")}
            disabled={submitting}
            className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-linear-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-500/30"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </form>
    </PatientTemplate>
  );
};

export default UpdatePatientInfos;