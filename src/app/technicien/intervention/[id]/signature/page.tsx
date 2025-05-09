'use client';

import { useRef, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import LayoutTechnicien from '@/components/LayoutTechnicien';
import {
  saveInterventionToCache,
  loadInterventionFromCache,
  type InterventionTempData,
} from '@/lib/interventionCache';

export default function PageSignature() {
  const { id } = useParams();
  const router = useRouter();
  const sigRef = useRef<SignatureCanvas | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const cache = loadInterventionFromCache(id as string);
    if (cache?.signatureBase64 && sigRef.current) {
      const image = new Image();
      image.src = `data:image/png;base64,${cache.signatureBase64}`;
      image.onload = () => {
        const canvas = sigRef.current?.getCanvas();
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(image, 0, 0);
        }
      };
    }
  }, [id]);

  const clearSignature = () => {
    sigRef.current?.clear();
    setSaved(false);
  };

  const saveSignature = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      alert('Veuillez signer avant de continuer.');
      return;
    }

    const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL('image/png');
    const base64 = dataUrl.split(',')[1];

    const cache = loadInterventionFromCache(id as string) || {};
    saveInterventionToCache(id as string, {
      ...cache,
      signatureBase64: base64,
    } as InterventionTempData);

    setSaved(true);
    router.push(`/technicien/intervention/${id}/recapitulatif`);
  };

  return (
    <LayoutTechnicien>
      <h1 className="text-xl font-bold mb-4">✍️ Signature du client</h1>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Veuillez faire signer le client ci-dessous</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
            <SignatureCanvas
              ref={sigRef}
              penColor="black"
              canvasProps={{ className: 'w-full h-64 cursor-crosshair' }}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={clearSignature} className="w-1/3">
              Effacer
            </Button>
            <Button onClick={saveSignature} className="w-2/3">
              Enregistrer et continuer →
            </Button>
          </div>

          {saved && (
            <p className="text-green-600 text-sm">
              ✅ Signature enregistrée avec succès.
            </p>
          )}
        </CardContent>
      </Card>
    </LayoutTechnicien>
  );
}
