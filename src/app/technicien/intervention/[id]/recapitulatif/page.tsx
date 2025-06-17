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
import {
  loadInterventionFromCache,
  type InterventionTempData,
  type ProduitSelectionne,
} from '@/lib/interventionCache';
import { ArrowLeft } from 'lucide-react';

export default function PageRecapitulatif() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<InterventionTempData | null>(null);

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
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="text-sm px-2 mb-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🧾 Récapitulatif de l’intervention
        </h1>
      </div>

      <div className="space-y-6">
        {/* Infos générales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">📍 Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p><strong>Client :</strong> {data.clientNom}</p>
            <p><strong>Adresse :</strong> {data.clientAdresse}</p>
            <p><strong>Téléphone :</strong> {data.clientTelephone}</p>
            <p><strong>Motif :</strong> {data.motif}</p>
            <p><strong>Date :</strong> {data.date_intervention}</p>
            <p><strong>Horaire :</strong> {data.heure_debut} ➔ {data.heure_fin}</p>
          </CardContent>
        </Card>

        {/* Produits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">🧰 Produits vérifiés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.produits?.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun produit sélectionné.</p>
            ) : (
              data.produits.map((p: ProduitSelectionne, i: number) => (
                <div key={i} className="border-t pt-3 mt-2 space-y-1 text-sm">
                  <p><strong>Produit :</strong> {p.nom}</p>
                  <p><strong>Statut :</strong> {p.statut === 'a_remplacer' ? '🔁 À remplacer' : '✅ Fonctionnel'}</p>
                  {p.remarque && <p><strong>Remarque :</strong> <em>{p.remarque}</em></p>}
                  {p.photos?.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {p.photos.map((photo, index: number) => (
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

        {/* Signature */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">✍️ Signature du client</CardTitle>
          </CardHeader>
          <CardContent>
            {data.signatureBase64 ? (
              <div className="p-3 rounded-md border bg-white shadow-inner inline-block">
                <Image
                  src={`data:image/png;base64,${data.signatureBase64}`}
                  alt="Signature"
                  width={300}
                  height={100}
                  className="object-contain"
                />
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Aucune signature enregistrée.</p>
            )}
          </CardContent>
        </Card>

        {/* Finalisation */}
        <div className="flex justify-end pt-4">
          <Button
            className="px-6 text-base font-semibold"
            onClick={() => router.push(`/technicien/intervention/${id}/finalisation`)}
          >
            ✅ Finaliser l’intervention
          </Button>
        </div>
      </div>
    </LayoutTechnicien>
  );
}
