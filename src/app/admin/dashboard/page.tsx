'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import Link from 'next/link';

export default function AdminDashboard() {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: interventionsData } = await supabase.from('interventions').select('*');
      setInterventions(interventionsData || []);

      const { data: clientsData } = await supabase.from('clients').select('*');
      setClients(clientsData || []);
    }

    fetchData();
  }, []);

  function getClientName(client_id: string) {
    const client = clients.find((c) => c.id === client_id);
    return client ? client.nom : 'Client inconnu';
  }

  function getValidationColor(validation: string) {
    switch (validation) {
      case 'accepte':
        return 'text-green-600';
      case 'refuse':
        return 'text-red-600';
      case 'en_attente':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Liste des interventions</h1>

      <Link href="/admin/dashboard/creer">
        <button className="bg-blue-600 text-white px-4 py-2 rounded mb-6">
          + Nouvelle Intervention
        </button>
      </Link>

      <div className="space-y-4">
        {interventions.map((intervention) => (
          <div key={intervention.id} className="border p-4 rounded space-y-2">
            <h2 className="text-lg font-semibold">
              Client : {getClientName(intervention.client_id)}
            </h2>
            <p>Motif : {intervention.motif}</p>
            <p>Date : {intervention.date_intervention} ({intervention.heure_debut} - {intervention.heure_fin})</p>

            <p className={getValidationColor(intervention.validation_technicien)}>
              Validation Technicien : {intervention.validation_technicien === 'en_attente'
                ? 'En attente'
                : intervention.validation_technicien === 'accepte'
                ? 'Acceptée'
                : 'Refusée'}
            </p>

            <Link href={`/admin/dashboard/${intervention.id}`}>
              <button className="mt-2 bg-gray-700 text-white px-3 py-1 rounded">
                Voir fiche
              </button>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
