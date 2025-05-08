'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../../../lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function PageRecapitulatif() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [produits, setProduits] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: intervention, error } = await supabase
        .from('interventions')
        .select(`*, clients:client_id(nom, adresse, telephone), signature_url`)
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Erreur chargement intervention :', error);
        return;
      }

      const { data: produitsBruts, error: produitsErr } = await supabase
        .from('intervention_produits')
        .select('*, produits(nom)')
        .eq('intervention_id', id);

      if (produitsErr) {
        console.error('❌ Erreur chargement produits intervention :', produitsErr);
      } else {
        const produitsFormates = produitsBruts.map((p) => ({
          nom: p.produits?.nom || 'Produit inconnu',
          a_remplacer: p.a_remplacer,
          remarque: p.remarque,
        }));
        setProduits(produitsFormates);
      }

      setData(intervention);
    };

    fetchData();
  }, [id]);

  if (!data) return <div className="p-6">Chargement…</div>;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Récapitulatif de l’intervention</h1>

      <Card className="p-4 space-y-2">
        <h2 className="text-lg font-semibold">Client</h2>
        <p><strong>Nom :</strong> {data.clients?.nom}</p>
        <p><strong>Adresse :</strong> {data.clients?.adresse}</p>
        <p><strong>Téléphone :</strong> {data.clients?.telephone}</p>
      </Card>

      <Card className="p-4 space-y-2">
        <h2 className="text-lg font-semibold">Produits sélectionnés</h2>
        {produits.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aucun produit sélectionné.</p>
        ) : (
          produits.map((p, i) => (
            <div key={i} className="border-t pt-2 mt-2">
              <p><strong>Produit :</strong> {p.nom}</p>
              <p><strong>Statut :</strong> {p.a_remplacer ? 'À remplacer' : 'Fonctionnel'}</p>
              {p.remarque && <p><strong>Remarque :</strong> <em>{p.remarque}</em></p>}
            </div>
          ))
        )}
      </Card>

      <Card className="p-4 space-y-2">
        <h2 className="text-lg font-semibold">Signature client</h2>
        {data.signature_url ? (
          <Image
            src={data.signature_url}
            alt="signature"
            width={300}
            height={100}
            className="rounded border bg-white"
          />
        ) : (
          <p className="text-muted-foreground text-sm">Signature non disponible.</p>
        )}
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => router.push(`/technicien/intervention/${id}/finalisation`)}>
          Finaliser l’intervention
        </Button>
      </div>
    </main>
  );
}