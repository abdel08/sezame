'use client';

import { use, useEffect, useState } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

// 👉 ce hook est utilisé pour récupérer les params proprement
export async function generateParams() {
  return { id: '' };
}

export default function InterventionStart({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // ⬅️ nouvelle méthode obligatoire avec Next 15
  const [intervention, setIntervention] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchIntervention() {
      const { data, error } = await supabase
        .from('interventions')
        .select(`*, clients:client_id(nom, adresse, telephone), profiles:technicien_id(nom)`)
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Erreur intervention :', error);
      } else {
        setIntervention(data);
      }
      setLoading(false);
    }

    fetchIntervention();
  }, [id]);

  if (loading) return <div className="p-6">Chargement...</div>;
  if (!intervention) return <div className="p-6">Intervention introuvable.</div>;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Démarrer l'intervention</h1>

      <div className="border p-4 rounded mb-6 space-y-2">
        <p><strong>Client :</strong> {intervention.clients.nom}</p>
        <p><strong>Adresse :</strong> {intervention.clients.adresse}</p>
        <p><strong>Téléphone :</strong> {intervention.clients.telephone}</p>
        <p><strong>Motif :</strong> {intervention.motif}</p>
        <p><strong>Date :</strong> {intervention.date_intervention}</p>
        <p><strong>Horaire :</strong> {intervention.heure_debut} - {intervention.heure_fin}</p>
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => router.push(`/technicien/intervention/${intervention.id}/produit`)}
      >
        Commencer →
      </button>
    </main>
  );
}
