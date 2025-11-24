import React, { useEffect, useState } from 'react';
import { X, Loader2, Check, Image as ImageIcon, Trash2, BadgePlus, Mail, User, Phone as PhoneIcon } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useClinic } from '../../../context/clinicContext';

export default function UserModal({
  isOpen,
  onClose,
  editingUser,
  name, setName,
  email, setEmail,
  password, setPassword,
  phone, setPhone,
  photo, setPhoto,
  specialite, setSpecialite,
  onSubmit,
  actionLoading,
  isDoctor = false,
}) {
  if (!isOpen) return null;

  const [previewSrc, setPreviewSrc] = useState(null);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const { clinic } = useClinic();

  useEffect(() => {
    let objectUrl = null;
    if (photo instanceof File) {
      objectUrl = URL.createObjectURL(photo);
      setPreviewSrc(objectUrl);
    } else if (!photo && editingUser?.user?.photo) {
      setPreviewSrc(editingUser.user.photo);
    } else if (!photo) {
      setPreviewSrc(null);
    }
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [photo, editingUser]);

  const validatePassword = (value = password) => {
    if (!editingUser) {
      if (!value || value.trim().length === 0) {
        setPasswordError('Le mot de passe est requis'); return false;
      }
    }
    if (value && value.length > 0 && value.length < 6) {
      setPasswordError('Minimum 6 caractères'); return false;
    }
    setPasswordError(''); return true;
  };

  const PhotoPicker = ({ label }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-1 flex items-center gap-3">
        <label
          htmlFor="user-photo"
          className="inline-flex items-center gap-2 cursor-pointer rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          <ImageIcon className="w-4 h-4 text-slate-500" />
          <span>Choisir une photo</span>
          <input id="user-photo" type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} className="sr-only" />
        </label>


        

        {previewSrc ? (
          <div className="relative">
            <img src={previewSrc} alt="aperçu" className="h-16 w-16 rounded-lg object-cover border border-slate-200" />
            <button
              type="button"
              onClick={() => { setPhoto(null); setPreviewSrc(null); }}
              title="Supprimer la photo"
              className="absolute -top-2 -right-2 inline-flex items-center justify-center rounded-full bg-white p-1 text-slate-500 shadow"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <i className="w-4 h-4 block bg-slate-200 rounded" />
             Aucune selection
          </div>
        )}


        
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center rounded-xl bg-sky-50 ring-1 ring-sky-100 text-sky-600 p-2">
              <BadgePlus className="w-4 h-4" />
            </span>
            <h3 className="text-base font-semibold text-slate-900">
              {editingUser ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-sky-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-5 pb-5 space-y-5">
          {/* Nom / Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Nom complet <span className="text-red-500">*</span></label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Jean Dupont"
                  className="pl-9 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-sky-200 focus:border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Email <span className="text-red-500">*</span></label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ex@domaine.tld"
                  className="pl-9 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-sky-200 focus:border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Téléphone + (Photo si édition) / Mot de passe si création */}
          {editingUser ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Téléphone</label>
                <div className="mt-1 relative">
                  <PhoneIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400 z-10" />
                  <div className="pl-8 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-sky-200 focus-within:border-slate-300">
                    <PhoneInput
                      international defaultCountry={clinic?.country || 'TN'}
                      value={phone} onChange={setPhone}
                      className="w-full px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              <PhotoPicker label="Nouvelle photo" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Mot de passe <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (passwordTouched) validatePassword(e.target.value); }}
                    onBlur={() => { setPasswordTouched(true); validatePassword(); }}
                    className={`mt-1 block w-full rounded-2xl border ${
                      passwordError ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-sky-200 focus:border-slate-300'
                    } bg-white px-4 py-2 text-sm focus:outline-none`}
                    required
                    aria-invalid={!!passwordError}
                  />
                  {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Téléphone</label>
                  <div className="mt-1 relative">
                    <PhoneIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400 z-10" />
                    <div className="pl-8 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-sky-200 focus-within:border-slate-300">
                      <PhoneInput
                        international defaultCountry={clinic?.country || 'TN'}
                        value={phone} onChange={setPhone}
                        className="w-full px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <PhotoPicker label="Photo (optionnel)" />
            </>
          )}
  
          {isDoctor && (
          <div>
            <label className="block text-sm font-medium text-slate-700">Spécialité</label>
            <div className="mt-1 relative">
              <select
                value={specialite ?? ''}
                onChange={(e) => setSpecialite(e.target.value)}
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-sky-200 focus:border-slate-300"
              >
                <option value="">-- Aucune --</option>
                <option value="Cardiology">Cardiologie</option>
                <option value="Pulmonology">Pneumologie</option>
                <option value="Neurology">Neurologie</option>
                <option value="Dermatology">Dermatologie</option>
                <option value="Pediatrics">Pédiatrie</option>
                <option value="Gynecology">Gynécologie</option>
                <option value="Orthopedics">Orthopédie</option>
                <option value="Endocrinology">Endocrinologie</option>
                <option value="Gastroenterology">Gastroentérologie</option>
                <option value="Urology">Urologie</option>
                <option value="Ophthalmology">Ophtalmologie</option>
                <option value="Other">Autre</option>
              </select>
            </div>
          </div>
          )}


          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-200">Annuler</button>
            <button type="submit" disabled={actionLoading} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-300 disabled:opacity-80">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {editingUser ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
