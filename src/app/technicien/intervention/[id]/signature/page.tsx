'use client';

import { useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '../../../../../../lib/supabaseClient';


export default function PageSignature() {
  const { id } = useParams();
  const router = useRouter();
  const sigRef = useRef<SignatureCanvas | null>(null);
  const [saved, setSaved] = useState(false);

  const clearSignature = () => {
    sigRef.current?.clear();
    setSaved(false);
  };

  const saveSignature = async () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      alert('Veuillez signer avant de continuer.');
      return;
    }
  
    const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL('image/png');
    const base64 = dataUrl.split(',')[1]; // remove "data:image/png;base64,"
  
    const path = `interventions/${id}/signature.png`;
  
    const res = await fetch('/api/intervention/upload-signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Data: base64, path }),
    });
  
    const result = await res.json();
  
    if (!res.ok || !result.url) {
      console.error('Erreur upload signature :', result);
      alert('Échec de l’enregistrement.');
      return;
    }
  
    // Sauvegarde l'URL dans la BDD
    await fetch('/api/intervention/save-signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interventionId: id,
        signatureUrl: result.url,
      }),
    });
  
    router.push(`/technicien/intervention/${id}/recapitulatif`);
  };
  
  
  
  

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Signature du client</h1>

      <Card className="p-4">
        <SignatureCanvas
          ref={sigRef}
          penColor="black"
          canvasProps={{
            className: 'w-full h-64 border rounded bg-white'
          }}
        />
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" onClick={clearSignature}>Effacer</Button>
        <Button className="flex-1" onClick={saveSignature}>
          Enregistrer et continuer
        </Button>
      </div>

      {saved && <p className="text-green-600 text-sm">Signature enregistrée.</p>}
    </div>
  );
}
