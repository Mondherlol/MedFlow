import React, { useRef, useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";

export default function FAQEditor({ items, setItems, onSave, colors }) {
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [draggingIndex, setDragging] = useState(null);

  const add = () => setItems((s) => [...s, { q: "", a: "" }]);
  const del = (i) => setItems((s) => s.filter((_, idx) => idx !== i));
  const edit = (i, key, val) => setItems((s) => s.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)));

  const onDragStart = (_, i) => { dragItem.current = i; setDragging(i); };
  const onDragEnter = (_, i) => { dragOverItem.current = i; };
  const onDrop = () => {
    const start = dragItem.current, end = dragOverItem.current;
    setDragging(null);
    if (start == null || end == null) return;
    setItems((list) => {
      const a = [...list];
      const [m] = a.splice(start, 1);
      a.splice(end, 0, m);
      return a;
    });
    dragItem.current = dragOverItem.current = null;
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-slate-600">Ajoutez vos questions/réponses, réordonnez-les.</div>
        <button type="button" onClick={add} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
          <Plus className="w-4 h-4" /> Ajouter une question
        </button>
      </div>

      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i}
              draggable
              onDragStart={(e)=>onDragStart(e,i)}
              onDragEnter={(e)=>onDragEnter(e,i)}
              onDragOver={(e)=>e.preventDefault()}
              onDrop={onDrop}
              className={`rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition ${draggingIndex===i ? "scale-[1.01] shadow-md" : ""}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600">Question</label>
                <input value={it.q} onChange={(e)=>edit(i,"q",e.target.value)}
                       placeholder="Ex: Comment prendre rendez-vous ?"
                       className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-200"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Réponse</label>
                <input value={it.a} onChange={(e)=>edit(i,"a",e.target.value)}
                       placeholder="Depuis votre espace patient…"
                       className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-200"/>
              </div>
            </div>
            <div className="mt-2 flex justify-end">
              <button type="button" onClick={()=>del(i)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50">
                <Trash2 className="w-4 h-4" /> Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: colors.primary }}
        >
          <Save className="w-4 h-4" /> Enregistrer la FAQ
        </button>
      </div>
    </div>
  );
}
