'use client';

import { useState } from 'react';

type Produit = {
  id: string;
  nom: string;
};

type Props = {
  produit: Produit;
  onAdd: (data: {
    produit_id: string;
    etat: 'fonctionnel' | 'a_changer';
    remarque?: string;
    photo?: File;
  }) => void;
};

export default function ProduitItem({ produit, onAdd }: Props) {
  const [etat, setEtat] = useState<'fonctionnel' | 'a_changer'>('fonctionnel');
  const [remarque, setRemarque] = useState('');
  const [photo, setPhoto] = useState<File | undefined>(undefined);

  const handleAdd = () => {
    onAdd({
      produit_id: produit.id,
      etat,
      remarque,
      photo,
    });

    // Réinitialiser le formulaire local après ajout
    setEtat('fonctionnel');
    setRemarque('');
    setPhoto(undefined);
  };

  return (
    <div className="border rounded p-4 space-y-4 shadow-sm bg-white">
      <div>
        <p className="font-semibold text-lg">{produit.nom}</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">État du produit</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name={`etat-${produit.id}`}
              value="fonctionnel"
              checked={etat === 'fonctionnel'}
              onChange={() => setEtat('fonctionnel')}
            />
            Fonctionnel
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name={`etat-${produit.id}`}
              value="a_changer"
              checked={etat === 'a_changer'}
              onChange={() => setEtat('a_changer')}
            />
            À changer
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Remarque (optionnel)</label>
        <textarea
          className="w-full border p-2 rounded"
          rows={2}
          placeholder="Ex: produit légèrement abîmé, test OK, etc."
          value={remarque}
          onChange={(e) => setRemarque(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Photo (optionnel)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setPhoto(file);
          }}
        />
      </div>

      <div className="pt-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleAdd}
        >
          Ajouter à la fiche
        </button>
      </div>
    </div>
  );
}
