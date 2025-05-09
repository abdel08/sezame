export interface Intervention {
    id: string
    motif?: string
    date_intervention: string
    heure_debut: string
    heure_fin: string
    validation_technicien?: 'accepte' | 'refuse' | 'en_attente'
    statut?: 'terminee' | 'en_cours'
    clients?: { nom?: string } // 👈 nom est optionnel
  }
  