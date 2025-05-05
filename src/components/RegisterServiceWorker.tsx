'use client';

import { useEffect } from 'react';

export default function RegisterServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
          console.log('✅ Service Worker enregistré');
        })
        .catch((err) => {
          console.error('❌ Échec de l’enregistrement du SW :', err);
        });
    }
  }, []);

  return null;
}
