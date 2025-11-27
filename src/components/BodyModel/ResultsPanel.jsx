import React, { useState } from "react";
import {
    AlertTriangle, Stethoscope, CheckCircle, Activity, X,
    ChevronDown, ChevronUp, Clock, User, Heart, Phone, Calendar,
    FileText, Pill, Users
} from "lucide-react";
import { getImageUrl } from "../../utils/image";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

// Mappage de sévérité optimisé (sans couleurs en dur dans le nom)
const severityMap = (sev) => {
    if (!sev) return { color: "text-slate-600", bg: "bg-slate-50", Icon: Activity, name: "Non Classifié" };
    const s = String(sev).toLowerCase();

    if (s.includes("grave") || s.includes("sévère") || s.includes("severe")) {
        return { color: "text-red-700", bg: "bg-red-50", Icon: AlertTriangle, name: "Grave" };
    }
    if (s.includes("moyen") || s.includes("mod") || s.includes("moder")) {
        return { color: "text-amber-700", bg: "bg-amber-50", Icon: Stethoscope, name: "Modéré" };
    }
    // Par défaut : Léger
    return { color: "text-emerald-700", bg: "bg-emerald-50", Icon: CheckCircle, name: "Léger" };
};

// Fonction utilitaire pour formater les traitements (retourne toujours un tableau)
const formatTreatment = (treatment) => {
    if (!treatment) return [];
    // Sépare par ';' et nettoie les espaces
    return treatment.split(';').map(item => item.trim()).filter(item => item.length > 0);
};

// --- Sous-Composant pour la Carte de Détails ---

const DetailsCard = ({ result, isPrimary = false, isExpanded, onToggle, emergencyNumber = '01 23 45 67 89', onTakeAppointment, savingDiagnostic }) => {
    const { color, bg, Icon, name } = severityMap(result.severity);
    const confidencePercent = result.confidence ? (result.confidence * 100).toFixed(0) + '%' : '—';
    const treatments = formatTreatment(result.treatment);

    // Vérifier si la spécialité a au moins un médecin listé avec un nom complet
    const doctorsAvailable = result.doctors && result.doctors.some(d => d.full_name);

    return (
        <motion.div
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className={`rounded-2xl overflow-hidden bg-white transition-all duration-300 shadow-sm ${isPrimary ? 'ring-2 ring-sky-50 border border-sky-100' : 'border border-slate-100 hover:shadow-md'}`}
            >
            {/* Tête de Carte : Informations principales et badge */}
            <div className={`flex items-center gap-4 p-5 ${bg} bg-opacity-60`}> 
                <div className="flex-none p-3 rounded-lg bg-white/90 shadow">
                    <Icon className={`w-7 h-7 ${color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                    {/* Le titre ne tronque plus et a une taille appropriée */}
                    <div className="text-xl font-bold text-slate-900 leading-tight">
                        {result.disease || 'Maladie Non Spécifiée'}
                        {isPrimary && (
                            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-500 text-white">
                                Plus Probable
                            </span>
                        )}
                    </div>
                    <div className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                        <Heart className="inline w-3 h-3 text-slate-400" />
                        <span className="font-medium">{result.specialty || 'Spécialité Inconnue'}</span>
                    </div>
                </div>

                <div className="text-right flex-none">
                    <div className="text-xs text-slate-500">Confiance</div>
                    <div className="mt-1 flex items-baseline justify-end gap-3">
                        <div className="text-lg font-extrabold text-slate-900 leading-tight">{confidencePercent}</div>
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${color} ${bg} border border-current`}>{name}</span>
                    </div>
                </div>

                {/* Bouton d'Expansion pour les cartes non primaires */}
                {!isPrimary && (
                    <button onClick={onToggle} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 transition">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                )}
            </div>

            {/* Corps de Carte : Affiché si Primaire OU si Expandu */}
            {((isPrimary || isExpanded)) && (
                <div className="p-5 border-t border-slate-100">
                    
                    {/* Section Détails - Présentation compacte en 3 colonnes */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                            <FileText className="w-5 h-5 text-sky-600 mt-1" />
                            <div className="min-w-0">
                                <div className="text-sm text-slate-900 font-semibold">Cause principale</div>
                                <div className="text-sm text-slate-700 truncate">{result.cause || 'Non documentée.'}</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 min-w-0">
                            <Pill className="w-5 h-5 text-amber-600 mt-1" />
                            <div className="min-w-0">
                                <div className="text-sm text-slate-900 font-semibold">Traitements suggérés</div>
                                {treatments.length > 0 ? (
                                    <div className="text-sm text-slate-700 truncate">{treatments.join(', ')}</div>
                                ) : (
                                    <div className="text-sm text-slate-700">Consultez un spécialiste.</div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3 min-w-0">
                            <Users className="w-5 h-5 text-emerald-600 mt-1" />
                            <div className="min-w-0">
                                <div className="text-sm text-slate-900 font-semibold">Groupes à risque</div>
                                <div className="text-sm text-slate-700">{result.at_risk_age || 'Toutes tranches d’âge.'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Section Médecins/Actions */}
                    <div className="mt-5 pt-5 border-t border-slate-100">
                        <strong className="text-sm text-slate-900 mb-3 flex items-center gap-2">
                            <User className="inline w-4 h-4 text-sky-600" />
                            {doctorsAvailable ? `Médecins recommandés — ${result.specialty}` : `Spécialistes — ${result.specialty}`}
                        </strong>

                        {doctorsAvailable ? (
                            <ul className="space-y-3">
                                {result.doctors.filter(d => d.full_name).slice(0, 3).map((d, idx) => (
                                    <li key={idx} className="flex items-center justify-between text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-3 min-w-0">
                                            { d.photo_url ? (
                                                <img src={getImageUrl(d.photo_url)} alt={d.full_name || 'Dr. Anonyme'} className="w-10 h-10 rounded-full" />
                                            ) : (
                                                <span className="w-10 h-10 rounded-full bg-slate-100 grid place-items-center">
                                                    <User className="w-5 h-5 text-slate-400" />
                                                </span>
                                            )}
                                            <div className="font-medium truncate">{d.full_name || 'Dr. Anonyme'}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onTakeAppointment(d.id)}
                                                disabled={savingDiagnostic}
                                                className="ml-4 flex cursor-pointer items-center px-3 py-1 bg-sky-600 text-white text-xs font-semibold rounded-full hover:bg-sky-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {savingDiagnostic ? (
                                                    <span className="w-3 h-3 rounded-full border-2 border-white/50 border-t-transparent animate-spin mr-1" />
                                                ) : (
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                )}
                                                Prendre RDV
                                            </button>
                                        </div>
                                    </li>
                                ))}
                                {result.doctors.length > 3 && <li className="text-xs text-slate-400 ml-3 mt-1">... et {result.doctors.length - 3} autres.</li>}
                            </ul>
                        ) : (
                            <div className={`p-4 rounded-xl bg-white border border-slate-100 shadow-sm`}> 
                                <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Clock className="inline w-4 h-4 text-sky-500" />
                                    Aucun médecin de cette spécialité dans la clinique pour le moment.
                                </p>
                                <p className="text-xs mt-2 text-slate-500">
                                    En cas d'urgence, veuillez contacter le <strong className="font-bold">{emergencyNumber}</strong>.
                                </p>
                            </div>
                        )}
                    </div>
                    
                </div>
            )}
        </motion.div>
    );
};

// --- Composant Principal ---

export default function ResultsPanel({ results = [], best_confidence = null, onClose, selectedSymptoms = [] }) {
    const navigate = useNavigate();
    const [expandedIndex, setExpandedIndex] = useState(null); // Gère la carte actuellement ouverte
    const [savingDiagnostic, setSavingDiagnostic] = useState(false);

    // Fonction pour gérer la prise de rendez-vous
    const handleTakeAppointment = async (doctorId) => {
        setSavingDiagnostic(true);
        
        try {
            // Préparer les données pour l'API
            const payload = {
                symptoms: selectedSymptoms.map(s => ({
                    symptomeName: s.name || s.label || 'Symptôme inconnu',
                    intensite: String(s.intensity),
                    bodyPart: s.partId || 'Non spécifié'
                })),
                predictions: results && results.length > 0 
                    ? results.map(r => ({
                        disease: r.disease || 'Non identifié',
                        specialty: r.specialty || 'Non spécifiée',
                        severity: r.severity || 'Non classifiée',
                        treatment: r.treatment || 'À déterminer',
                        at_risk_age: r.at_risk_age || 'Non documenté',
                        cause: r.cause || 'Non documentée',
                        confidence: r.confidence || 0
                    }))
                    : [],
                notes: `Analyse IA du ${new Date().toLocaleDateString('fr-FR')} - Confiance globale: ${best_confidence ? (best_confidence * 100).toFixed(1) + '%' : 'N/A'}`
            };

            // Enregistrer dans la base de données
            const response = await api.post('/api/auto-diagnostics/', payload);
            
            // Rediriger vers la page de prise de rendez-vous avec l'ID du diagnostic et du médecin
            navigate(`/patient/consultations/new?doctor=${doctorId}&diagnostic=${response.data.id}`);
        } catch (err) {
            console.error('Erreur lors de la sauvegarde du diagnostic:', err);
            // En cas d'erreur, rediriger quand même sans l'ID du diagnostic
            navigate(`/patient/consultations/new?doctor=${doctorId}`);
        } finally {
            setSavingDiagnostic(false);
        }
    };

    // Trouver le résultat le plus probable (index 0)
    const sortedResults = [...results].sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    const primaryResult = sortedResults[0];
    const secondaryResults = sortedResults.slice(1);

    const bestConfidenceText = best_confidence ? (best_confidence * 100).toFixed(1) + '%' : '—';
    
    // Fonction pour basculer l'état d'expansion
    const toggleExpansion = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <div className="w-full h-full flex flex-col bg-white rounded-xl shadow-2xl ring-1 ring-slate-200 overflow-hidden">
            
            {/* En-tête : Couleurs unies et icône pro */}
            <div className="flex items-center justify-between px-6 py-4 bg-sky-800 text-white shadow-md">
                <div className="flex items-center">
                    <Stethoscope className="w-6 h-6 mr-3" />
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Résultats du Triage Médical</h2>
                        <div className="text-sm text-slate-300 mt-0.5 font-medium">
                            Analyse complète — Confiance Globale: <strong className="text-white ml-1">{bestConfidenceText}</strong>
                        </div>
                    </div>
                </div>
                
                {/* Bouton de Fermeture */}
                <button 
                    onClick={onClose} 
                    className="p-2 rounded-full bg-slate-200 text-slate-700 cursor-pointer hover:bg-slate-300 transition hover:scale-95"
                    aria-label="Fermer le panneau de résultats"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Contenu : Mise en page */}
            <div className="p-6 overflow-y-auto">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Diagnostic Principal et Recommandation</h3>
                
                {primaryResult && (
                    <div className="mb-8">
                        {/* Carte Primaire */}
                        <DetailsCard result={primaryResult} isPrimary={true} onTakeAppointment={handleTakeAppointment} savingDiagnostic={savingDiagnostic} />
                    </div>
                )}

                {secondaryResults.length > 0 && (
                    <>
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2 mt-6">Autres Diagnostics Probables ({secondaryResults.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Cartes Secondaires (Consultables/Expandables) */}
                            {secondaryResults.map((r, i) => (
                                <DetailsCard 
                                    key={i}
                                    result={r}
                                    isExpanded={expandedIndex === i}
                                    onToggle={() => toggleExpansion(i)}
                                    onTakeAppointment={handleTakeAppointment}
                                    savingDiagnostic={savingDiagnostic}
                                />
                            ))}
                        </div>
                    </>
                )}
                
                {!primaryResult && results.length === 0 && (
                    <div className="text-center p-12 text-slate-500 bg-slate-50 rounded-lg">
                        <Activity className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <p className="text-xl font-semibold">Aucun résultat d'analyse disponible.</p>
                    </div>
                )}
            </div>
        </div>
    );
}