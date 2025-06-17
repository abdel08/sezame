'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const étapes = [
  { label: 'Démarrage', path: 'start' },
  { label: 'Produits', path: 'produit' },
  { label: 'Signature', path: 'signature' },
  { label: 'Récapitulatif', path: 'recapitulatif' },
  { label: 'Finalisation', path: 'finalisation' },
];

interface EtapesInterventionProps {
  id: string;
  etat: { [key: string]: boolean };      // exemple : { produit: true, signature: false }
  erreurs?: { [key: string]: boolean };  // exemple : { produit: true }
}

export default function EtapesIntervention({ id, etat, erreurs }: EtapesInterventionProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.includes(path);

  const getStatus = (path: string) => {
    if (erreurs?.[path]) return 'error';
    if (isActive(path)) return 'active';
    if (etat?.[path]) return 'done';
    return 'disabled';
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b py-3 px-2 flex flex-col md:flex-row items-start md:items-center justify-center gap-2 text-sm mb-6">
      {étapes.map((étape, index) => {
        const status = getStatus(étape.path);
        const isClickable = index === 0 || étapes.slice(0, index).every(e => etat?.[e.path]);

        const baseStyle = 'px-2 py-1 rounded-full border text-xs font-medium transition-all';

        const variant = {
          active: 'bg-blue-600 text-white border-blue-600',
          done: 'bg-green-100 text-green-800 border-green-300',
          error: 'bg-red-100 text-red-800 border-red-300',
          disabled: 'bg-gray-100 text-gray-500 border-gray-300',
        }[status];

        return (
          <div key={étape.path} className="flex items-center">
            {isClickable ? (
              <Link
                href={`/technicien/intervention/${id}/${étape.path}`}
                className={cn(baseStyle, variant)}
              >
                {étape.label}
              </Link>
            ) : (
              <span className={cn(baseStyle, variant)}>{étape.label}</span>
            )}
            {index < étapes.length - 1 && (
              <span className="mx-1 text-gray-400 hidden md:inline">→</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
