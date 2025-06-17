export type ProduitSelectionne = {
  id: string;
  nom: string;
  statut: 'fonctionnel' | 'a_remplacer';
  remarque?: string;
  photos: { name: string; url: string; path: string }[];
};

export type InterventionTempData = {
  clientId: string;
  clientNom: string;
  clientAdresse: string;
  clientTelephone: string;
  technicienId: string;
  motif: string;
  date_intervention: string;
  heure_debut: string;
  heure_fin: string;
  produits: ProduitSelectionne[];
  signatureBase64: string;

  // ✅ Ajout léger pour le PDF (optionnel)
  clientEmail?: string;
};

export function saveInterventionToCache(id: string, data: InterventionTempData) {
  localStorage.setItem(`intervention_${id}`, JSON.stringify(data));
}

export function loadInterventionFromCache(id: string): InterventionTempData | null {
  const raw = localStorage.getItem(`intervention_${id}`);
  return raw ? JSON.parse(raw) : null;
}

export function clearInterventionCache(id: string) {
  localStorage.removeItem(`intervention_${id}`);
}
