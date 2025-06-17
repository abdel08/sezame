'use client';

import { loadInterventionFromCache } from '@/lib/interventionCache';
import { useParams } from 'next/navigation';

export default function HeaderIntervention() {
  const { id } = useParams();
  const data = loadInterventionFromCache(id as string);

  if (!data) return null;

  return (
    <aside className="sticky top-0 z-50 bg-blue-50 p-4 border-b shadow-sm text-sm text-blue-900 mb-4">
      <div className="flex justify-between items-center">
        <div className="space-y-0.5">
          <p><strong>Client :</strong> {data.clientNom}</p>
          <p><strong>Motif :</strong> {data.motif}</p>
          <p><strong>Heure :</strong> {data.heure_debut} - {data.heure_fin}</p>
        </div>
      </div>
    </aside>
  );
}
