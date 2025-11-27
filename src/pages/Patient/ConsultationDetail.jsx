import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Clock, Calendar, User, FileText, Clipboard, CreditCard, XCircle, CheckCircle, Lock } from "lucide-react";
import PatientTemplate from "../../components/Patient/PatientTemplate";
import api from "../../api/axios";
import { getImageUrl } from "../../utils/image.jsx";
import toast from "react-hot-toast";

function getStatusText(status) {
  if (!status) return "—";
  switch (String(status).toLowerCase()) {
    case "confirme": return "Confirmé";
    case "termine": return "Terminé";
    case "encours": return "En cours";
    case "annule": return "Annulé";
    default: return String(status).replace(/_/g, " ");
  }
}

function getStatusStyle(status) {
  const s = (status || "").toLowerCase();
  if (s === "termine") return { badge: "bg-emerald-50 text-emerald-700", bar: "bg-emerald-400" };
  if (s === "encours") return { badge: "bg-sky-50 text-sky-700", bar: "bg-sky-400" };
  if (s === "annule") return { badge: "bg-rose-50 text-rose-700", bar: "bg-rose-400" };
  if (s === "confirme") return { badge: "bg-amber-50 text-amber-700", bar: "bg-amber-400" };
  return { badge: "bg-slate-100 text-slate-700", bar: "bg-slate-300" };
}

// Date helpers: format long French date and relative tags
function capitalizeWords(str) {
  return String(str).split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function formatLongDate(d) {
  try {
    const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const s = d.toLocaleDateString('fr-FR', opts);
    return capitalizeWords(s);
  } catch (e) {
    return d.toISOString().slice(0,10);
  }
}

function getRelativeTag(d) {
  const now = new Date();
  const diffMs = now - d;
  const absMs = Math.abs(diffMs);
  const sec = Math.round(absMs / 1000);
  const min = Math.round(sec / 60);
  const hrs = Math.round(min / 60);
  const days = Math.round(hrs / 24);

  if (diffMs >= 0) {
    if (sec < 60) return "à l'instant";
    if (min < 60) return `il y a ${min} ${min === 1 ? 'minute' : 'minutes'}`;
    if (hrs < 24) return `il y a ${hrs} ${hrs === 1 ? 'heure' : 'heures'}`;
    if (days === 1) return 'hier';
    if (days < 30) return `il y a ${days} ${days === 1 ? 'jour' : 'jours'}`;
    const months = Math.round(days / 30);
    if (months < 12) return `il y a ${months} ${months === 1 ? 'mois' : 'mois'}`;
    const years = Math.round(months / 12);
    return `il y a ${years} ${years === 1 ? 'an' : 'ans'}`;
  } else {
    if (sec < 60) return 'bientôt';
    if (min < 60) return `dans ${min} ${min === 1 ? 'minute' : 'minutes'}`;
    if (hrs < 24) return `dans ${hrs} ${hrs === 1 ? 'heure' : 'heures'}`;
    if (days === 1) return 'demain';
    return `dans ${days} ${days === 1 ? 'jour' : 'jours'}`;
  }
}

export default function ConsultationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    fetchConsultation();
  }, [id]);

  async function fetchConsultation() {
    setLoading(true);
    try {
      const res = await api.get(`/api/consultations/${id}/`);
      setConsultation(res.data);
      // if backend returns a paid flag
      setPaid(Boolean(res.data.paid || res.data.is_paid || res.data.paye));
    } catch (e) {
      toast.error("Impossible de charger la consultation.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!consultation) return;
    if (!confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) return;
    setActionLoading(true);
    try {
      await api.patch(`/api/consultations/${id}/`, { statusConsultation: 'annule' });
      toast.success('Consultation annulée');
      setConsultation({ ...consultation, statusConsultation: 'annule' });
    } catch (e) {
      toast.error('Erreur lors de l\'annulation');
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePay() {
    if (!consultation) return;
    setActionLoading(true);
    try {
      // Try common endpoint; if it doesn't exist backend should be adapted
      await api.post(`/api/consultations/${id}/pay/`);
      toast.success('Paiement effectué');
      setPaid(true);
    } catch (e) {
      // As fallback, try to mark paid directly
      try {
        await api.patch(`/api/consultations/${id}/`, { paid: true });
        setPaid(true);
        toast.success('Marqué comme payé');
      } catch (e2) {
        toast.error('Erreur lors du paiement');
        console.error(e, e2);
      }
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return (
    <PatientTemplate title="Consultation" breadcrumbs={[{ label: 'Consultation' }]}>
      <div className="py-16 text-center text-slate-500">Chargement…</div>
    </PatientTemplate>
  );

  if (!consultation) return (
    <PatientTemplate title="Consultation" breadcrumbs={[{ label: 'Consultation' }]}>
      <div className="py-16 text-center text-rose-500">Consultation introuvable.</div>
    </PatientTemplate>
  );

  const status = (consultation.statusConsultation || '').toLowerCase();
  const style = getStatusStyle(status);

  const patient = consultation.patient || {};
  const doctor = consultation.doctor || {};
  const avatar = getImageUrl(patient.photo_url || doctor.photo_url || doctor.photo || null);

  // compute formatted date + relative tag
  const rawDate = consultation.date || null; // e.g. "2025-11-25"
  const rawTime = consultation.heure_debut || null; // e.g. "10:15"
  const dateObj = rawDate ? (rawTime ? new Date(`${rawDate}T${rawTime}:00`) : new Date(`${rawDate}T00:00:00`)) : null;
  const formattedDate = dateObj ? formatLongDate(dateObj) : (consultation.date || '—');
  const relativeTag = dateObj ? getRelativeTag(dateObj) : null;
  const showEndTime = status === 'termine' && consultation.heure_fin;

  return (
    <PatientTemplate title={`Consultation — ${consultation.id ? String(consultation.id).slice(0,8) : ''}`} breadcrumbs={[{ label: 'Accueil', to: '/patient' }, { label: 'Consultations', to: '/patient/appointments' }, { label: 'Détails' }]}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="lg:col-span-1 bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              {avatar ? (
                <img src={avatar} alt={patient.full_name || 'Patient'} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700">{(patient.full_name||'—').split(' ').map(n=>n[0]||'').slice(0,2).join('').toUpperCase()}</div>
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{patient.full_name || '—'}</div>
              <div className="text-xs text-slate-500">{patient.email || ''}</div>
              {patient.phone && <div className="text-xs text-slate-500 mt-1">{patient.phone}</div>}
            </div>
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="text-xs text-slate-500">Médecin</div>
            <div className="mt-2 text-sm font-semibold">{doctor.full_name || '—'}</div>
            {doctor.specialite && <div className="text-xs text-slate-500">{doctor.specialite}</div>}
          </div>
        </aside>

        <main className="lg:col-span-2 bg-white rounded-xl p-6">
          <div className="flex items-start gap-6">
            <div className={`w-2 h-16 rounded ${style.bar}`} />

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formattedDate}</span>
                    {relativeTag && <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">{relativeTag}</span>}
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 mt-2">Consultation — {doctor.full_name || '—'}</h2>
                  <div className="text-sm text-slate-500 mt-1">
                    {consultation.heure_debut}{showEndTime ? ` — ${consultation.heure_fin}` : ''}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${style.badge}`}>
                    {getStatusText(status) === 'Confirmé' ? <Clock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    <span>{getStatusText(status)}</span>
                  </div>

                  {status === 'confirme' && (
                    <button onClick={handleCancel} disabled={actionLoading} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100">
                      <XCircle className="w-4 h-4" /> Annuler
                    </button>
                  )}

                  {status === 'termine' && (
                    <div>
                      {!paid ? (
                        <button onClick={handlePay} disabled={actionLoading} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
                          <CreditCard className="w-4 h-4" /> Payer
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle className="w-4 h-4" /> Payé
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-xs text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4"/> Date</div>
                  <div className="mt-2 text-sm font-semibold">{consultation.date}</div>
                  <div className="text-xs text-slate-500 mt-1">Heure: {consultation.heure_debut}{consultation.heure_fin ? ` — ${consultation.heure_fin}` : ''}</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-xs text-slate-500 flex items-center gap-2"><FileText className="w-4 h-4"/> Notes</div>
                  <div className="mt-2 text-sm text-slate-700">{consultation.diagnostic || '—'}</div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold">Ordonnance & Diagnostic</h3>
                {status !== 'termine' ? (
                  <div className="mt-3 p-4 rounded-lg bg-slate-50 text-sm text-slate-600">Les documents (ordonnance & diagnostic) seront disponibles une fois la consultation terminée.</div>
                ) : (
                  <>
                    {/* Pay button centered above previews when not paid */}
                    {!paid && (
                      <div className="mt-4 flex justify-center">
                        <button onClick={handlePay} disabled={actionLoading} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700">
                          <CreditCard className="w-5 h-5" /> Payer consultation
                        </button>
                      </div>
                    )}

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[{ key: 'ordonnance', title: 'Ordonnance', icon: Clipboard }, { key: 'diagnostic', title: 'Diagnostic', icon: FileText }].map(item => (
                        <div key={item.key} className="relative bg-white rounded-lg overflow-hidden border border-slate-100 shadow-sm">
                          <div className="p-4 flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded bg-slate-50 flex items-center justify-center text-slate-600">
                              <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold">{item.title}</div>
                              <div className="text-xs text-slate-500">{consultation[item.key] ? `${item.title} disponible` : 'Aucun fichier'}</div>
                            </div>
                          </div>

                          {/* fake PDF preview */}
                          <div className="p-4 border-t">
                            <div className="h-40 bg-gradient-to-b from-slate-100 to-white rounded-md relative overflow-hidden">
                              <div className={`absolute inset-0 p-4 ${paid ? '' : 'backdrop-blur-sm bg-white/30'}`}>
                                <div className="h-full space-y-2">
                                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                                  <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* overlay lock when not paid */}
                          {!paid && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 text-sm text-slate-700 backdrop-blur-sm border border-slate-100">
                                  <Lock className="w-4 h-4" /> Contenu protégé
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>
        </main>
      </div>
    </PatientTemplate>
  );
}
