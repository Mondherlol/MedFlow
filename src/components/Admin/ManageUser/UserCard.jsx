import React, { useState } from 'react';
import {
  User as UserIcon, Edit2, Trash2, Key, ShieldCheck, Mail, Phone, BadgeCheck, MoreHorizontal,
  Settings
} from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';
import EditDoctorInfosModal from './EditDoctorInfosModal';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


export default function UserCard({
  record,
  onEdit,
  onDelete,
  onDoctorSaved,
  actionLoading,
  brandPrimary = 'indigo',
  variant = 'tile',
}) {
  const u = record?.user || record || {};
  const [openChangePwd, setOpenChangePwd] = useState(false);
  const [openDoctorModal, setOpenDoctorModal] = useState(false);

  const name  = u.full_name || u.name || '—';
  const email = u.email || '—';
  const phone = u.phone || '';
  const role  = u.role || record?.role || 'Utilisateur';
  const photo = u.photo_url ? `${API_URL}/${u.photo_url}` : null;

  const initials = name
    .split(' ')
    .map((s) => s?.[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const Avatar = (
    <>
      {photo ? (
        <img src={photo} alt={name} className="h-12 w-12 rounded-full object-cover border border-slate-200" />
      ) : (
        <div className="h-12 w-12 rounded-full bg-slate-100 grid place-items-center text-slate-600 font-semibold">
          {initials || <UserIcon className="w-5 h-5" />}
        </div>
      )}
    </>
  );

  if (variant === 'line') {
    // Variante "ligne" compacte (liste dense)
    return (
      <>
        <div className="group rounded-xl border border-slate-100 bg-white p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
          <div className="flex items-center gap-3">
            {Avatar}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="font-medium text-slate-900 truncate">{name}</div>
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-slate-50 ring-1 ring-inset ring-slate-200 text-slate-700">
                  <BadgeCheck className="w-3 h-3 text-emerald-500" /> {role}
                </span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {email}</span>
                {phone && <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {phone}</span>}
              </div>
            </div>
            

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit?.(record)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-200"
                title="Modifier"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpenChangePwd(true)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-200"
                title="Changer mot de passe"
              >
                <Key className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete?.(record)}
                disabled={actionLoading}
                className="rounded-lg bg-red-600 px-2.5 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-300 disabled:opacity-80"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-slate-500 inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Compte actif — données protégées.
          </div>
        </div>

        <ChangePasswordModal
          isOpen={openChangePwd}
          onClose={() => setOpenChangePwd(false)}
          userId={record.user.id}
          onSuccess={() => setOpenChangePwd(false)}
        />
      </>
    );
  }

  // Variante "tile" (carte avec header glassy et footer actions)
  return (
    <>
      <div className="group relative rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {Avatar}
            <div>
              <div className="font-semibold text-slate-900">{name}</div>
              <div className="text-xs text-slate-500">{email}</div>
            </div>
          </div>
          <span className="rounded-full bg-slate-50 ring-1 ring-inset ring-slate-200 px-2.5 py-1 text-[11px] text-slate-700 inline-flex items-center gap-1">
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" /> {role}
          </span>
        </div>

        <div className="px-4 pb-3">
          {phone && (
            <div className="inline-flex items-center gap-1 rounded-lg bg-slate-50 ring-1 ring-inset ring-slate-200 px-2.5 py-1 text-xs text-slate-700">
              <Phone className="w-3.5 h-3.5" /> {phone}
            </div>
          )}
          <div className="mt-2 text-[11px] text-slate-500 inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Compte actif — données protégées.
          </div>
        </div>

        {/* footer actions */}
        <div className="border-t border-slate-100 px-4 py-2.5 flex items-center justify-end gap-2 bg-gradient-to-b from-white to-slate-50/60">
          <button
            onClick={() => onEdit?.(record)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-200"
            title="Modifier"
          >
            <Edit2 className="w-4 h-4" /> Modifier
          </button>
          {(
            // detect likely doctor records: presence of specialite field or role label containing "doc"
            ('specialite' in record) || (u.role && u.role.toLowerCase().includes('doc')) || (record.role && typeof record.role === 'string' && record.role.toLowerCase().includes('doc'))
          ) && (
            <button
              onClick={() => setOpenDoctorModal(true)}
              className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-200   "
              title="Infos médecin"
            >
              <Settings className="w-4 h-4" /> 
            </button>
          )}
          <button
            onClick={() => setOpenChangePwd(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-200"
            title="Changer mot de passe"
          >
            <Key className="w-4 h-4" /> Mdp
          </button>
          <button
            onClick={() => onDelete?.(record)}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-300 disabled:opacity-80"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" /> Supprimer
          </button>
        </div>

        {/* soft glow */}
        <span className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full bg-sky-200/20 blur-2xl" />
      </div>

      <ChangePasswordModal
        isOpen={openChangePwd}
        onClose={() => setOpenChangePwd(false)}
        userId={record.user.id}
        onSuccess={() => setOpenChangePwd(false)}
      />
      <EditDoctorInfosModal
        isOpen={openDoctorModal}
        onClose={() => setOpenDoctorModal(false)}
        doctorRecord={record}
        onSaved={() => { setOpenDoctorModal(false); onDoctorSaved?.(); }}
      />
    </>
  );
}
