'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import LayoutDashboardSidebar from '@/components/LayoutDashboardSidebar';
import { supabase } from '../../../../../lib/supabaseClient';

export default function FicheInterventionReadOnly() {
  const { id } = useParams();
  const [intervention, setIntervention] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      const { data, error } = await supabase
        .from('interventions')
        .select(`*, clients:client_id(nom, adresse, telephone), intervention_produits(produit_id, statut, remarque, photos, produits(nom))`)
        .eq('id', id)
        .single();

      if (error) {
        setError('Erreur de chargement des détails.');
        console.error(error);
      } else {
        setIntervention(data);
      }

      setLoading(false);
    }

    if (id) fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <LayoutDashboardSidebar>
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
        </div>
      </LayoutDashboardSidebar>
    );
  }

  if (error || !intervention) {
    return (
      <LayoutDashboardSidebar>
        <p className="text-red-600 p-6 font-semibold">❌ {error || 'Données indisponibles.'}</p>
      </LayoutDashboardSidebar>
    );
  }

  return (
    <LayoutDashboardSidebar>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold">📄 Détails de l’intervention</h1>

        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p><strong>Nom :</strong> {intervention.clients.nom}</p>
            <p><strong>Adresse :</strong> {intervention.clients.adresse}</p>
            <p><strong>Téléphone :</strong> {intervention.clients.telephone}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intervention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p><strong>Motif :</strong> {intervention.motif}</p>
            <p><strong>Date :</strong> {intervention.date_intervention}</p>
            <p><strong>Heure :</strong> {intervention.heure_debut} ➔ {intervention.heure_fin}</p>
            <p>
              <strong>Statut :</strong>{' '}
              <Badge variant={
                intervention.validation_technicien === 'accepte'
                  ? 'success'
                  : intervention.validation_technicien === 'refuse'
                  ? 'danger'
                  : 'warning'
              }>
                {intervention.validation_technicien.replace('_', ' ')}
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produits associés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {intervention.intervention_produits.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun produit enregistré.</p>
            ) : (
              intervention.intervention_produits.map((p: any, i: number) => (
                <div key={i} className="border-t pt-2 mt-2 space-y-2">
                  <p><strong>Produit :</strong> {p.produits.nom}</p>
                  <p><strong>Statut :</strong> {p.statut === 'a_remplacer' ? 'À remplacer' : 'Fonctionnel'}</p>
                  {p.remarque && <p><strong>Remarque :</strong> <em>{p.remarque}</em></p>}
                  {p.photos?.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {p.photos.map((photo: any, index: number) => (
                        <Image
                          key={index}
                          src={photo.url}
                          alt={`photo-${index}`}
                          width={300}
                          height={200}
                          className="rounded border"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {intervention.signature_url && (
          <Card>
            <CardHeader>
              <CardTitle>Signature client</CardTitle>
            </CardHeader>
            <CardContent>
              <Image
                src={intervention.signature_url}
                alt="signature"
                width={300}
                height={100}
                className="rounded border bg-white"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </LayoutDashboardSidebar>
  );
}
