// Symptom data backed by CSV file (symptomes_merged.csv)
// ⚠️ Informational only — not a medical diagnosis tool.

import rawCsv from "./symptomes_merged.csv?raw";
import { getZoneKeyForPart } from "./BodyZone";

function parseCSV(raw) {
  if (!raw) return [];
  const lines = raw.replace(/\r/g, "").split("\n").filter(Boolean);

  const parseLine = (line) => {
    const res = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++; // escaped quote
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }
      if (ch === "," && !inQuotes) {
        res.push(cur);
        cur = "";
        continue;
      }
      cur += ch;
    }
    res.push(cur);
    return res;
  };

  const headers = parseLine(lines[0]).map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseLine(lines[i]);
    if (vals.length === 0) continue;
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = (vals[j] || "").trim();
    }
    rows.push(row);
  }
  return rows;
}

const csvRows = parseCSV(rawCsv || "");

export const SYMPTOMS_DB = csvRows.map((r) => {
  const english = r["symptom"] || "";
  const fr = r["traduction_fr"] || english;
  const keywordsRaw = r["keywords"] || "";
  const partsRaw = r["body_parts"] || "";

  const keywords = keywordsRaw
    .split(/[;,]/)
    .map((k) => k.trim())
    .filter(Boolean);

  const bodyPartsTokens = partsRaw
    .split(/[;,]/)
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);

  const partId = bodyPartsTokens.length > 0 ? bodyPartsTokens[0] : null;

  return {
    id: (english || fr).toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""),
    symptom: english,
    label: fr,
    traduction_fr: fr,
    keywords,
    partId: partId || null, // original token (lowercased)
    bodyPartsTokens,
    raw: r,
    intensity: 5,
  };
});

export function searchSymptoms(query) {
  if (!query || query.length < 2) return [];
  const lowerQ = query.toLowerCase();
  return SYMPTOMS_DB.filter((s) => {
    if ((s.label || "").toLowerCase().includes(lowerQ)) return true;
    if ((s.symptom || "").toLowerCase().includes(lowerQ)) return true;
    return (s.keywords || []).some((k) => k.toLowerCase().includes(lowerQ));
  });
}

export function getSymptomsForPart(partId) {
  if (!partId) return [];
  const zoneKey = getZoneKeyForPart(partId);
  const lowerPart = String(partId).toLowerCase();

  return SYMPTOMS_DB.filter((s) => {
    const tokens = s.bodyPartsTokens || [];
    // direct match with token (csv token)
    if (tokens.includes(lowerPart)) return true;
    // match with zone key (e.g., 'chest') for parts like 'Pecs'
    if (zoneKey && tokens.includes(String(zoneKey).toLowerCase())) return true;
    // also allow matching when token equals zoneKey itself stored in partId
    if (s.partId && s.partId.toLowerCase() === lowerPart) return true;
    return false;
  });
}
 