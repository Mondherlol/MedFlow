import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MedecinTemplate from "../../components/Doctor/MedecinTemplate";
import { useAuth } from "../../context/authContext";
import { useClinic } from "../../context/clinicContext";
import api from "../../api/axios";
import { getImageUrl } from "../../utils/image";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  Stethoscope,
  FileText,
  DoorOpen,
  Camera,
  Save,
  X,
  Loader2,
  Award,
} from "lucide-react";

const SPECIALITES = [
  { value: "", label: "-- Sélectionnez une spécialité --" },
  { value: "Cardiology", label: "Cardiologie" },
  { value: "Pulmonology", label: "Pneumologie" },
  { value: "Neurology", label: "Neurologie" },
  { value: "Dermatology", label: "Dermatologie" },
  { value: "Pediatrics", label: "Pédiatrie" },
  { value: "Gynecology", label: "Gynécologie" },
  { value: "Orthopedics", label: "Orthopédie" },
  { value: "Endocrinology", label: "Endocrinologie" },
  { value: "Gastroenterology", label: "Gastroentérologie" },
  { value: "Urology", label: "Urologie" },
  { value: "Ophthalmology", label: "Ophtalmologie" },
  { value: "Other", label: "Autre" },
];

const EditDoctorInfos = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { clinic } = useClinic();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [doctorData, setDoctorData] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    specialite: "",
    bio: "",
    numero_salle: "",
  });

  useEffect(() => {
    fetchDoctorData();
  }, [user]);

  const fetchDoctorData = async () => {
    if (!user?.id) return;
    
    try {
      // Récupérer les données du médecin
      const response = await api.get(`/api/doctors/${user.doctor.id}/`);
      const doctor = response.data;
      setDoctorData(doctor);

      setFormData({
        full_name: doctor.user?.full_name || "",
        email: doctor.user?.email || "",
        phone: doctor.user?.phone || "",
        specialite: doctor.specialite || "",
        bio: doctor.bio || "",
        numero_salle: doctor.numero_salle || "",
      });

      if (doctor.user?.photo_url) {
        setPreviewImage(getImageUrl(doctor.user.photo_url));
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast.error("Erreur lors du chargement de vos informations");
      setLoading(false);
    }
  };

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
    setPreviewImage(doctorData?.user?.photo ? getImageUrl(doctorData.user.photo) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!clinic?.id || !doctorData?.id) {
      toast.error("Erreur : données manquantes");
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();
      
      // Ajouter la clinique (obligatoire)
      data.append("clinic_id", clinic.id);

      // Ajouter les champs
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      // Ajouter la photo si elle a été modifiée
      if (photoFile) {
        data.append("photo", photoFile);
      }

      const response = await api.patch(`/api/doctors/${doctorData.id}/`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        toast.success("Vos informations ont été mises à jour avec succès !");
        // Mettre à jour l'utilisateur dans le contexte si nécessaire
        if (response.data.user) {
          setUser(response.data.user);
        }
        navigate("/doctor");
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
      <MedecinTemplate
        title="Modifier mes informations"
        breadcrumbs={[
          { label: "Accueil", to: "/doctor" },
          { label: "Modifier mes informations" },
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </MedecinTemplate>
    );
  }

  return (
    <MedecinTemplate
      title="Modifier mes informations"
      breadcrumbs={[
        { label: "Accueil", to: "/doctor" },
        { label: "Modifier mes informations" },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Photo de profil */}
        <div className="bg-linear-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-600" />
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
                  {photoFile && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute top-0 right-0 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-lg">
                  <Stethoscope className="w-12 h-12 text-slate-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600 mb-3">
                Choisissez une photo de profil professionnelle pour votre compte médecin.
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-indigo-300 border-dashed text-indigo-700 rounded-xl cursor-pointer hover:bg-indigo-50 transition font-medium text-sm">
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
            <User className="w-5 h-5 text-blue-600" />
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
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="Dr. Jean Dupont"
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
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="dr.dupont@email.com"
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
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="+216 12 345 678"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Numéro de salle
              </label>
              <div className="relative">
                <DoorOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="numero_salle"
                  value={formData.numero_salle}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="A101"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Informations professionnelles */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Informations professionnelles
          </h3>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Spécialité *
              </label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  name="specialite"
                  value={formData.specialite}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none bg-white"
                >
                  {SPECIALITES.map((spec) => (
                    <option key={spec.value} value={spec.value}>
                      {spec.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Biographie / Présentation
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                  placeholder="Décrivez votre parcours, vos spécialités, votre approche médicale..."
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Cette description sera visible par vos patients sur votre profil.
              </p>
            </div>
          </div>
        </div>



        {/* Boutons d'action */}
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate("/doctor")}
            disabled={submitting}
            className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 cursor-pointer py-3 bg-linear-to-r from-indigo-600 to-sky-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-sky-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-500/30"
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
    </MedecinTemplate>
  );
};

export default EditDoctorInfos;
