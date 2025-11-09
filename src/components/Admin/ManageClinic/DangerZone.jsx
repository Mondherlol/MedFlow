import React, { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";

export default function DangerZone({ clinicName = "Votre Clinique", onDelete }) {
  const [confirmInput, setConfirmInput] = useState("");

  const canDelete =
    confirmInput.trim().toLowerCase() === clinicName.trim().toLowerCase();

  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-red-800">Supprimer la clinique</h4>
          <p className="text-sm text-red-700 mt-1">
            Cette action est <strong>irréversible</strong>. Tous les services, utilisateurs,
            médias et données associées seront supprimés.
          </p>

          <div className="mt-3">
            <label className="block text-xs font-medium text-red-900">
              Confirmez en tapant le nom exact de la clinique :
            </label>
            <input
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={clinicName}
              className="mt-1 block w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              disabled={!canDelete}
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer définitivement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
