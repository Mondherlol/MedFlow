function getStatusText(status) {
  if (!status) return "—";
  switch (String(status).toLowerCase()) {
    case "confirme": return "Confirmé";
    case "termine": return "Terminé";
    case "encours": return "En cours";
    case "annule": return "Annulé";
    default: return String(status).replace("_", " ");
  }
}

export { getStatusText };