'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import { useParams } from 'next/navigation';

type Intervention = {
  id: string;
  motif: string;
  date_intervention: string;
  heure_debut: string;
  heure_fin: string;
  client_id: string;
  technicien_id: string;
  validation_technicien: string;
};

type Client = {
  id: string;
  nom: string;
  adresse: string;
};

type Technicien = {
  id: string;
  nom: string;
  email: string;
};

export default function FicheIntervention() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id || '';

  const [intervention, setIntervention] = useState<Intervention | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [technicien, setTechnicien] = useState<Technicien | null>(null);

  useEffect(() => {
    async function fetchIntervention() {
      const { data: interventionData, error: interError } = await supabase
        .from('interventions')
        .select('*')
        .eq('id', id)
        .single();

      if (interError) {
        console.error('Erreur intervention :', interError);
        return;
      }

      setIntervention(interventionData);

      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', interventionData.client_id)
        .single();

      if (clientError) {
        console.error('Erreur client :', clientError);
      } else {
        setClient(clientData);
      }

      const { data: technicienData, error: techError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', interventionData.technicien_id)
        .single();

      if (techError) {
        console.error('Erreur technicien :', techError);
      } else {
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
