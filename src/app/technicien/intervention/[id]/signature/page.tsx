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
    const path = `interventions/${id}/signature.png`;
  
    const response = await fetch('/api/upload-signature', {
      method: 'POST',
      body: JSON.stringify({
        file: dataUrl,
        path
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  
    const result = await response.json();
  
    if (!response.ok) {
      console.error('Erreur upload signature :', result);
      return;
    }
  
    setSaved(true);
    router.push(`/technicien/intervention/${id}/finalisation`);
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
