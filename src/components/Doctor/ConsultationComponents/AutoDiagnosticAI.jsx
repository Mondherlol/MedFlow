import { Sparkles, AlertTriangle, Stethoscope, Pill, Activity, User, FileText, TrendingUp } from "lucide-react";

export default function AutoDiagnosticAI({ autoDiagnostic }) {
  if (!autoDiagnostic || !autoDiagnostic.predictions || autoDiagnostic.predictions.length === 0) {
    return null;
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "faible":
      case "low":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "moyen":
      case "moderate":
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "élevé":
      case "high":
      case "severe":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "text-emerald-600";
    if (confidence >= 0.5) return "text-amber-600";
    return "text-slate-600";
  };

  const getIntensityColor = (intensite) => {
    switch (intensite?.toLowerCase()) {
      case "faible":
      case "low":
        return "bg-emerald-100 text-emerald-700";
      case "moyen":
      case "moderate":
      case "medium":
        return "bg-amber-100 text-amber-700";
      case "élevé":
      case "high":
      case "intense":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border-2 border-indigo-200/50">
      {/* Header avec badge IA */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Analyse IA - Auto-diagnostic
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                AI-Powered
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {new Date(autoDiagnostic.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Symptômes rapportés */}
      {autoDiagnostic.symptoms && autoDiagnostic.symptoms.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-slate-600" />
            <h4 className="text-sm font-semibold text-slate-700">Symptômes rapportés par le patient</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {autoDiagnostic.symptoms.map((symptom, idx) => (
              <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-indigo-100 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm mb-1">
                      {symptom.symptomeName || "Symptôme non spécifié"}
                    </div>
                    {symptom.bodyPart && (
                      <div className="text-xs text-slate-500 mb-2">
                        Zone : {symptom.bodyPart}
                      </div>
                    )}
                  </div>
                  {symptom.intensite && (
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${getIntensityColor(symptom.intensite)}`}>
                      {symptom.intensite}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prédictions de l'IA */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Stethoscope className="w-4 h-4 text-slate-600" />
          <h4 className="text-sm font-semibold text-slate-700">Diagnostic suggéré par l'IA</h4>
        </div>

        {autoDiagnostic.predictions.map((prediction, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
            {/* Maladie et confiance */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h5 className="text-base font-bold text-slate-900">
                    {prediction.disease || "Maladie non identifiée"}
                  </h5>
                  {prediction.confidence !== undefined && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className={`w-4 h-4 ${getConfidenceColor(prediction.confidence)}`} />
                      <span className={`text-sm font-semibold ${getConfidenceColor(prediction.confidence)}`}>
                        {Math.round(prediction.confidence * 100)}%
                      </span>
                    </div>
                  )}
                </div>
                {prediction.specialty && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg text-xs font-medium">
                    <Stethoscope className="w-3 h-3" />
                    Spécialité : {prediction.specialty}
                  </div>
                )}
              </div>
              {prediction.severity && (
                <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${getSeverityColor(prediction.severity)}`}>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Sévérité : {prediction.severity}
                </div>
              )}
            </div>

            {/* Cause */}
            {prediction.cause && (
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs font-semibold text-slate-600 mb-1">Cause probable</div>
                <div className="text-sm text-slate-700">{prediction.cause}</div>
              </div>
            )}

            {/* Traitement recommandé */}
            {prediction.treatment && (
              <div className="bg-emerald-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Pill className="w-3.5 h-3.5 text-emerald-600" />
                  <div className="text-xs font-semibold text-emerald-700">Traitement recommandé</div>
                </div>
                <div className="text-sm text-slate-700">{prediction.treatment}</div>
              </div>
            )}

            {/* Âge à risque */}
            {prediction.at_risk_age && (
              <div className="bg-amber-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <div className="text-xs font-semibold text-amber-700">Âge à risque</div>
                </div>
                <div className="text-sm text-slate-700">{prediction.at_risk_age}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Notes supplémentaires */}
      {autoDiagnostic.notes && autoDiagnostic.notes !== "string" && (
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-slate-600" />
            <h4 className="text-sm font-semibold text-slate-700">Notes additionnelles</h4>
          </div>
          <div className="text-sm text-slate-600 leading-relaxed">{autoDiagnostic.notes}</div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 flex items-start gap-2 p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          <strong>Attention :</strong> Ce diagnostic est généré par intelligence artificielle et doit être considéré comme une aide à la décision. 
          Le diagnostic final et le traitement approprié relèvent de votre jugement médical professionnel.
        </p>
      </div>
    </div>
  );
}
