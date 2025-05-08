'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../../../lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PageRecapitulatif() {
  const { id } = useParams();
  const router = useRouter();
  const [donnees, setDonnees] = useState<any>(null);

  useEffect(() => {
    // Appelle ta table d’interventions ou ton stockage local si tu n’as pas encore de persistance
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('interventions')
        .select('*, client(*), produits_selectionnes(*)')
        .eq('id', id)
        .single();

      if (data) setDonnees(data);
      if (error) console.error('Erreur chargement récap :', error);
    };

    fetchData();
  }, [id]);

  if (!donnees) return <p className="p-6">Chargement...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Récapitulatif de l’intervention</h1>

      <Card className="p-4 space-y-2">
        <p><strong>Client :</strong> {donnees.client?.nom || 'Inconnu'}</p>
        <p><strong>Date :</strong> {new Date(donnees.created_at).toLocaleString()}</p>
        <p><strong>Technicien :</strong> {donnees.technicien_id || '-'}</p>
      </Card>

      <div className="space-y-4">
        {donnees.produits_selectionnes.map((produit: any, idx: number) => (
          <Card key={idx} className="p-4 space-y-2">
            <p><strong>Produit :</strong> {produit.nom}</p>
            <p><strong>Statut :</strong> {produit.statut}</p>
            {produit.remarque && <p><strong>Remarque :</strong> {produit.remarque}</p>}
            {produit.photos && produit.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {produit.photos.map((photo: any, i: number) => (
                  <img
                    key={i}
                    src={photo.url}
                    alt={`photo-${i}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      <Button
        className="w-full mt-6"
        onClick={() => router.push(`/technicien/intervention/${id}/signature`)}
      >
        Continuer vers la signature
      </Button>
    </div>
  );
}
