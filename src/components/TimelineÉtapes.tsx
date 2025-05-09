'use client';

import { usePathname } from 'next/navigation';

const étapes = [
  { label: 'Démarrage', path: 'start' },
  { label: 'Produits', path: 'produit' },
  { label: 'Signature', path: 'signature' },
  { label: 'Récapitulatif', path: 'recapitulatif' },
  { label: 'Finalisation', path: 'finalisation' },
];

export default function TimelineÉtapes() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4 flex-wrap">
      {étapes.map((étape, index) => {
        const active = pathname.includes(étape.path);
        return (
          <div key={étape.path} className="flex items-center">
            <span
              className={`px-2 py-1 rounded-full border text-xs font-medium ${
                active ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100'
              }`}
            >
              {étape.label}
            </span>
            {index < étapes.length - 1 && (
              <span className="mx-1 text-gray-400">→</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
