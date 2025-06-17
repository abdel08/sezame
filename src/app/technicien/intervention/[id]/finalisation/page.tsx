'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../../../lib/supabaseClient';
import {
  loadInterventionFromCache,
  clearInterventionCache,
} from '@/lib/interventionCache';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import LayoutTechnicien from '@/components/LayoutTechnicien';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { generatePdfAndDownload } from '@/lib/pdfGenerator';
import type { InterventionTempData } from '@/lib/interventionCache';

type PdfInterventionData = {
  id: string;
  date: string;
  client: {
    nom: string;
    adresse: string;
    telephone: string;
    email?: string;
  };
  produits: InterventionTempData['produits'];
  signatureBase64: string;
};

export default function PageFinalisation() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyFinalized, setAlreadyFinalized] = useState(false);

  useEffect(() => {
    const checkIfAlreadyFinalized = async () => {
      const { data, error } = await supabase
        .from('interventions')
        .select('statut')
        .eq('id', id)
        .single();

      if (!error && data?.statut?.toLowerCase() === 'terminee') {
        setAlreadyFinalized(true);
        setSuccess(true);
      }
    };

    checkIfAlreadyFinalized();
  }, [id]);

  const handleFinaliser = async () => {
    setLoading(true);
    setError(null);

    const cache = loadInterventionFromCache(id as string);
    if (!cache) {
      setError('❌ Données introuvables dans le cache.');
      setLoading(false);
      return;
    }

    const { signatureBase64, produits } = cache;
    const signaturePath = `interventions/${id}/signature.png`;

    const uploadRes = await fetch('/api/intervention/upload-signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Data: signatureBase64, path: signaturePath }),
    });

    const uploadJson = await uploadRes.json();
    if (!uploadRes.ok || !uploadJson.url) {
      setError('❌ Échec de l’upload de la signature.');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('interventions')
      .update({
        signature_url: uploadJson.url,
        statut: 'terminee',
      })
      .eq('id', id);

    if (updateError) {
      setError('❌ Erreur lors de la mise à jour de l’intervention.');
      setLoading(false);
      return;
    }

    const insertProduits = produits.map((p) => ({
      intervention_id: id,
      produit_id: p.id,
      a_remplacer: p.statut === 'a_remplacer',
      remarque: p.remarque || '',
      photos: p.photos || [],
    }));

    const { error: insertError } = await supabase
      .from('intervention_produits')
      .insert(insertProduits);

    if (insertError) {
      setError("❌ Échec de l’enregistrement des produits.");
      setLoading(false);
      return;
    }

    const pdfData: PdfInterventionData = {
      id: id as string,
      date: cache.date_intervention,
      client: {
        nom: cache.clientNom,
        adresse: cache.clientAdresse,
        telephone: cache.clientTelephone,
        email: cache.clientEmail,
      },
      produits,
      signatureBase64,
    };

    await generatePdfAndDownload(pdfData);

    clearInterventionCache(id as string);
    setSuccess(true);
    setLoading(false);
  };

  return (
    <LayoutTechnicien>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">🚀 Finalisation de l’intervention</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p className="leading-relaxed">
            Cette étape enregistre définitivement les données :
            <br />
            <span className="text-green-700 font-medium">✔ Signature client</span> &nbsp;&nbsp;
            <span className="text-green-700 font-medium">✔ Produits sélectionnés</span>
          </p>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm font-medium border border-red-200 bg-red-50 rounded px-3 py-2">
              <AlertTriangle size={18} /> {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium border border-green-200 bg-green-50 rounded px-3 py-2">
              <CheckCircle size={18} className="animate-bounce" /> Intervention finalisée avec succès.
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={handleFinaliser}
              disabled={loading || success || alreadyFinalized}
              className="w-full"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Enregistrement en cours…
                </span>
              ) : success || alreadyFinalized ? '✅ Déjà finalisée' : '✅ Finaliser maintenant'}
            </Button>

            {success && (
              <Button
                variant="outline"
                onClick={() => router.push('/technicien')}
                className="w-full"
              >
                Retour à la liste des interventions
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </LayoutTechnicien>
  );
}
