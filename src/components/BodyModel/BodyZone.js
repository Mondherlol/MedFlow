
const BODY_ZONES = {
  chest: {
    label: "Torse / Poitrine",
    parts: ["Pecs", "CageThoracique" ],
  },
  back :{
    label: "Dos",
    parts: ["HautDos", "BasDos"],
  },
  abdomen: {
    label: "Ventre / Abdomen",
    parts: ["Abdos", "VentreGauche", "VentreDroit"],
  },
  pubis : {
    label: "Pubis",
    parts: ["Pubis"],
  },
  eyes: {
    label: "Yeux",
    parts: ["OeilGauche", "OeilDroit"],
  },
  nez: {
    label: "Nez",
    parts: ["Nez"],
  },
  bouche: {
    label: "Bouche",
    parts: ["Bouche", "Machoire"],
  },
  head:{
    label: "Tête",
    parts: [
      "TempeGauche",
      "TempeDroit",
      "DessusdeCraneGauche",
      "DessusdeCraneDroit",
      "ArriereCraneGauche",
      "ArriereCraneDroit",
    ],
  },
  ears: {
    label: "Oreilles",
    parts: ["OreilleGauche", "OreilleDroit"],
  },
  hands: {
    label: "Mains",
    parts: [ "MainGauche", "MainDroit"],
  },
  feets: {
    label: "Pieds",
    parts: ["PiedGauche", "PiedDroit", "ChevilleGauche", "ChevilleDroit", "TalonGauche", "TalonDroit", "OrteilGauche", "OrteilDroit"],
  },
  fingers: {
    label: "Doigts",
    parts: [ "PouceGauche", "IndexGauche001", "MajeuGauche", "AnnulaireGauche", "OriculaireGauche001",
             "PouceDroit", "IndexDroit", "MajeuDroit", "AnnulaireDroit", "OriculaireDroit"],
  },
  arms: {
    label: "Bras",
    parts: [ "PoignéeGauche", "AvantBrasGauche", "CreuCoudeGauche", "CoudeGauche", "EpauleGauche", "BrasGauche",
             "PoignéeDroit", "AvantBrasDroit", "CreuCoudeDroit", "CoudeDroit", "EpauleDroit", "BrasDroit"],
  },
  armpits: {
    label: "Aisselles",
    parts: ["AisselleGauche", "AisselleDroit"],
  },
  thighs: {
    label: "Cuisses",
    parts: ["CuisseGauche", "CuisseDroit"],
  },

  hips: {
    label: "Hanches",
    parts: ["HancheGauche", "HancheDroit"],
  },
  knees: {
    label: "Genoux",
    parts: ["GenouxGauche", "GenouxDroit"],
  },
  lowerBack: {
    label: "Bas du dos",
    parts: ["BasDos"],
  },
  neck: {
    label: "Cou / nuque",
    parts: ["Cou", "Nuque"],
  },
  Buttocks : {
    label: "Fesses",
    parts: ["Fesse"],
  },
  cheeks : {
    label: "Joues",
    parts: ["JoueGauche", "JoueDroit"],
  },
  other: {
    label: "Autre région",
    parts: [],
  },
};

const PARTS_NAMES = {
  PouceGauche: "Pouce gauche",
  IndexGauche001: "Index Gauche",
  MajeuGauche: "Majeur gauche",
  AnnulaireGauche: "Annulaire gauche",
  OriculaireGauche001: "Auriculaire gauche (petit doigt)",
  MainGauche: "Main gauche",
  PoignéeGauche: "Poignet gauche",
  CoudeGauche: "Coude gauche",
  AvantBrasGauche: "Avant-bras gauche",
  CreuCoudeGauche: "Creux du coude gauche",
  EpauleGauche: "Épaule gauche",
  BrasGauche: "Bras gauche",
  AisselleGauche: "Aisselle gauche",
  OreilleGauche: "Oreille gauche",
  Bouche: "Bouche",
  Nez: "Nez",
  TempeGauche: "Tempe gauche",
  DessusdeCraneGauche: "Dessus du crâne gauche",
  ArriereCraneGauche: "Arrière du crâne gauche",
  JoueGauche: "Joue gauche",
  Pecs: "Pectoraux / Poitrine",
  Pubis: "Pubis",
  Fesse: "Fesse",
  CuisseGauche: "Cuisse gauche",
  HancheGauche: "Hanche gauche",
  VentreGauche: "Ventre gauche",
  GenouxGauche: "Genou gauche",
  JambeGauche: "Jambe gauche",
  OrteilGauche: "Orteil gauche",
  PiedGauche: "Pied gauche",
  TalonGauche: "Talon gauche",
  ChevilleGauche: "Cheville gauche",
  VentreDroit: "Ventre droit",
  TempeDroit: "Tempe droit",
  TalonDroit: "Talon droit",
  PouceDroit: "Pouce droit",
  PoignéeDroit: "Poignet droit",
  PiedDroit: "Pied droit",
  OrteilDroit: "Orteil droit",
  OriculaireDroit: "Auriculaire droit (petit doigt)",
  OreilleDroit: "Oreille droite",
  OeilDroit: "Œil droit",
  Nuque: "Nuque",
  MajeuDroit: "Majeur droit",
  MainDroit: "Main droite",
  Machoire: "Mâchoire",
  JoueDroit: "Joue droite",
  JambeDroit: "Jambe droite",
  IndexDroit: "Index droit",
  HautDos: "Haut du dos",
  HancheDroit: "Hanche droite",
  GenouxDroit: "Genou droit",
  EpauleDroit: "Épaule droite",
  DessusdeCraneDroit: "Dessus du crâne droit",
  CuisseDroit: "Cuisse droite",
  CreuCoudeDroit: "Creux du coude droit",
  Cou: "Cou",
  CoudeDroit: "Coude droit",
  ChevilleDroit: "Cheville droite",
  BrasDroit: "Bras droit",
  BasDos: "Bas du dos",
  AvantBrasDroit: "Avant-bras droit",
  ArriereCraneDroit: "Arrière du crâne droit",
  AnnulaireDroit: "Annulaire droit",
  AisselleDroit: "Aisselle droite",
  Abdos: "Abdominaux",
  OeilGauche: "Œil gauche",
  CageThoracique: "Cage thoracique",
};

export { PARTS_NAMES , BODY_ZONES };

// Helper: retourne le libellé d'une partie (part ID -> display name)
function getPartName(partId) {
  return PARTS_NAMES[partId] || partId;
}

// Helper: retourne le libellé d'une zone (zone ID -> display name)
function getZoneName(zoneId) {
  return BODY_ZONES[zoneId]?.label || zoneId;
}

// Helper: retourne la liste des libellés des parties pour une zone donnée
function getZonePartsLabels(zoneId) {
  const parts = BODY_ZONES[zoneId]?.parts || [];
  return parts.map(getPartName);
}

// Helper: trouve la clé de zone correspondant à une part (ex: 'Pecs' -> 'chest')
function getZoneKeyForPart(partName) {
  for (const [zoneKey, cfg] of Object.entries(BODY_ZONES)) {
    if ((cfg.parts || []).includes(partName)) return zoneKey;
  }
  return "other";
}

export { getPartName, getZoneName, getZonePartsLabels };
export { getZoneKeyForPart };