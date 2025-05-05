'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../../lib/supabaseClient';

export default function ChoixProduit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [produits, setProduits] = useState<any[]>([]);
  const [produitSelectionne, setProduitSelectionne] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    async function fetchProduits() {
      const { data, error } = await supabase.from('produits').select('*');
      if (error) console.error('Erreur produits :', error);
      else setProduits(data);
    }

    fetchProduits();
  }, []);

  const handleSuivant = async () => {
    // Tu peux stocker la sélection dans Supabase ici si besoin
    router.push(`/technicien/intervention/${id}/diagnostic`);
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Produit défaillant</h1>

      <select
        className="border p-2 rounded w-full"
        value={produitSelectionne}
        onChange={(e) => setProduitSelectionne(e.target.value)}
      >
        <option value="">-- Sélectionner un produit --</option>
        {produits.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nom}
          </option>
        ))}
      </select>

      <button
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleSuivant}
        disabled={!produitSelectionne}
      >
        Suivant →
      </button>
    </main>
  );
}
