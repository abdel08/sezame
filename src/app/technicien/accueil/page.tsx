// 1. Commençons par corriger l'affichage de l'accueil technicien :
// ---
// Assurons-nous que la page affiche bien les interventions du technicien connecté.
// Supabase attend une correspondance exacte sur l'id utilisateur. 
// On doit aussi afficher les erreurs éventuelles.

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function TechnicienAccueil() {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchUserAndInterventions() {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Erreur d'authentification");
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error: interError } = await supabase
        .from('interventions')
        .select('*, clients (nom), profiles (nom)')
        .eq('technicien_id', user.id)
        .order('date_intervention', { ascending: true });

      if (interError) {
        setError("Erreur chargement des interventions");
      } else {
        setInterventions(data || []);
      }

      setLoading(false);
    }

    fetchUserAndInterventions();
  }, []);

  async function handleValidation(id: string, action: 'accepte' | 'refuse') {
    await supabase
      .from('interventions')
      .update({ validation_technicien: action })
      .eq('id', id);

    const { data } = await supabase
      .from('interventions')
      .select('*, clients (nom), profiles (nom)')
      .eq('technicien_id', userId)
      .order('date_intervention', { ascending: true });

    setInterventions(data || []);
  }

  if (loading) return <p className="p-6">Chargement...</p>;
  if (error) return <p className="text-red-600 p-6">{error}</p>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Mes interventions</h1>

      <div className="space-y-4">
        {interventions.map((intervention) => (
          <div key={intervention.id} className="border p-4 rounded space-y-2">
            <p><strong>Client :</strong> {intervention.clients?.nom ?? 'Client inconnu'}</p>
            <p><strong>Date :</strong> {intervention.date_intervention}</p>
            <p><strong>Heure :</strong> {intervention.heure_debut} ➔ {intervention.heure_fin}</p>
            <p><strong>Motif :</strong> {intervention.motif}</p>
            <p><strong>Statut :</strong> {intervention.validation_technicien}</p>

            {intervention.validation_technicien === 'accepte' && (
              <button
                onClick={() => router.push(`/technicien/intervention/${intervention.id}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Démarrer l'intervention
              </button>
            )}

            {intervention.validation_technicien === 'en_attente' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleValidation(intervention.id, 'accepte')}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Accepter
                </button>
                <button
                  onClick={() => handleValidation(intervention.id, 'refuse')}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Refuser
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
