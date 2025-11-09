import React, { useState } from 'react';
import { X, Loader2, Check, LockKeyhole, Eye, EyeOff } from 'lucide-react';
import api from '../../../api/axios';
import toast from 'react-hot-toast';

export default function ChangePasswordModal({ isOpen, onClose, userId, onSuccess }) {
  if (!isOpen) return null;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!password || password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append('password', password);
      await api.patch(`/api/receptionists/${userId}/`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Mot de passe mis à jour');
      onSuccess?.();
    } catch (err) {
      console.error('Error changing password:', err);
      toast.error('Impossible de changer le mot de passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center rounded-xl bg-violet-50 ring-1 ring-violet-100 text-violet-600 p-2">
              <LockKeyhole className="w-4 h-4" />
            </span>
            <h3 className="text-base font-semibold text-slate-900">Changer le mot de passe</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700">Nouveau mot de passe</label>
            <input
              type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 pr-10 text-sm
                         focus:outline-none focus:ring-2 focus:ring-sky-200"
              required
                placeholder="Nouveau mot de passe"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute right-2 top-8 rounded-md p-1 text-slate-500 hover:text-slate-700 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-slate-700">Confirmer</label>
            <input
              type={showConfirm ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 pr-10 text-sm
                         focus:outline-none focus:ring-2 focus:ring-sky-200"
              required
              placeholder="Confirmer le mot de passe"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              aria-label={showConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute right-2 top-8 rounded-md p-1 text-slate-500 hover:text-slate-700 focus:outline-none"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm hover:bg-slate-50
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
            >
              Annuler
            </button>
            <button
              type="submit" disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm
                         hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-300 disabled:opacity-80"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Changer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
