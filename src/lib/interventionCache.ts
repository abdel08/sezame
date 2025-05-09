// ✅ Structure globale de stockage temporaire (localStorage)

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
  };
  
  
  // ✅ Fonction pour sauvegarder en localStorage
  export function saveInterventionToCache(id: string, data: InterventionTempData) {
    localStorage.setItem(`intervention_${id}`, JSON.stringify(data));
  }
  
  // ✅ Fonction pour charger depuis le cache
  export function loadInterventionFromCache(id: string): InterventionTempData | null {
    const raw = localStorage.getItem(`intervention_${id}`);
    return raw ? JSON.parse(raw) : null;
  }
  
  // ✅ Fonction pour nettoyer le cache
  export function clearInterventionCache(id: string) {
    localStorage.removeItem(`intervention_${id}`);
  }
  