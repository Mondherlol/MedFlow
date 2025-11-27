import { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { X, CheckCircle, AlertCircle, Activity, AlertTriangle } from "lucide-react";
import ControlsOverlay from "../../components/BodyModel/ControlsOverlay";
import { RotateCcw } from "lucide-react";
import { BODY_ZONES, PARTS_NAMES, getPartName, getZoneKeyForPart, getZoneName } from "../../components/BodyModel/BodyZone";
import api from "../../api/axios";
import TriageLoader from "../../components/BodyModel/TriageLoader";
import FBXHuman from "../../components/BodyModel/FBXHuman";
import CustomOrbitControls from "../../components/BodyModel/CustomOrbitControl";
import ControlPanel from "../../components/BodyModel/ControlPanel";
import SymptomPanel from "../../components/BodyModel/SymptomPanel";

function getZoneLabelForPart(partName) {
  const key = getZoneKeyForPart(partName);
  return getZoneName(key) ?? BODY_ZONES.other.label;
}

export default function DiagnosticIAModal({ isOpen, onClose, onConfirm }) {
  const [selectedParts, setSelectedParts] = useState([]);
  const [activePart, setActivePart] = useState(null);
  const [partsMeta, setPartsMeta] = useState({});
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    part: null,
  });

  const containerRef = useRef();
  const controlsRef = useRef();
  const meshesRef = useRef(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setSelectedParts([]);
      setActivePart(null);
      setSelectedSymptoms([]);
      setAnalysisResults(null);
      setShowResults(false);
      setIsAnalyzing(false);
      setPartsMeta({});
      setTooltip({ visible: false, x: 0, y: 0, part: null });
    }
  }, [isOpen]);

  const handleBodyPartClick = (part) => {
    setSelectedParts((prev) => {
      if (prev.includes(part)) {
        const next = prev.filter((p) => p !== part);
        if (activePart === part) {
          setActivePart(next.length > 0 ? next[next.length - 1] : null);
        }
        return next;
      }
      setActivePart(part);
      return [...prev, part];
    });
  };

  const handleSelectPartFromPanel = (part) => {
    setActivePart(part);
  };

  const clearSelection = () => {
    setSelectedParts([]);
    setActivePart(null);
    setSelectedSymptoms([]);
    setAnalysisResults(null);
    setShowResults(false);
  };

  const handlePartPointerOver = (e, part) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      visible: true,
      x: e.clientX - rect.left + 12,
      y: e.clientY - rect.top + 12,
      part,
    });
  };

  const handlePartPointerMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip((t) => ({
      ...t,
      x: e.clientX - rect.left + 30,
      y: e.clientY - rect.top - 25,
    }));
  };

  const handlePartPointerOut = () => {
    setTooltip({ visible: false, x: 0, y: 0, part: null });
  };

  const ensurePartMeta = (name) => {
    setPartsMeta((meta) => {
      if (meta[name]) return meta;
      const display = getPartName(name) || name.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();
      const zoneLabel = getZoneLabelForPart(name);
      return {
        ...meta,
        [name]: {
          name: display || name,
          zoneLabel,
        },
      };
    });
  };

  useEffect(() => {
    if (!activePart && selectedParts.length > 0) {
      setActivePart(selectedParts[0]);
    }
  }, [activePart, selectedParts]);

  const onAddSymptom = (symptom) => {
    setSelectedSymptoms((prev) => {
      if (prev.find((s) => s.id === symptom.id)) return prev;
      return [
        ...prev,
        {
          ...symptom,
          intensity: 3,
          partId: symptom.partId ?? activePart ?? null,
        },
      ];
    });
  };

  const onRemoveSymptom = (id) => {
    setSelectedSymptoms((prev) => prev.filter((s) => s.id !== id));
  };

  const onUpdateIntensity = (id, intensity) => {
    setSelectedSymptoms((prev) => prev.map((s) => (s.id === id ? { ...s, intensity } : s)));
  };

  const onAnalyze = async (payload) => {
    const body = {
      symptoms: payload.symptoms,
      sex: 'M',
      age: 20,
      lang: "fr",
    };

    setIsAnalyzing(true);
    setAnalysisResults(null);

    try {
      const res = await api.post("/api/ai/triage/", body);
      if (res && res.data) {
        setAnalysisResults(res.data);
        setShowResults(true);
      } else {
        setAnalysisResults({ results: [], best_confidence: null });
        setShowResults(true);
      }
    } catch (err) {
      console.error("Triage API error", err);
      setAnalysisResults({ results: [], best_confidence: null });
      setShowResults(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmResults = () => {
    if (analysisResults) {
      // Formater les résultats de manière structurée
      const diagnosticData = {
        timestamp: new Date().toISOString(),
        symptoms: selectedSymptoms.map(s => ({
          name: s.name || s.label || 'Symptôme inconnu',
          intensity: s.intensity,
          bodyPart: s.partId || 'Non spécifié'
        })),
        maladiesProbables: analysisResults.results && analysisResults.results.length > 0 
          ? analysisResults.results.map(r => ({
              disease: r.disease || 'Non identifié',
              confidence: r.confidence ? (r.confidence * 100).toFixed(1) + '%' : 'N/A',
              severity: r.severity || 'Non classifiée',
              specialty: r.specialty || 'Non spécifiée',
              description: r.description || 'Aucune description',
              treatment: r.treatment || 'À déterminer',
              cause: r.cause || 'Non documentée'
            }))
          : [],
        confidenceGlobale: analysisResults.best_confidence 
          ? (analysisResults.best_confidence * 100).toFixed(1) + '%' 
          : 'N/A'
      };
      
      onConfirm(JSON.stringify(diagnosticData, null, 2), diagnosticData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {showResults && analysisResults ? (
            // Affichage des résultats style ResultsPanel
            <div className="space-y-6">
              {/* En-tête de résultats */}
              <div className="bg-linear-to-r from-sky-700 to-sky-800 text-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Analyse Terminée</h3>
                </div>
                <p className="text-sky-100 text-sm">
                  Le diagnostic IA a été complété. Vous pouvez maintenant confirmer pour l'ajouter à votre demande.
                </p>
                {analysisResults.best_confidence && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm font-semibold">Confiance Globale: {(analysisResults.best_confidence * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>

              {analysisResults.results && analysisResults.results.length > 0 ? (
                <>
                  {/* Diagnostic Principal */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-sky-600" />
                      Diagnostic Principal
                    </h3>
                    {(() => {
                      const result = analysisResults.results[0];
                      const severityColors = {
                        'mild': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100' },
                        'moderate': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100' },
                        'severe': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-100' },
                      };
                      const severity = String(result.severity || 'mild').toLowerCase();
                      const colors = severityColors[severity] || severityColors['mild'];

                      return (
                        <div className={`rounded-2xl border-2 ${colors.border} ${colors.bg} overflow-hidden shadow-lg`}>
                          <div className="bg-white/60 backdrop-blur-sm p-5">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-2xl font-bold text-slate-900">
                                    {result.disease || "Non identifié"}
                                  </h4>
                                  <span className="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full bg-blue-500 text-white">
                                    Plus Probable
                                  </span>
                                </div>
                                {result.specialty && (
                                  <p className="text-sm text-slate-600 flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    {result.specialty}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-slate-500 mb-1">Confiance</div>
                                <div className="text-2xl font-extrabold text-slate-900">
                                  {result.confidence ? (result.confidence * 100).toFixed(0) + '%' : '—'}
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${colors.text} ${colors.badge} border ${colors.border} mt-1`}>
                                  {result.severity || 'Léger'}
                                </span>
                              </div>
                            </div>

                            {result.description && (
                              <p className="text-sm text-slate-700 mb-4 leading-relaxed">
                                {result.description}
                              </p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
                              {result.cause && (
                                <div className="flex items-start gap-3">
                                  <div className="p-2 rounded-lg bg-sky-100">
                                    <AlertCircle className="w-5 h-5 text-sky-600" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Cause Principale</div>
                                    <div className="text-sm text-slate-800 mt-1">{result.cause}</div>
                                  </div>
                                </div>
                              )}
                              {result.treatment && (
                                <div className="flex items-start gap-3">
                                  <div className="p-2 rounded-lg bg-emerald-100">
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Traitement</div>
                                    <div className="text-sm text-slate-800 mt-1">{result.treatment}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Autres Diagnostics */}
                  {analysisResults.results.length > 1 && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-slate-600" />
                        Autres Diagnostics Probables ({analysisResults.results.length - 1})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysisResults.results.slice(1, 4).map((result, idx) => (
                          <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <h5 className="font-semibold text-slate-900 text-base">
                                {result.disease || "Non identifié"}
                              </h5>
                              <div className="text-right">
                                <div className="text-lg font-bold text-slate-900">
                                  {result.confidence ? (result.confidence * 100).toFixed(0) + '%' : '—'}
                                </div>
                                <div className="text-xs text-slate-500">confiance</div>
                              </div>
                            </div>
                            {result.specialty && (
                              <p className="text-xs text-slate-600 mb-2">{result.specialty}</p>
                            )}
                            {result.severity && (
                              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                                {result.severity}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 flex items-start gap-4">
                  <div className="p-3 rounded-full bg-amber-100">
                    <AlertCircle className="w-8 h-8 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-900 text-lg">Aucun diagnostic trouvé</h3>
                    <p className="text-sm text-amber-700 mt-2">
                      L'analyse n'a pas pu identifier de diagnostic avec les symptômes fournis. Veuillez consulter un professionnel de santé.
                    </p>
                  </div>
                </div>
              )}

              {/* Symptômes analysés */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-600" />
                  Symptômes Analysés
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSymptoms.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                    >
                      <span className="font-semibold">{s.name || s.label}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">Intensité: {s.intensity}/10</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Interface de sélection des symptômes
            <div className="relative">
              <div className={`${isAnalyzing ? 'pointer-events-none filter blur-sm' : ''} grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-8`}>
                {/* Zone modèle 3D */}
                <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 p-4 lg:p-6">
                  <div
                    ref={containerRef}
                    className="relative h-[420px] lg:h-[520px] rounded-2xl overflow-hidden bg-linear-to-b from-sky-900 via-slate-900 to-slate-950"
                  >
                    <Canvas camera={{ position: [0, 1.2, 6], fov: 40 }}>
                      <ambientLight intensity={0.5} />
                      <directionalLight
                        position={[5, 10, 5]}
                        intensity={1.1}
                        castShadow
                      />
                      <spotLight
                        position={[0, 4, 4]}
                        intensity={1.3}
                        angle={0.5}
                        penumbra={0.4}
                      />
                      <pointLight position={[0, 2, 2]} intensity={0.7} distance={10} />

                      <FBXHuman
                        onBodyPartClick={(p) => { if (!isAnalyzing) handleBodyPartClick(p); }}
                        selectedParts={selectedParts}
                        onPointerOverCallback={(e, name) => {
                          ensurePartMeta(name);
                          handlePartPointerOver(e, name);
                        }}
                        onPointerMoveCallback={handlePartPointerMove}
                        onPointerOutCallback={handlePartPointerOut}
                        onMeshesReady={(meshes) => {
                          meshesRef.current = meshes;
                        }}
                      />

                      <CustomOrbitControls controlsRef={controlsRef} />
                    </Canvas>

                    <ControlPanel />
                    <ControlsOverlay controlsRef={controlsRef} />

                    {/* Tooltip */}
                    {tooltip.visible && (
                      <div
                        className="absolute pointer-events-none z-50"
                        style={{ left: tooltip.x, top: tooltip.y }}
                      >
                        <div className="absolute bottom-3 left-1 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-l border-b border-slate-200" />
                        <div className="bg-white text-slate-900 px-3 py-2 rounded-xl shadow-xl border border-slate-200 text-xs whitespace-nowrap">
                          <div className="font-semibold">
                            {partsMeta[tooltip.part]?.name || tooltip.part}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {partsMeta[tooltip.part]?.zoneLabel || "Région du corps"}
                          </div>
                        </div>
                      </div>
                    )}

                    {isAnalyzing && (
                      <div className="absolute inset-0 z-40 bg-black/10" />
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      Sélectionnez les parties du corps concernées et ajoutez vos symptômes.
                    </p>
                    <button
                      onClick={clearSelection}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500 text-white text-sm font-medium shadow-md hover:bg-rose-600 transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Effacer
                    </button>
                  </div>
                </div>

                {/* Panneau symptômes */}
                <div className="h-[500px] lg:h-[600px]">
                  <SymptomPanel
                    activePart={activePart}
                    selectedParts={selectedParts}
                    onSelectPart={handleSelectPartFromPanel}
                    selectedSymptoms={selectedSymptoms}
                    onAddSymptom={onAddSymptom}
                    onRemoveSymptom={onRemoveSymptom}
                    onUpdateIntensity={onUpdateIntensity}
                    onAnalyze={onAnalyze}
                    hideAnalyzeButton={true}
                  />
                </div>
              </div>

              {isAnalyzing && (
                <div className="absolute inset-0 z-50 flex items-center justify-center">
                  <TriageLoader open={isAnalyzing} onCancel={() => setIsAnalyzing(false)} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Annuler
          </button>

          <div className="flex gap-3">
            {!showResults && (
              <button
                onClick={() => {
                  const symptomsList = selectedSymptoms
                    .map((s) => (s.symptom || s.id || s.label || ""))
                    .map((t) => String(t).trim())
                    .filter(Boolean);
                  const payload = { symptoms: symptomsList.join(', '), lang: 'fr' };
                  if (onAnalyze) onAnalyze(payload);
                }}
                disabled={selectedSymptoms.length === 0}
                className={`
                  flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all
                  ${selectedSymptoms.length > 0
                    ? "bg-linear-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }
                `}
              >
                {selectedSymptoms.length > 0 ? <Activity className="w-4 h-4 animate-pulse" /> : <AlertTriangle className="w-4 h-4" />}
                {selectedSymptoms.length > 0 ? "Lancer l'analyse" : "Ajoutez des symptômes"}
              </button>
            )}

            {showResults && analysisResults?.results?.length > 0 && (
              <button
                onClick={handleConfirmResults}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 transition flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Confirmer et ajouter au formulaire
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
