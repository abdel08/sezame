'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import LayoutTechnicien from '@/components/LayoutTechnicien';
import { loadInterventionFromCache } from '@/lib/interventionCache';

export default function PageRecapitulatif() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const cached = loadInterventionFromCache(id as string);
    if (cached) setData(cached);
  }, [id]);

  if (!data) {
    return (
      <LayoutTechnicien>
        <p className="p-6 text-muted-foreground">Chargement du récapitulatif…</p>
      </LayoutTechnicien>
    );
  }

  return (
    <LayoutTechnicien>
      <h1 className="text-2xl font-bold mb-6">🧾 Récapitulatif de l’intervention</h1>

      <Card>
        <CardHeader>
          <CardTitle>📍 Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p><strong>Client :</strong> {data.clientNom}</p>
          <p><strong>Adresse :</strong> {data.clientAdresse}</p>
          <p><strong>Téléphone :</strong> {data.clientTelephone}</p>
          <p><strong>Motif :</strong> {data.motif}</p>
          <p><strong>Date :</strong> {data.date_intervention}</p>
          <p><strong>Horaire :</strong> {data.heure_debut} ➔ {data.heure_fin}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🧰 Produits sélectionnés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.produits?.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucun produit sélectionné.</p>
          ) : (
            data.produits.map((p: any, i: number) => (
              <div key={i} className="border-t pt-2 mt-2 space-y-1 text-sm">
                <p><strong>Produit :</strong> {p.nom}</p>
                <p><strong>Statut :</strong> {p.statut === 'a_remplacer' ? '🔁 À remplacer' : '✅ Fonctionnel'}</p>
                {p.remarque && (
                  <p><strong>Remarque :</strong> <em>{p.remarque}</em></p>
                )}
                {p.photos?.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {p.photos.map((photo: any, index: number) => (
                      <Image
                        key={index}
                        src={photo.url}
                        alt={photo.name || `photo-${index}`}
                        width={300}
                        height={200}
                        className="rounded border object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>✍️ Signature du client</CardTitle>
        </CardHeader>
        <CardContent>
          {data.signatureBase64 ? (
            <Image
              src={`data:image/png;base64,${data.signatureBase64}`}
              alt="Signature"
              width={300}
              height={100}
              className="rounded border bg-white"
            />
          ) : (
            <p className="text-muted-foreground text-sm">Aucune signature enregistrée.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end mt-6">
        <Button onClick={() => router.push(`/technicien/intervention/${id}/finalisation`)}>
          ✅ Finaliser l’intervention
        </Button>
      </div>
    </LayoutTechnicien>
  );
}
