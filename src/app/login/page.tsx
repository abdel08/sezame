'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [nom, setNom] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      // Étape 1 : trouver le profil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('nom', nom)
        .single();

      if (profileError || !profileData) {
        setError('Nom invalide ou utilisateur introuvable');
        return;
      }

      const userId = profileData.id;

      // Étape 2 : générer l’email fictif
      const email = `${nom.replace(/\s+/g, '').toLowerCase()}@app.local`;

      // Étape 3 : tentative de login
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError || !loginData.user) {
        setError('Mot de passe incorrect ou utilisateur invalide');
        return;
      }

      // Étape 4 : vérifier le rôle
      const { data: roleData, error: roleError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', loginData.user.id)
        .single();

      if (roleError || !roleData) {
        setError('Impossible de récupérer le rôle.');
        return;
      }

      if (roleData.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (roleData.role === 'technicien') {
        router.push('/technicien/accueil');
      } else {
        setError('Rôle inconnu.');
      }
    } catch (err) {
      console.error('Erreur de connexion :', err);
      setError('Une erreur inattendue est survenue.');
    }
  };

  return (
    <main className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Connexion</h1>

      <form onSubmit={handleLogin} className="space-y-4 w-full max-w-xs">
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <input
          type="text"
          placeholder="Nom"
          className="border p-2 w-full rounded"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          className="border p-2 w-full rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-600 text-white p-2 w-full rounded">
          Se connecter
        </button>
      </form>
    </main>
  );
}
