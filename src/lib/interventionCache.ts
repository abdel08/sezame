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
  type_intervention?: 'contrat' | 'dépannage' | 'chantier' | 'sous garantie'; 
  etat_installation?: "installation dépannée" | "prévoir travaux" | "installation à l’arrêt";


  // ✅ Ajout léger pour le PDF (optionnel)
  clientEmail?: string;
};

export function saveInterventionToCache(id: string, data: InterventionTempData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`intervention_${id}`, JSON.stringify(data));
  }
}

export function loadInterventionFromCache(id: string): InterventionTempData | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(`intervention_${id}`);
  return raw ? JSON.parse(raw) : null;
}

export function clearInterventionCache(id: string) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`intervention_${id}`);
  }
}