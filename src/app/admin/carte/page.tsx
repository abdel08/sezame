'use client';
import dynamic from 'next/dynamic';

const MapClient = dynamic(() => import('@/components/MapClient'), {
  ssr: false,
});

export default function PageCarte() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Carte des interventions</h1>
      <MapClient />
    </main>
  );
}
