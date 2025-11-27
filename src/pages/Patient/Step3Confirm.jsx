import { useState } from "react";
import { getSpecialiteDisplay } from "../../utils/specialite";
import SlotList from "./SlotList";
import DiagnosticIAModal from "./DiagnosticIAModal";
import { Sparkles } from "lucide-react";

// Étape 3 : confirmation & IA
function Step3Confirm({
  user,
  selectedDoctor,
  patientOptions,
  noPreference,
  wantIA,
  iaNotes,
  setWantIA,
  setIaNotes,
  submitting,
  submitRequest,
  setStep,
  clinic,
}) {
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState(null);
  const contactEmail = user?.email || "—";
  const contactPhone = user?.phone || user?.phone_number || "—";

  const handleDiagnosticConfirm = (diagnosticText, analysisResults) => {
    setIaNotes(diagnosticText);
    setDiagnosticData(analysisResults);
    setWantIA(true);
  };

  const slotsSummary = () => {
    if (noPreference) return "Pas de préférence de créneau";
    if (!patientOptions || !patientOptions.length)
      return "Aucun créneau sélectionné";

    return <SlotList slots={patientOptions} />;
  };

  const estimatedPrice = selectedDoctor?.tarif_consultation + " TND";

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne infos patient */}
        <div className="space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Vos informations
            </div>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p>
                Nom :{" "}
                <strong>{user?.first_name || user?.full_name || "—"}</strong>
              </p>
              <p>
                Email : <strong>{contactEmail}</strong>
              </p>
              <p>
                Téléphone : <strong>{contactPhone}</strong>
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="space-y-3">
              <div className="text-sm font-semibold text-slate-800">
                Diagnostic IA (optionnel)
              </div>
              <p className="text-xs text-slate-500">
                Utilisez notre outil de diagnostic IA avec modèle 3D pour analyser vos symptômes. Cela aidera le médecin à mieux comprendre votre situation.
              </p>
              
            

              {
                !diagnosticData &&
                <button
                type="button"
                onClick={() => setShowDiagnosticModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-sky-300 bg-sky-50 text-sky-700 font-medium text-sm hover:bg-sky-100 hover:border-sky-400 transition"
              >
                <Sparkles className="w-5 h-5" />
                Ajouter un Diagnostic IA
              </button>
              }

              {diagnosticData && (
                <div className="mt-3 rounded-xl bg-emerald-50 border-2 border-emerald-200 overflow-hidden">
                  {/* En-tête */}
                  <div className="flex items-center justify-between p-4 bg-emerald-100/50">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-bold text-emerald-900">
                        Diagnostic IA Ajouté ✓
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setWantIA(false);
                        setIaNotes("");
                        setDiagnosticData(null);
                      }}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline"
                    >
                      Retirer
                    </button>
                  </div>

                  {/* Contenu structuré */}
                  <div className="p-4 space-y-4">
                    {/* Symptômes */}
                    <div>
                      <div className="text-xs font-bold text-emerald-900 uppercase tracking-wide mb-2">
                        Symptômes Rapportés ({diagnosticData.symptoms?.length || 0})
                      </div>
                      <div className="space-y-1.5">
                        {diagnosticData.symptoms && diagnosticData.symptoms.length > 0 ? (
                          diagnosticData.symptoms.map((symptom, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs bg-white/70 rounded-lg px-3 py-2 border border-emerald-100">
                              <span className="font-semibold text-slate-900">{symptom.name}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-600">Intensité: {symptom.intensity}/10</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-500 text-[10px]">{symptom.bodyPart}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500 italic">Aucun symptôme enregistré</p>
                        )}
                      </div>
                    </div>

                    {/* Maladies Probables */}
                    <div>
                      <div className="text-xs font-bold text-emerald-900 uppercase tracking-wide mb-2">
                        Maladies Probables ({diagnosticData.maladiesProbables?.length || 0})
                      </div>
                      {diagnosticData.maladiesProbables && diagnosticData.maladiesProbables.length > 0 ? (
                        <div className="space-y-2">
                          {diagnosticData.maladiesProbables.slice(0, 3).map((maladie, idx) => (
                            <div key={idx} className={`rounded-lg p-3 border ${
                              idx === 0 
                                ? 'bg-sky-50 border-sky-200' 
                                : 'bg-white/70 border-emerald-100'
                            }`}>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-slate-900 text-sm">{maladie.disease}</span>
                                    {idx === 0 && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500 text-white">
                                        PRINCIPAL
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-600">{maladie.specialty}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-bold text-slate-900">{maladie.confidence}</div>
                                  <div className="text-[9px] text-slate-500">confiance</div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[10px] mt-2">
                                <div>
                                  <span className="text-slate-500">Sévérité:</span>
                                  <span className="ml-1 font-semibold text-slate-700">{maladie.severity}</span>
                                </div>
                                {maladie.cause && maladie.cause !== 'Non documentée' && (
                                  <div>
                                    <span className="text-slate-500">Cause:</span>
                                    <span className="ml-1 font-semibold text-slate-700 truncate">{maladie.cause}</span>
                                  </div>
                                )}
                              </div>
                              {maladie.description && maladie.description !== 'Aucune description' && (
                                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{maladie.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white/70 rounded-lg p-3 border border-emerald-100">
                          <p className="text-xs text-slate-500 italic">Aucun diagnostic identifié</p>
                        </div>
                      )}
                    </div>

                    {/* Confiance Globale */}
                    {diagnosticData.confidenceGlobale && diagnosticData.confidenceGlobale !== 'N/A' && (
                      <div className="flex items-center justify-between bg-white/70 rounded-lg px-3 py-2 border border-emerald-100">
                        <span className="text-xs font-semibold text-slate-700">Confiance Globale</span>
                        <span className="text-sm font-bold text-emerald-700">{diagnosticData.confidenceGlobale}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne récap */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Récapitulatif de la demande
            </div>
            <div className="space-y-2 text-sm text-slate-700">
              <p>
                Médecin :{" "}
                <strong>{selectedDoctor?.user?.full_name || "—"}</strong>
              </p>
              <p>
                Spécialité :{" "}
                <strong>{getSpecialiteDisplay(selectedDoctor?.specialite) || "Médecin"}</strong>
              </p>
              <p>
                Créneaux 
              </p>
              {slotsSummary()}
              <p>
                Prix estimé : <strong>{estimatedPrice}</strong> |    Durée consultation :{" "}
                <strong>
                  {selectedDoctor?.duree_consultation
                    ? `${selectedDoctor.duree_consultation} min`
                    : "—"}
                </strong>
              </p>
              <p className="text-xs text-slate-500 pt-1">
                Vous serez contacté par la clinique pour confirmer le créneau
                définitif.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2 text-xs text-slate-500">
            <p>
              En envoyant cette demande, vous autorisez la clinique à vous
              contacter par email ou téléphone pour confirmer un rendez-vous.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition transform-gpu hover:shadow-sm hover:-translate-y-0.5"
            >
              Retour
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={submitRequest}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center gap-2 transform-gpu hover:shadow-lg hover:-translate-y-0.5"
            >
              {submitting && (
                <span className="w-3 h-3 rounded-full border-2 border-white/50 border-t-transparent animate-spin" />
              )}
              Confirmer et envoyer la demande
            </button>
          </div>
        </div>
      </div>

      {/* Modal de diagnostic IA */}
      <DiagnosticIAModal
        isOpen={showDiagnosticModal}
        onClose={() => setShowDiagnosticModal(false)}
        onConfirm={handleDiagnosticConfirm}
      />
    </div>
  );
}

export default Step3Confirm;