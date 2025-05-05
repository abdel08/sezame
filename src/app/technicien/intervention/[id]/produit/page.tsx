'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../../../lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface Produit {
  id: string;
  nom: string;
}

interface ProduitSelectionne {
  id: string;
  nom: string;
  statut: 'fonctionnel' | 'a_remplacer';
  remarque?: string;
  photos: { name: string; url: string }[];
}

export default function EtapeProduit() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [recherche, setRecherche] = useState('');
  const [selectionnes, setSelectionnes] = useState<ProduitSelectionne[]>([]);

  useEffect(() => {
    async function fetchProduits() {
      const { data, error } = await supabase.from('produits').select('*');
      if (!error && data) setProduits(data);
      else console.error('Erreur produits :', error);
    }

    fetchProduits();
  }, []);

  const ajouterProduit = (produit: Produit) => {
    if (!selectionnes.find((p) => p.id === produit.id)) {
      setSelectionnes([
        ...selectionnes,
        { ...produit, statut: 'fonctionnel', photos: [] }
      ]);
    }
    setRecherche('');
  };

  const modifierStatut = (id: string, statut: 'fonctionnel' | 'a_remplacer') => {
    setSelectionnes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, statut } : p))
    );
  };

  const modifierRemarque = (id: string, remarque: string) => {
    setSelectionnes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, remarque } : p))
    );
  };

  const ajouterPhoto = async (id: string, file: File) => {
    const filePath = `interventions/${id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('photos').upload(filePath, file);

    if (!error) {
      const { data } = supabase.storage.from('photos').getPublicUrl(filePath);
      setSelectionnes((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                photos: [...p.photos, { name: file.name, url: data.publicUrl }]
              }
            : p
        )
      );
    } else {
      console.error('Erreur upload photo :', error);
    }
  };

  const retirerProduit = (id: string) => {
    setSelectionnes((prev) => prev.filter((p) => p.id !== id));
  };

  const produitsFiltres = produits.filter(
    (p) =>
      p.nom.toLowerCase().includes(recherche.toLowerCase()) &&
      !selectionnes.find((s) => s.id === p.id)
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Sélection des produits</h1>

      <Input
        placeholder="Rechercher un produit"
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
      />

      {recherche && (
        <div className="space-y-2 border rounded mt-2 p-2 bg-white">
          {produitsFiltres.map((p) => (
            <div
              key={p.id}
              className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
              onClick={() => ajouterProduit(p)}
            >
              {p.nom}
            </div>
          ))}
          {produitsFiltres.length === 0 && (
            <p className="text-gray-500 text-sm">Aucun produit trouvé</p>
          )}
        </div>
      )}

      {selectionnes.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold">Produits sélectionnés</h2>
          {selectionnes.map((produit) => (
            <Card key={produit.id} className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{produit.nom}</h3>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => retirerProduit(produit.id)}
                >
                  Retirer
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={produit.statut === 'fonctionnel' ? 'default' : 'outline'}
                  onClick={() => modifierStatut(produit.id, 'fonctionnel')}
                >
                  Fonctionnel
                </Button>
                <Button
                  variant={produit.statut === 'a_remplacer' ? 'default' : 'outline'}
                  onClick={() => modifierStatut(produit.id, 'a_remplacer')}
                >
                  À remplacer
                </Button>
              </div>

              <Textarea
                placeholder="Remarque optionnelle"
                value={produit.remarque || ''}
                onChange={(e) => modifierRemarque(produit.id, e.target.value)}
              />

              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) ajouterPhoto(produit.id, file);
                  }}
                />
              </div>

              {(produit.photos ?? []).length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {produit.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo.url}
                      alt={photo.name}
                      className="h-24 w-full object-cover rounded border"
                    />
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
