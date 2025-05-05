'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';

type Intervention = {
  id: string;
  motif: string;
  date_intervention: string;
  heure_debut: string;
  heure_fin: string;
  clients: {
    nom: string;
    adresse: string;
    telephone: string;
  };
};

export default function InterventionStart() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [intervention, setIntervention] = useState<Intervention | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIntervention() {
      const { data, error } = await supabase
        .from('interventions')
        .select(`*, clients:client_id(nom, adresse, telephone)`)
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Erreur intervention :', error);
        setIntervention(null);
      } else {
        setIntervention(data as Intervention);
      }

      setLoading(false);
    }

    if (id) fetchIntervention();
  }, [id]);

  if (loading) return <div className="p-6">Chargement…</div>;
  if (!intervention) return <div className="p-6 text-red-600">Intervention introuvable.</div>;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Démarrer l’intervention</h1>

      <div className="border p-4 rounded mb-6 space-y-2 bg-white shadow">
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
