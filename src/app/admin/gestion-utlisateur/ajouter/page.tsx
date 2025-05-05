'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type FormState = {
  nom: string;
  password: string;
  role: 'technicien' | 'admin';
};

export default function AjouterUtilisateur() {
  const [form, setForm] = useState<FormState>({
    nom: '',
    password: '',
    role: 'technicien',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.nom || !form.password) {
      setError('Tous les champs sont obligatoires.');
      return;
    }

    try {
      const response = await fetch(
        'https://safwzkcdomnvlggzxjdr.supabase.co/functions/v1/create-user',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Erreur lors de la création');
        return;
      }

      setSuccess('Utilisateur créé avec succès !');
      setTimeout(() => router.push('/admin/dashboard'), 1000);
    } catch (err) {
      console.error('Erreur de requête :', err);
      setError('Erreur réseau ou serveur');
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ajouter un utilisateur</h1>

      {error && <p className="text-red-600 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Nom (identifiant)</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block font-medium">Mot de passe</label>
          <input
            type="password"
            className="w-full border p-2 rounded"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block font-medium">Rôle</label>
          <select
            className="w-full border p-2 rounded"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as FormState['role'] })}
          >
            <option value="technicien">Technicien</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Créer l&#39;utilisateur
        </button>
      </form>
    </main>
  );
}
