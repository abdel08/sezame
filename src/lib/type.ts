export type ProduitSelectionne = {
    id: string;
    nom: string;
    statut: 'fonctionnel' | 'a_remplacer';
    remarque?: string;
    photos?: { name: string; url: string; path: string }[];
  };
  
  export type PdfInterventionData = {
    id: string;
    date: string;
    client: {
      nom: string;
      adresse: string;
      telephone: string;
      email?: string;
    };
    produits: ProduitSelectionne[];
    signatureBase64: string;
  };
  