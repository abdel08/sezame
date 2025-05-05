'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import { useParams } from 'next/navigation';

export default function FicheIntervention() {
  const { id } = useParams();
  const [intervention, setIntervention] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [technicien, setTechnicien] = useState<any>(null);

  useEffect(() => {
    async function fetchIntervention() {
      const { data: interventionData } = await supabase
        .from('interventions')
        .select('*')
        .eq('id', id)
        .single();

      if (interventionData) {
        setIntervention(interventionData);

        const { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('id', interventionData.client_id)
          .single();
        setClient(clientData);

        const { data: technicienData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', interventionData.technicien_id)
          .single();
        setTechnicien(technicienData);
      }
    }

    if (id) {
      fetchIntervention();
    }
  }, [id]);

  if (!intervention) return <p className="p-6">Chargement...</p>;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Fiche Intervention</h1>

      <p><strong>Client :</strong> {client?.nom || 'Client inconnu'}</p>
      <p><strong>Date :</strong> {intervention.date_intervention}</p>
      <p><strong>Horaire :</strong> {intervention.heure_debut} - {intervention.heure_fin}</p>
      <p><strong>Motif :</strong> {intervention.motif}</p>
      <p><strong>Technicien :</strong> {technicien?.email || 'Non assigné'}</p>
      <p><strong>Statut :</strong> {intervention.validation_technicien}</p>
    </main>
  );
}
