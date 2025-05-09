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

    // 1. Upload signature
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

    // 2. Update intervention with signature + statut = terminee
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

    // 3. Insert selected produits
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

    // 4. Clear cache + success
    clearInterventionCache(id as string);
    setSuccess(true);
    setLoading(false);
  };

  return (
    <LayoutTechnicien>
      <Card>
        <CardHeader>
          <CardTitle>🚀 Finalisation de l’intervention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Cette étape enregistre définitivement les données de l’intervention :
            <br />✅ Signature client &nbsp;&nbsp;✅ Produits sélectionnés
          </p>

          {error && (
            <div className="flex items-center gap-2 text-red-600 font-medium">
              <AlertTriangle size={18} /> {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <CheckCircle size={18} /> Intervention finalisée avec succès.
            </div>
          )}

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
            ) : success || alreadyFinalized ? '✅ Terminé' : 'Finaliser maintenant'}
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
        </CardContent>
      </Card>
    </LayoutTechnicien>
  );
}
