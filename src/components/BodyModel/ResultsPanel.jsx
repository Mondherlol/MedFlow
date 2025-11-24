import React, { useState } from "react";
import { 
  AlertTriangle, Stethoscope, CheckCircle, Activity, X, 
  ChevronDown, ChevronUp, Clock, User, Heart, Phone, Calendar
} from "lucide-react";
import { getImageUrl } from "../../utils/image";

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

// Fonction utilitaire pour formater les traitements moches
const formatTreatment = (treatment) => {
    if (!treatment) return 'Non spécifié.';
    // Remplace les ; par des sauts de ligne + tirets, et nettoie les espaces
    return treatment.split(';').map(item => item.trim()).filter(item => item.length > 0);
};

// --- Sous-Composant pour la Carte de Détails ---

const DetailsCard = ({ result, isPrimary = false, isExpanded, onToggle, emergencyNumber = '01 23 45 67 89' }) => {
    const { color, bg, Icon, name } = severityMap(result.severity);
    const confidencePercent = result.confidence ? (result.confidence * 100).toFixed(0) + '%' : '—';
    const treatments = formatTreatment(result.treatment);

    // Vérifier si la spécialité a au moins un médecin listé avec un nom complet
    const doctorsAvailable = result.doctors && result.doctors.some(d => d.full_name);

    return (
        <div 
            className={`
                rounded-xl border shadow-lg overflow-hidden bg-white transition-all duration-300
                ${isPrimary ? 'border-blue-500 ring-4 ring-blue-100' : 'border-slate-200 hover:shadow-xl'}
            `}
        >
            {/* Tête de Carte : Informations principales et badge */}
            <div className={`flex items-center gap-4 p-5 ${bg}`}>
                <div className="flex-none p-3 rounded-full bg-white shadow-md">
                    <Icon className={`w-8 h-8 ${color}`} />
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
                    <div className="text-sm text-slate-500 mt-0.5">
                        <Heart className="inline w-3 h-3 mr-1 text-slate-400" />
                        {result.specialty || 'Spécialité Inconnue'}
                    </div>
                </div>

                <div className="text-right flex-none">
                    {/* Badge de Sévérité */}
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${color} ${bg} border border-current`}>
                        {name}
                    </span>
                    <div className="mt-1">
                        <div className="text-xs text-slate-500">Confiance</div>
                        <div className="text-lg font-extrabold text-slate-900 leading-tight">{confidencePercent}</div>
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
                    
                    {/* Section Détails - Formatage Espacé */}
                    <div className="space-y-4">
                        <p className="text-sm text-slate-700">
                            <strong className="text-slate-900 block mb-1">Cause principale:</strong> 
                            {result.cause || 'Non documentée.'}
                        </p>
                        
                        <div className="text-sm text-slate-700">
                            <strong className="text-slate-900 block mb-1">Traitement suggéré:</strong> 
                            {treatments.length > 0 ? (
                                <ul className="list-disc ml-5 space-y-0.5">
                                    {treatments.map((t, idx) => <li key={idx}>{t}</li>)}
                                </ul>
                            ) : (
                                'Consultez un spécialiste.'
                            )}
                        </div>
                        
                        <p className="text-sm text-slate-700">
                            <strong className="text-slate-900 block mb-1">Groupes à risque:</strong> 
                            {result.at_risk_age || 'Toutes tranches d’âge.'}
                        </p>
                    </div>

                    {/* Section Médecins/Actions */}
                    <div className="mt-5 pt-5 border-t border-slate-100">
                        <strong className="text-sm text-slate-900 block mb-3">
                            <User className="inline w-4 h-4 mr-1 align-sub" /> 
                            {doctorsAvailable ? `Médecins Recommandés en ${result.specialty}` : `Spécialistes en ${result.specialty}`}
                        </strong>
                        
                        {doctorsAvailable ? (
                            <ul className="space-y-3">
                                {result.doctors.filter(d => d.full_name).slice(0, 3).map((d, idx) => (
                                    <li key={idx} className="flex items-center justify-between text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        { d.photo_url ? (
                                            <img src={getImageUrl(d.photo_url)} alt={d.full_name || 'Dr. Anonyme'} className="w-8 h-8 rounded-full mr-3" />
                                        ) : <span className="w-8 h-8 rounded-full bg-slate-200 grid place-items-center mr-3">
                                            <User className="w-5 h-5 text-slate-400" />
                                        </span> }
                                        <div className="font-medium truncate">{d.full_name || 'Dr. Anonyme'}</div>
                                        <button 
                                            onClick={() => alert(`Prendre RDV avec ${d.full_name}`)}
                                            className="ml-4 flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full hover:bg-blue-700 transition"
                                        >
                                            <Calendar className="w-3 h-3 mr-1" /> RDV
                                        </button>
                                    </li>
                                ))}
                                {result.doctors.length > 3 && <li className="text-xs text-slate-400 ml-3 mt-1">... et {result.doctors.length - 3} autres.</li>}
                            </ul>
                        ) : (
                            <div className={`p-3 rounded-lg ${bg} ${color}`}>
                                <p className="text-sm font-medium">
                                    <Clock className="inline w-4 h-4 mr-2" />
                                    Aucun médecin de cette spécialité listé dans la clinique pour le moment.
                                </p>
                                <p className="text-xs mt-1">
                                    En cas d'urgence, veuillez contacter le <strong className="font-bold">{emergencyNumber}</strong>.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Composant Principal ---

export default function ResultsPanel({ results = [], best_confidence = null, onClose }) {
    const [expandedIndex, setExpandedIndex] = useState(null); // Gère la carte actuellement ouverte

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
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800 text-white shadow-md">
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
                    className="p-2 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition"
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
                        <DetailsCard result={primaryResult} isPrimary={true} />
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