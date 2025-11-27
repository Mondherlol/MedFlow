// Liste des médicaments courants avec leurs informations
export const medicaments = [
  // Antalgiques / Antipyrétiques
  { nom: "Paracétamol", dosages: ["500mg", "1000mg"], frequences: ["3x/jour", "4x/jour"], duree: "7 jours", categorie: "Antalgique" },
  { nom: "Doliprane", dosages: ["500mg", "1000mg"], frequences: ["3x/jour", "4x/jour"], duree: "7 jours", categorie: "Antalgique" },
  { nom: "Efferalgan", dosages: ["500mg", "1000mg"], frequences: ["3x/jour", "4x/jour"], duree: "7 jours", categorie: "Antalgique" },
  
  // Anti-inflammatoires
  { nom: "Ibuprofène", dosages: ["200mg", "400mg"], frequences: ["2x/jour", "3x/jour"], duree: "5 jours", categorie: "Anti-inflammatoire" },
  { nom: "Advil", dosages: ["200mg", "400mg"], frequences: ["2x/jour", "3x/jour"], duree: "5 jours", categorie: "Anti-inflammatoire" },
  { nom: "Nurofen", dosages: ["200mg", "400mg"], frequences: ["2x/jour", "3x/jour"], duree: "5 jours", categorie: "Anti-inflammatoire" },
  { nom: "Aspégic", dosages: ["100mg", "500mg", "1000mg"], frequences: ["1x/jour", "2x/jour"], duree: "selon besoin", categorie: "Anti-inflammatoire" },
  
  // Antibiotiques
  { nom: "Amoxicilline", dosages: ["500mg", "1g"], frequences: ["2x/jour", "3x/jour"], duree: "7 jours", categorie: "Antibiotique" },
  { nom: "Augmentin", dosages: ["500mg", "1g"], frequences: ["2x/jour", "3x/jour"], duree: "7 jours", categorie: "Antibiotique" },
  { nom: "Azithromycine", dosages: ["250mg", "500mg"], frequences: ["1x/jour"], duree: "3 jours", categorie: "Antibiotique" },
  { nom: "Ciprofloxacine", dosages: ["500mg"], frequences: ["2x/jour"], duree: "7 jours", categorie: "Antibiotique" },
  
  // Antispasmodiques
  { nom: "Spasfon", dosages: ["80mg"], frequences: ["3x/jour"], duree: "selon besoin", categorie: "Antispasmodique" },
  { nom: "Débridat", dosages: ["100mg"], frequences: ["3x/jour"], duree: "selon besoin", categorie: "Antispasmodique" },
  
  // Antihistaminiques
  { nom: "Cétirizine", dosages: ["10mg"], frequences: ["1x/jour"], duree: "selon besoin", categorie: "Antihistaminique" },
  { nom: "Loratadine", dosages: ["10mg"], frequences: ["1x/jour"], duree: "selon besoin", categorie: "Antihistaminique" },
  { nom: "Aerius", dosages: ["5mg"], frequences: ["1x/jour"], duree: "selon besoin", categorie: "Antihistaminique" },
  
  // Antiacides / Gastroprotecteurs
  { nom: "Oméprazole", dosages: ["20mg", "40mg"], frequences: ["1x/jour"], duree: "14 jours", categorie: "Gastroprotecteur" },
  { nom: "Esoméprazole", dosages: ["20mg", "40mg"], frequences: ["1x/jour"], duree: "14 jours", categorie: "Gastroprotecteur" },
  { nom: "Gaviscon", dosages: ["sachet"], frequences: ["après les repas"], duree: "selon besoin", categorie: "Antiacide" },
  { nom: "Maalox", dosages: ["sachet"], frequences: ["après les repas"], duree: "selon besoin", categorie: "Antiacide" },
  
  // Antitussifs / Expectorants
  { nom: "Toplexil", dosages: ["sirop"], frequences: ["3x/jour"], duree: "5 jours", categorie: "Antitussif" },
  { nom: "Clarix", dosages: ["sirop"], frequences: ["3x/jour"], duree: "5 jours", categorie: "Expectorant" },
  { nom: "Mucomyst", dosages: ["200mg"], frequences: ["3x/jour"], duree: "7 jours", categorie: "Expectorant" },
  
  // Antiémétiques
  { nom: "Primpéran", dosages: ["10mg"], frequences: ["3x/jour"], duree: "selon besoin", categorie: "Antiémétique" },
  { nom: "Motilium", dosages: ["10mg"], frequences: ["3x/jour"], duree: "selon besoin", categorie: "Antiémétique" },
  
  // Vitamines et suppléments
  { nom: "Vitamine C", dosages: ["500mg", "1000mg"], frequences: ["1x/jour"], duree: "30 jours", categorie: "Vitamine" },
  { nom: "Vitamine D", dosages: ["1000UI", "2000UI"], frequences: ["1x/jour"], duree: "30 jours", categorie: "Vitamine" },
  { nom: "Fer", dosages: ["80mg"], frequences: ["1x/jour"], duree: "30 jours", categorie: "Supplément" },
  { nom: "Magnésium", dosages: ["300mg"], frequences: ["1x/jour"], duree: "30 jours", categorie: "Supplément" },
  
  // Corticostéroïdes
  { nom: "Prednisolone", dosages: ["5mg", "20mg"], frequences: ["1x/jour"], duree: "selon prescription", categorie: "Corticoïde" },
  { nom: "Célestène", dosages: ["0.5mg"], frequences: ["selon prescription"], duree: "selon prescription", categorie: "Corticoïde" },
  
  // Autres
  { nom: "Doliprane Codéiné", dosages: ["500mg/30mg"], frequences: ["3x/jour"], duree: "5 jours", categorie: "Antalgique fort" },
  { nom: "Tramadol", dosages: ["50mg", "100mg"], frequences: ["2x/jour"], duree: "selon besoin", categorie: "Antalgique fort" },
  { nom: "Ventoline", dosages: ["spray"], frequences: ["selon besoin"], duree: "selon besoin", categorie: "Bronchodilatateur" },
];

// Fonction de recherche de médicaments
export function searchMedicaments(query) {
  if (!query || query.trim().length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return medicaments
    .filter(med => 
      med.nom.toLowerCase().includes(normalizedQuery) ||
      med.categorie.toLowerCase().includes(normalizedQuery)
    )
    .slice(0, 8); // Limite à 8 résultats
}

// Formater une suggestion de médicament
export function formatMedicamentSuggestion(medicament, includeDetails = true) {
  if (!includeDetails) {
    return medicament.nom;
  }
  
  const dosage = medicament.dosages[0];
  const frequence = medicament.frequences[0];
  const duree = medicament.duree;
  
  return `${medicament.nom} ${dosage} - ${frequence} - ${duree}`;
}
