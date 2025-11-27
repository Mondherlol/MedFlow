import React, { useEffect, useState, useRef } from "react";

// Inline loader component (meant to be rendered inside an overlay area)
export default function TriageLoader({ open, onCancel }) {
  const messages = [
    "Un médecin hérisson analyse vos symptômes... 🦔",
    "Consultation en cours avec le Dr. Châtaigne... 🍂",
    "Regarde les battements de votre tamagotchi médical... 💓",
    "Mise à jour des neurones du diagnostic... 🧠",
    "Préparation de la potion de guérison... 🧪",
    "Vérification des signes vitaux du hérisson... ❤️",
    "Réglage des paramètres du stéthoscope... 🩺",
    "Collecte des données de santé... 📊",
    "Finalisation du diagnostic... 💊",
    "Analyse en cours — presque fini ! 🚀",
  ];

  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setIdx(0);
      setProgress(0);
      return;
    }

    const msgTimer = setInterval(() => setIdx((i) => (i + 1) % messages.length), 2400);

    // Progress behaviour: fast until ~80%, then slow until ~95%, then hold
    let mounted = true;
    const tick = () => {
      setProgress((p) => {
        if (!mounted) return p;
        if (p < 80) return Math.min(80, p + Math.random() * 5 + 3);
        if (p < 95) return Math.min(95, p + Math.random() * 1.5 + 0.2);
        return p; // hold near the end until server responds
      });
      rafRef.current = setTimeout(tick, 900);
    };
    tick();

    return () => {
      mounted = false;
      clearInterval(msgTimer);
      if (rafRef.current) clearTimeout(rafRef.current);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-slate-100">
        <div className="flex gap-4 items-center">
          <div className="flex-none w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center text-4xl shadow-inner">
            🦔
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">Analyse en cours</h3>
            <p className="text-slate-600 mt-1">{messages[idx]}</p>

            <div className="mt-4">
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(99.5, progress)}%`,
                    background: "linear-gradient(90deg,#fb923c,#f97316)",
                    transition: "width 700ms linear",
                  }}
                />
              </div>
              <div className="text-xs text-slate-500 mt-2">Progression approximative: {Math.floor(progress)}%</div>
            </div>
          </div>
          <div className="flex-none">
            <button onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-700">Annuler</button>
          </div>
        </div>
      </div>
    </div>
  );
}
