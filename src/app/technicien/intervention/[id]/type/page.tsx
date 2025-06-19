'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import LayoutTechnicien from '@/components/LayoutTechnicien';
import {
  loadInterventionFromCache,
  saveInterventionToCache,
  type InterventionTempData,
} from '@/lib/interventionCache';

const TYPES: InterventionTempData['type_intervention'][] = [
  'contrat',
  'dépannage',
  'chantier',
  'sous garantie',
];

export default function PageTypeIntervention() {
  const { id } = useParams();
  const router = useRouter();
  const [selected, setSelected] = useState<InterventionTempData['type_intervention']>();

  useEffect(() => {
    const cache = loadInterventionFromCache(id as string);
    if (cache?.type_intervention) {
      setSelected(cache.type_intervention);
    }
  }, [id]);

  const handleValidate = () => {
    if (!selected) return;
    const cache = loadInterventionFromCache(id as string);
    if (!cache) return;

    const updated: InterventionTempData = {
      ...cache,
      type_intervention: selected,
    };

    saveInterventionToCache(id as string, updated);
    router.push(`/technicien/intervention/${id}/etat`);
  };

  return (
    <LayoutTechnicien>
      <h1 className="text-xl font-semibold mb-4">📄 Type d'intervention</h1>
      <div className="space-y-3 mb-6">
        {TYPES.map((type) => (
          <Button
            key={type}
            variant={selected === type ? 'default' : 'outline'}
            className="w-full capitalize"
            onClick={() => setSelected(type)}
          >
            {type}
          </Button>
        ))}
      </div>

      <Button onClick={handleValidate} disabled={!selected} className="w-full">
        Continuer →
      </Button>
    </LayoutTechnicien>
  );
}
